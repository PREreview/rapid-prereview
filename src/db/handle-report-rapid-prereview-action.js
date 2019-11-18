import Ajv from 'ajv';
import schema from '../schemas/report-rapid-prereview-action';
import { getId, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

/**
 * Any non moderated user can flag reviews as violating the Code of Conduct
 */
export default async function handleReportRapidPrereviewAction(
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
  // if agent is moderated, he/she cannot moderate
  const agent = await this.get(getId(action.agent));
  if (agent.isModerated) {
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
