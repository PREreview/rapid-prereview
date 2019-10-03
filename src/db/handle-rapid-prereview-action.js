import Ajv from 'ajv';
import schema from '../schemas/rapid-prereview-action';
import resolve from '../utils/resolve';
import { getId, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleRapidPrereviewAction(
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
    !arrayify(user.hasRole).some(role => getId(role) === getId(action.agent))
  ) {
    throw createError(403, 'Forbidden');
  }

  const identifier = getId(action.object);

  return action;
}
