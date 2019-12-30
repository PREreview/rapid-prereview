import email from '@sendgrid/mail';
import uniq from 'lodash/uniq';
import { getId, unprefix } from '../utils/jsonld';
import {
  ORG,
  SENDER_EMAIL_HREF,
  CONTACT_EMAIL_HREF,
  PRODUCTION_DOMAIN
} from '../constants';

export function createSendgridEmailClient(config = {}) {
  if (config.sendgridApiKey === null) {
    return null;
  }
  const apiKey = config.sendgridApiKey || process.env.SENDGRID_API_KEY;

  if (apiKey) {
    email.setApiKey(apiKey);
    return email;
  }

  return null;
}

export async function createEmailMessages(
  { db },
  action // result from db.post (so `action.result` is defined)
) {
  const messages = [];

  switch (action['@type']) {
    case 'RegisterAction':
      if (action.isFirstTimeLogin) {
        const roles = action.resultRole;
        const publicRole = roles.find(
          role => role['@type'] === 'PublicReviewerRole'
        );
        const anonRole = roles.find(
          role => role['@type'] === 'AnonymousReviewerRole'
        );

        messages.push({
          from: unprefix(SENDER_EMAIL_HREF),
          to: unprefix(CONTACT_EMAIL_HREF),
          subject: 'New user registration',
          text: `Hello,

A new user just registered.

- public profile: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(publicRole))}
- anonymous profile: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(anonRole))}

Have a good day!
          `
        });
      }
      break;

    case 'ReportRapidPREreviewAction': {
      const reviewAction = action.result;

      messages.push({
        from: unprefix(SENDER_EMAIL_HREF),
        to: unprefix(CONTACT_EMAIL_HREF),
        subject: 'New moderation report',
        text: `Hello,

A new moderation report was just posted.

- reported by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${reviewAction.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
          getId(reviewAction.object.doi || reviewAction.object.arXivId)
        )}?role=${unprefix(getId(reviewAction.agent))}

You can act on it from your moderation panel: ${PRODUCTION_DOMAIN}/moderate

Have a good day!
        `
      });
      break;
    }

    case 'RapidPREreviewAction': {
      // admin message
      messages.push({
        from: unprefix(SENDER_EMAIL_HREF),
        to: unprefix(CONTACT_EMAIL_HREF),
        subject: `New Rapid PREreview for "${action.object.name}"`,
        text: `Hello,

A new Rapid PREreview was just posted.

- posted by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${action.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
          getId(action.object.doi || action.object.arXivId)
        )}

Have a good day!
        `
      });

      // requesters message
      const requests = await db.getRequestsByPreprintId(getId(action.object));
      const roleIds = requests
        .map(request => getId(request.agent))
        .filter(roleId => roleId && roleId !== getId(action.agent));

      const users = await db.getUsersByRoleIds(roleIds);

      const to = uniq(
        users
          .filter(user => user.contactPoint && user.contactPoint.email)
          .map(user => unprefix(user.contactPoint.email))
      );

      if (to.length) {
        messages.push({
          from: unprefix(SENDER_EMAIL_HREF),
          to,
          subject: `New Rapid PREreview for "${action.object.name}"`,
          text: `Hello,

A new Rapid PREreview was just posted for a preprint for which you requested reviews (${
            action.object.name
          }).

You can view:
- the review by visiting ${PRODUCTION_DOMAIN}/${unprefix(
            getId(action.object.doi || action.object.arXivId)
          )}?role=${unprefix(getId(action.agent))}.
- the reviewer profile by visiting ${PRODUCTION_DOMAIN}/about/${unprefix(
            getId(action.agent)
          )}

Have a good day!
        `,
          isMultiple: !!(to.length > 1)
        });
      }

      break;
    }

    case 'RequestForRapidPREreviewAction': {
      messages.push({
        from: unprefix(SENDER_EMAIL_HREF),
        to: unprefix(CONTACT_EMAIL_HREF),
        subject: `New Request for Rapid PREreview for "${action.object.name}"`,
        text: `Hello,

A new Request for Rapid PREreview was just posted.

- posted by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${action.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
          getId(action.object.doi || action.object.arXivId)
        )}

Have a good day!
        `
      });
      break;
    }

    case 'UpdateContactPointAction': {
      // if email address was updated
      if (
        action.result.contactPoint &&
        action.result.contactPoint.email &&
        action.result.contactPoint.token &&
        action.result.contactPoint.token['@type'] ===
          'ContactPointVerificationToken' &&
        action.result.contactPoint.token.value &&
        action.result.contactPoint.token.dateCreated ===
          action.result.dateModified
      ) {
        messages.push({
          from: unprefix(SENDER_EMAIL_HREF),
          to: unprefix(action.result.contactPoint.email),
          subject: `Verify your email address for {ORG}`,
          text: `Hello,

We need to verify that this email address belongs to you and that you want to use it to receive notifications from ${ORG}.

If that is the case, please click on the following link: ${PRODUCTION_DOMAIN}/verify?token=${action.result.contactPoint.token.value}.

Otherwise, you can ignore this email.

Have a good day!
  `
        });
      }
      break;
    }

    default:
      break;
  }

  return messages;
}
