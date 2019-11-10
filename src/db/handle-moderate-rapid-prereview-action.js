import Ajv from 'ajv';
import schema from '../schemas/moderate-rapid-prereview-action';
import { getId, arrayify, cleanup } from '../utils/jsonld';
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

  const review = await this.get(getId(action.object));

  const nextReview = cleanup(
    Object.assign({}, review, {
      actionStatus: 'ModeratedActionStatus',
      moderationReason: action.moderationReason,
      moderatedTime: now
    })
  );

  const resp = await this.docs.insert(nextReview, getId(nextReview));

  return Object.assign({}, action, {
    result: Object.assign({}, nextReview, {
      _id: resp.id,
      _rev: resp.rev
    })
  });
}
