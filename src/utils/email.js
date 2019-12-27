import email from '@sendgrid/mail';
import { getId, unprefix } from '../utils/jsonld';
import {
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

export async function sendEmails(
  { emailClient, db, redis },
  action // result from db.post (so `action.result` is defined)
) {
  let subject, text;

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

        subject = 'New user registration';
        text = `Hello,

A new user just registered.

- public profile: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(publicRole))}
- anonymous profile: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(anonRole))}

Have a good day!
        `;
      }
      break;

    case 'ReportRapidPREreviewAction': {
      const reviewAction = action.result;
      subject = 'New moderation report';
      text = `Hello,

A new moderation report was just posted.

- reported by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${reviewAction.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
        getId(reviewAction.object.doi || reviewAction.object.arXivId)
      )}?role=${unprefix(getId(reviewAction.agent))}

You can act on it from your moderation panel: ${PRODUCTION_DOMAIN}/moderate

Have a good day!
      `;
      break;
    }

    case 'RapidPREreviewAction': {
      subject = 'New Rapid PREreview';
      text = `Hello,

A new Rapid PREreview was just posted.

- posted by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${action.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
        getId(action.object.doi || action.object.arXivId)
      )}?role=${unprefix(getId(action.agent))}

Have a good day!
      `;

      // TODO email every user who posted a request for review and have notification enabled

      break;
    }

    case 'RequestForRapidPREreviewAction': {
      subject = 'New Request for Rapid PREreview';
      text = `Hello,

A new Request for Rapid PREreview was just posted.

- posted by: ${PRODUCTION_DOMAIN}/about/${unprefix(getId(action.agent))}
- about:
  - title: ${action.object.name}
  - url: ${PRODUCTION_DOMAIN}/${unprefix(
        getId(action.object.doi || action.object.arXivId)
      )}

Have a good day!
      `;
      break;
    }

    default:
      break;
  }

  if (subject || text) {
    return [
      emailClient.send({
        from: unprefix(SENDER_EMAIL_HREF),
        to: unprefix(CONTACT_EMAIL_HREF),
        subject,
        text
      })
    ];
  }

  return [];
}
