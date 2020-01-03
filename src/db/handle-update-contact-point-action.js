import crypto from 'crypto';
import Ajv from 'ajv';
import schema from '../schemas/update-contact-point-action';
import { getId, unprefix } from '../utils/jsonld';
import { createError } from '../utils/errors';
import { createUserId, createContactPointId } from '../utils/ids';

export default async function handleUpdateContactPointAction(
  action,
  { strict = true, user = null, now = new Date().toISOString() } = {}
) {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, action);
  if (!isValid) {
    throw createError(400, ajv.errorsText());
  }

  // acl
  if (
    !user ||
    getId(user) !== getId(action.agent) ||
    getId(user) !== createUserId(action.object)
  ) {
    throw createError(403, 'Forbidden');
  }

  // Extra validation for email
  // The regexp is from `ajv` for the format validation.
  // Note that we don't user `format: email` in the schema as we use the mailto:prefix
  if (action.payload.email) {
    const reEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!reEmail.test(unprefix(action.payload.email))) {
      throw createError(400, `Invalid email ${action.payload.email}`);
    }
  }

  const nextUser = await this.get(getId(user), { user, raw: true });
  const isEmailUpdated =
    action.payload.email &&
    (nextUser.contactPoint || {}).email !== action.payload.email;

  Object.assign(nextUser, {
    contactPoint: Object.assign(
      {
        '@id': createContactPointId(getId(nextUser)),
        '@type': 'ContactPoint',
        token: {
          '@type': 'ContactPointVerificationToken',
          value: crypto.randomBytes(16).toString('hex'),
          dateCreated: now // used for email logic: if `token.dateCreated` === `user.dateModified`, we send an email
        },
        active: false,
        dateVerified: null
      },
      nextUser.contactPoint,
      action.payload,
      // if email is updated we need to reset `dateVerified` and the verification token
      isEmailUpdated
        ? {
            token: {
              '@type': 'ContactPointVerificationToken',
              value: crypto.randomBytes(16).toString('hex'),
              dateCreated: now
            },
            dateVerified: null
          }
        : undefined
    ),
    dateModified: now
  });

  const resp = await this.users.insert(nextUser, getId(nextUser));

  // Note: we return the `token` here so that it can be used for the
  // verification email.
  // `token` is removed in the API route with the `omitPrivate` util
  return Object.assign({}, action, {
    result: Object.assign({}, nextUser, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
