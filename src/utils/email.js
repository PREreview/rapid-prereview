import email from '@sendgrid/mail';
import { getId, unprefix } from '../utils/jsonld';
import {
  SENDER_EMAIL_HREF,
  CONTACT_EMAIL_HREF,
  PRODUCTION_DOMAIN
} from '../constants';

export function createSendgridEmailClient(config = {}) {
  const apiKey = config.sendgridApiKey || process.env.SENDGRID_API_KEY;

  if (apiKey) {
    email.setApiKey(apiKey);
    return email;
  }

  return null;
}

export async function sendEmails({ emailClient, db, redis }, action) {
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
      subject = 'New moderation report';
      break;
    }

    case 'RapidPREreviewAction': {
      subject = 'New Rapid PREreview';
      break;
    }

    case 'RequestForRapidPREreviewAction': {
      subject = 'New Request for Rapid PREreview';
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
