import Ajv from 'ajv';
import schema from '../schemas/moderate-role-action';
import { getId, cleanup } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleModerateRoleAction(
  action,
  { strict = true, user = null, now = new Date().toISOString() } = {}
) {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, action);
  if (!isValid) {
    throw createError(400, ajv.errorsText());
  }

  // acl
  if (!user || !user.isAdmin || getId(user) !== getId(action.agent)) {
    throw createError(403, 'Forbidden');
  }

  const role = await this.get(getId(action.object));

  const nextRole = cleanup(
    Object.assign({}, role, {
      isModerated: true,
      moderationReason: action.moderationReason,
      modifiedDate: now
    })
  );

  const resp = await this.docs.insert(nextRole, getId(nextRole));

  return Object.assign({}, action, {
    result: Object.assign({}, nextRole, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
