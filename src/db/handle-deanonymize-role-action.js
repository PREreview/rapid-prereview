import Ajv from 'ajv';
import schema from '../schemas/deanonymize-role-action';
import { getId, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function deanonymizeRoleAction(
  action,
  { strict = true, user = null, now = new Date().toISOString() } = {}
) {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, action);
  if (!isValid) {
    throw createError(400, ajv.errorsText());
  }

  const roleId = getId(action.object);

  // acl
  if (
    !user ||
    getId(user) !== getId(action.agent) ||
    !arrayify(user.hasRole).some(role => getId(role) === roleId)
  ) {
    throw createError(403, 'Forbidden');
  }

  const role = await this.get(roleId);

  const nextRole = Object.assign({}, role, action.payload, {
    '@type': 'PublicReviewerRole',
    isRoleOf: getId(user)
  });

  const resp = await this.docs.insert(nextRole, getId(nextRole));

  return Object.assign({}, action, {
    result: Object.assign({}, nextRole, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
