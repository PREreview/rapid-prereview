import orcidUtils from 'orcid-utils';
import uuid from 'uuid';
import { getId, unprefix, cleanup } from '../utils/jsonld';

export default async function handleRegisterAction(
  action,
  { strict = true } = {}
) {
  const orcid = unprefix(getId(action.agent));

  if (!orcidUtils.isValid(orcid)) {
    throw new Error('');
  }

  const roleId = `role:${uuid.v4()}`;

  const user = cleanup({
    '@id': `user:${orcidUtils.toDashFormat(orcid)}`,
    name: action.agent.name,
    hasRole: {
      '@id': roleId,
      '@type': 'AnonymousReviewerRole',
      name: unprefix(roleId),
      startDate: new Date().toISOString()
    }
  });

  const doc = await this.users.insert(user, getId(user));

  return Object.assign({}, action, {
    result: Object.assign({}, user, { _id: doc.id, _rev: doc.rev })
  });
}
