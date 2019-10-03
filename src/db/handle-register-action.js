import orcidUtils from 'orcid-utils';
import uuid from 'uuid';
import { getId, unprefix, cleanup } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default async function handleRegisterAction(
  action,
  { strict = true, now = new Date().toISOString() } = {}
) {
  const orcid = unprefix(getId(action.agent.orcid));

  if (!orcidUtils.isValid(orcid)) {
    throw createError(400, `Invalid ORCID (${orcid})`);
  }

  const roleId = `role:${uuid.v4()}`;

  const user = cleanup({
    '@id': `user:${orcidUtils.toDashFormat(orcid)}`,
    '@type': 'Person',
    orcid: orcidUtils.toDashFormat(orcid),
    name: action.agent.name,
    hasRole: [
      {
        '@id': roleId,
        '@type': 'AnonymousReviewerRole',
        name: unprefix(roleId),
        startDate: new Date().toISOString()
      }
    ]
  });

  const doc = await this.users.insert(user, getId(user));

  return Object.assign({}, action, {
    agent: getId(user),
    startTime: now,
    endTime: now,
    result: Object.assign({}, user, { _id: doc.id, _rev: doc.rev })
  });
}
