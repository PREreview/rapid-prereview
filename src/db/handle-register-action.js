import orcidUtils from 'orcid-utils';
import uuid from 'uuid';
import pick from 'lodash/pick';
import groupBy from 'lodash/groupBy';
import { arrayify, getId, unprefix, cleanup } from '../utils/jsonld';
import { createError } from '../utils/errors';

/**
 * Create (or update) an user
 *
 * !! RegisterAction is called every time the user login / authenticate with
 * ORCID
 */
export default async function handleRegisterAction(
  action,
  { strict = true, now = new Date().toISOString() } = {}
) {
  const orcid = unprefix(getId(action.agent.orcid));

  if (!orcidUtils.isValid(orcid)) {
    throw createError(400, `Invalid ORCID (${orcid})`);
  }

  const userId = `user:${orcidUtils.toDashFormat(orcid)}`;

  // Get previous user (if any) and merge conflicts (if any)
  let body;
  try {
    body = await this.users.get(userId, { open_revs: 'all' });
  } catch (err) {
    if (err.statusCode === 404) {
      body = [];
    } else {
      throw err;
    }
  }

  const docs = body
    .filter(entry => entry.ok && !entry.ok._deleted)
    .map(entry => entry.ok);

  let merged;
  if (docs.length) {
    const specialProps = ['token', 'hasRole', '_rev'];

    // merge all leaf docs (conflicting)
    merged = docs.reduce((merged, doc) => {
      if (
        new Date(merged.dateModified).getTime() <
        new Date(doc.dateModified).getTime()
      ) {
        merged = Object.assign(
          pick(merged, specialProps),
          pick(doc, Object.keys(doc).filter(p => !specialProps.includes(p)))
        );
      }

      // `token`: latest wins
      if (
        (!merged.token && doc.token) ||
        (merged.token &&
          doc.token &&
          new Date(merged.token.dateCreated).getTime() <
            new Date(doc.token.dateCreated).getTime())
      ) {
        merged.token = doc.token;
      }

      // `hasRole`
      const roles = arrayify(merged.hasRole).concat(arrayify(doc.hasRole));
      const grouped = groupBy(roles, getId);
      merged.hasRole = Object.keys(grouped).map(roleId => {
        const conflicting = grouped[roleId];
        return conflicting.reduce((merged, role) => {
          // latest wins
          if (
            new Date(merged.modifiedDate).getTime() <
            new Date(doc.modifiedDate).getTime()
          ) {
            return doc;
          }

          return merged;
        }, conflicting[0]);
      });

      return merged;
    }, Object.assign({}, docs[0]));

    // update profile props
    merged = Object.assign(
      pick(merged, specialProps),
      pick(
        action.agent,
        Object.keys(action.agent).filter(p => !specialProps.includes(p))
      ),
      {
        dateModified: now
      }
    );
  } else {
    const roleId = `role:${uuid.v4()}`;
    merged = cleanup({
      _id: userId,
      '@id': userId,
      '@type': 'Person',
      dateModified: now,
      orcid: orcidUtils.toDashFormat(orcid),
      name: action.agent.name,
      hasRole: [
        {
          '@id': roleId,
          '@type': 'AnonymousReviewerRole',
          name: unprefix(roleId),
          startDate: now,
          modifiedDate: now
        }
      ]
    });
  }

  // udpate token
  if (action.token) {
    merged.token = Object.assign({}, action.token, { dateCreated: now });
  }

  const payload = [merged].concat(
    docs.slice(1).map(doc => Object.assign({}, doc, { _deleted: true }))
  );

  const resp = await this.users.bulk({ docs: payload });

  const user = Object.assign({}, merged, {
    _rev: resp[0].rev
  });

  return Object.assign({}, action, {
    agent: getId(user),
    startTime: now,
    endTime: now,
    result: user
  });
}
