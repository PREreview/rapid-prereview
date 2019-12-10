import Ajv from 'ajv';
import omit from 'lodash/omit';
import schema from '../schemas/unmoderate-role-action';
import { getId, arrayify, cleanup } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleUnmoderateRoleAction(
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
    !user.isAdmin ||
    !arrayify(user.hasRole).some(role => getId(role) === getId(action.agent))
  ) {
    throw createError(403, 'Forbidden');
  }

  const role = await this.get(getId(action.object));

  const nextRole = cleanup(
    Object.assign(omit(role, ['moderationReason', 'moderationDate']), {
      isModerated: false,
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
