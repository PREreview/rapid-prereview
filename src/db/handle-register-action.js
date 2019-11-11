import orcidUtils from 'orcid-utils';
import Ajv from 'ajv';
import uuid from 'uuid';
import pick from 'lodash/pick';
import uniq from 'lodash/uniq';
import schema from '../schemas/register-action';
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
  {
    strict = true,
    now = new Date().toISOString(),
    isAdmin // if true make the user admin
  } = {}
) {
  const ajv = new Ajv();
  const isValid = ajv.validate(schema, action);
  if (!isValid) {
    throw createError(400, ajv.errorsText());
  }

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

  let merged, resultRoles;
  if (docs.length) {
    const specialProps = ['token', 'hasRole', '_rev']; // those need special logic to be merged

    // merge all leaf docs (conflicting)
    merged = docs.reduce((merged, doc) => {
      // all props but `specialProps` (latest wins)
      if (
        new Date(merged.dateModified).getTime() <
        new Date(doc.dateModified).getTime()
      ) {
        merged = Object.assign(
          pick(merged, specialProps),
          pick(
            doc,
            Object.keys(doc).filter(p => !specialProps.includes(p))
          )
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
      // We can NOT lose role @ids => we ALWAYS merge
      // Later we can sameAs in case the user reconciles
      merged.hasRole = uniq(
        arrayify(merged.hasRole).concat(arrayify(doc.hasRole))
      );

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
    // First time a profile is created
    const anonRoleId = `role:${uuid.v4()}`;
    const publicRoleId = `role:${uuid.v4()}`;

    resultRoles = [
      {
        _id: anonRoleId,
        '@id': anonRoleId,
        '@type': 'AnonymousReviewerRole',
        name: unprefix(anonRoleId),
        startDate: now,
        modifiedDate: now,
        isModerator: false
      },
      {
        _id: publicRoleId,
        '@id': publicRoleId,
        '@type': 'PublicReviewerRole',
        name: action.agent.name || unprefix(publicRoleId),
        startDate: now,
        modifiedDate: now,
        isRoleOf: userId,
        isModerator: false
      }
    ];

    const resp = await this.docs.bulk({ docs: resultRoles });
    if (!resp.every(resp => resp.ok)) {
      throw createError(500, `Could not create roles for ${userId}`);
    }
    const revMap = resp.reduce((map, r) => {
      map[r.id] = r.rev;
      return map;
    }, {});

    resultRoles.forEach(role => {
      role._rev = revMap[role._id];
    });

    merged = cleanup({
      _id: userId,
      '@id': userId,
      '@type': 'Person',
      dateCreated: now,
      dateModified: now,
      orcid: orcidUtils.toDashFormat(orcid),
      name: action.agent.name,
      defaultRole: anonRoleId,
      hasRole: resultRoles.map(getId),
      isAdmin: !!isAdmin
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

  return cleanup(
    Object.assign({}, action, {
      agent: getId(user),
      startTime: now,
      endTime: now,
      result: user,
      resultRole: resultRoles
    })
  );
}
