import Ajv from 'ajv';
import schema from '../schemas/verify-contact-point-action';
import { getId } from '../utils/jsonld';
import { createError } from '../utils/errors';
import { createUserId } from '../utils/ids';

export default async function handleVerifyContactPointAction(
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

  const nextUser = await this.get(getId(user), { user, raw: true });

  if (
    !nextUser.contactPoint ||
    !nextUser.contactPoint.token ||
    nextUser.contactPoint.token.value !== action.token.value
  ) {
    throw createError(403, 'Invalid token');
  }

  Object.assign(nextUser, {
    contactPoint: Object.assign({}, nextUser.contactPoint, {
      dateVerified: now
    }),
    dateModified: now
  });

  const resp = await this.users.insert(nextUser, getId(nextUser));

  return Object.assign({}, action, {
    result: Object.assign({}, nextUser, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
