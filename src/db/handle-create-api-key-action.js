import Ajv from 'ajv';
import uuid from 'uuid';
import schema from '../schemas/create-api-key-action';
import { getId } from '../utils/jsonld';
import { createError } from '../utils/errors';

/**
 * Note: this can be call several time and will just overwrite the previous
 * API key
 */
export default async function handleCreateApiKeyAction(
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
    getId(user) !== getId(action.object)
  ) {
    throw createError(403, 'Forbidden');
  }

  const recipient = await this.get(getId(action.object), { raw: true });

  const nextRecipient = Object.assign({}, recipient, {
    apiKey: {
      '@type': 'ApiKey',
      value: uuid.v4(),
      dateCreated: now
    },
    dateModified: now
  });

  const resp = await this.docs.insert(nextRecipient, getId(nextRecipient));

  return Object.assign({}, action, {
    result: Object.assign({}, nextRecipient, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
