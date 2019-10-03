import Ajv from 'ajv';
import slug from 'slug';
import schema from '../schemas/rapid-prereview-action';
import resolve from '../utils/resolve';
import { getId, arrayify, unprefix, nodeify } from '../utils/jsonld';
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

  let object;
  try {
    object = await resolve(identifier, this.config);
    object = Object.assign(object, {
      sdRetrievedFields: Object.keys(object),
      sdDateRetrieved: now
    });
  } catch (err) {
    object = Object.assign(
      {
        '@type': 'ScholarlyPreprint',
        [identifier.startsWith('arXiv:') ? 'arXivId' : 'doi']: identifier
      },
      nodeify(action.object)
    );
  }

  const unprefixedPreprintId = `${
    identifier.startsWith('arXiv:') ? 'arxiv' : 'doi'
  }-${slug(unprefix(identifier).replace('/', '-'))}`;

  const handledAction = Object.assign({}, action, {
    '@id': `review:${unprefix(getId(action.agent))}@${unprefixedPreprintId}`,
    startTime: now,
    endTime: now,
    actionStatus: 'CompletedActionStatus',
    object: Object.assign(
      {
        '@id': `preprint:${unprefixedPreprintId}`
      },
      object
    )
  });

  const resp = await this.docs.insert(handledAction, getId(action));

  return Object.assign(handledAction, { _id: resp.id, _rev: resp.rev });
}
