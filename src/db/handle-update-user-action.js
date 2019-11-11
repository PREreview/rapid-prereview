import Ajv from 'ajv';
import schema from '../schemas/update-user-action';
import { getId } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleUpdateUserAction(
  action,
  { strict = true, user = null, now = new Date().toISOString() } = {}
) {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, action);
  if (!isValid) {
    throw createError(400, ajv.errorsText());
  }

  const userId = getId(action.object);

  // acl
  if (!user || getId(user) !== getId(action.agent)) {
    throw createError(403, 'Forbidden');
  }

  // more validation for `defaultRole`
  if (
    action.payload.defaultRole &&
    !user.hasRole.some(
      role => getId(role) === getId(action.payload.defaultRole)
    )
  ) {
    throw createError(
      400,
      `Invalid value for payload.defaultRole: ${action.payload.defaultRole} could not be find in ${userId}`
    );
  }

  const nextUser = await this.get(userId, { user, raw: true });

  Object.assign(nextUser, action.payload, { dateModified: now });

  const resp = await this.users.insert(nextUser, getId(nextUser));

  return Object.assign({}, action, {
    result: Object.assign({}, nextUser, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
