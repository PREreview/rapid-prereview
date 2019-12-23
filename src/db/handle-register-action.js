import orcidUtils from 'orcid-utils';
import flatten from 'lodash/flatten';
import Ajv from 'ajv';
import uuid from 'uuid';
import pick from 'lodash/pick';
import schema from '../schemas/register-action';
import { getId, unprefix, cleanup, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';
import { mergeUserConflicts } from '../utils/conflicts';
import { getOrcidProfile } from '../utils/orcid';
import { createUserId } from '../utils/ids';

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
    isAdmin, // if true make the user admin
    isModerator // if true make the user moderator (for all his/her roles)
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

  const userId = createUserId(orcid);

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

  let isFirstTimeLogin = false;

  const docs = body
    .filter(entry => entry.ok && !entry.ok._deleted)
    .map(entry => entry.ok);

  let merged, resultRoles;
  if (docs.length) {
    const specialProps = ['token', 'hasRole', '_rev']; // those need special logic to be merged

    // merge all leaf docs (conflicting)
    merged = mergeUserConflicts(docs);

    // update profile props
    merged = Object.assign(
      {},
      merged,
      pick(
        action.agent,
        Object.keys(action.agent).filter(p => !specialProps.includes(p))
      ),
      {
        dateModified: now
      }
    );
  } else {
    isFirstTimeLogin = true;

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
        isModerator: !!isModerator
      },
      {
        _id: publicRoleId,
        '@id': publicRoleId,
        '@type': 'PublicReviewerRole',
        name: action.agent.name || unprefix(publicRoleId),
        startDate: now,
        modifiedDate: now,
        isRoleOf: userId,
        isModerator: !!isModerator
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

  // try to get the user email so we can subscribe the user to the
  // notifications (we only do that if the user never set a contact point
  if (merged.token && !merged.contactPoint) {
    let profile;
    try {
      profile = await getOrcidProfile(orcid, action.token);
    } catch (err) {
      // noop;
    }
    if (profile) {
      const emails = flatten(
        arrayify(profile.emails).map(email => email.email)
      ).filter(Boolean);
      const email = emails[0];
      if (email) {
        merged.contactPoint = {
          '@type': 'ContactPoint',
          contactType: 'notifications',
          active: true,
          email: `mailto:${unprefix(email)}`,
          dateVerified: now
        };
      }
    }
  }

  const payload = [merged].concat(
    docs.slice(1).map(doc => Object.assign({}, doc, { _deleted: true }))
  );

  const resp = await this.users.bulk({ docs: payload });

  if (!resp[0].ok) {
    throw createError(
      resp[0].error === 'conflict' ? 409 : 500,
      resp[0].reason || 'something went wrong'
    );
  }

  const user = Object.assign({}, merged, {
    _rev: resp[0].rev
  });

  return cleanup(
    Object.assign({}, action, {
      agent: getId(user),
      startTime: now,
      endTime: now,
      result: user,
      resultRole: resultRoles,
      isFirstTimeLogin
    })
  );
}
