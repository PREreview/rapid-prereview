import Ajv from 'ajv';
import schema from '../schemas/moderate-rapid-prereview-action';
import { getId, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleModerateRapidPrereviewAction(
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
  // if agent is moderated or is not moderator, he/she cannot moderate
  const agent = await this.get(getId(action.agent));
  if (agent.isModerated || !agent.isModerator) {
    throw createError(403, 'Forbidden');
  }

  const handledAction = Object.assign(
    {
      startTime: now,
      actionStatus: 'CompletedActionStatus'
    },
    action,
    {
      endTime: now
    }
  );

  const nextReview = await this.syncModerationAction(handledAction);

  return Object.assign({}, action, {
    result: nextReview
  });
}
