import Cloudant from '@cloudant/cloudant';
import omit from 'lodash/omit';
import flatten from 'lodash/flatten';
import handleRegisterAction from './handle-register-action';
import handleCreateApiKeyAction from './handle-create-api-key-action';
import handleRapidPrereviewAction from './handle-rapid-prereview-action';
import handleDeanonimyzeRoleAction from './handle-deanonymize-role-action';
import handleUpdateRoleAction from './handle-update-role-action';
import handleUpdateUserAction from './handle-update-user-action';
import handleUpdateContactPointAction from './handle-update-contact-point-action';
import handleVerifyContactPointAction from './handle-verify-contact-point-action';
import handleRequestForRapidPrereviewAction from './handle-request-for-rapid-prereview-action';
import handleGrantModeratorRoleAction from './handle-grant-moderator-role-action';
import handleRevokeModeratorRoleAction from './handle-revoke-moderator-role-action';
import handleModerateRoleAction from './handle-moderate-role-action';
import handleUnmoderateRoleAction from './handle-unmoderate-role-action';
import handleModerateRapidPrereviewAction from './handle-moderate-rapid-prereview-action';
import handleReportRapidPrereviewAction from './handle-report-rapid-prereview-action';
import handleIgnoreReportRapidPrereviewAction from './handle-ignore-report-rapid-prereview-action';
import ddocDocs from '../ddocs/ddoc-docs';
import ddocUsers from '../ddocs/ddoc-users';
import ddocIndex from '../ddocs/ddoc-index';
import { getId, unprefix, nodeify, cleanup, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';
import { INDEXED_PREPRINT_PROPS, QUESTIONS } from '../constants';
import { getScore, SCORE_THRESHOLD } from '../utils/score';
import striptags from '../utils/striptags';
import { dehydrateAction } from '../utils/preprints';
import { getUniqueModerationActions } from '../utils/actions';
import {
  mergePreprintConflicts,
  mergeReviewActionConflicts,
  mergeUserConflicts
} from '../utils/conflicts';

export default class DB {
  constructor(config = {}) {
    this.config = config;

    const username =
      this.config.couchUsername || process.env.COUCH_USERNAME || 'admin';
    const password =
      this.config.couchPassword || process.env.COUCH_PASSWORD || 'pass';
    const protocol =
      this.config.couchProtocol || process.env.COUCH_PROTOCOL || 'http:';
    const host = this.config.couchHost || process.env.COUCH_HOST || '127.0.0.1';
    const port = this.config.couchPort || process.env.COUCH_PORT || '5984';

    this.docsDbName =
      this.config.couchDocsDbName ||
      process.env.COUCH_DOCS_DB_NAME ||
      'rapid-prereview-docs';
    this.indexDbName =
      this.config.couchIndexDbName ||
      process.env.COUCH_INDEX_DB_NAME ||
      'rapid-prereview-index';
    this.usersDbName =
      this.config.couchUsersDbName ||
      process.env.COUCH_USERS_DB_NAME ||
      'rapid-prereview-users';

    const cloudant = new Cloudant({
      username,
      password,
      url: `${protocol}//${host}:${port}`,
      maxAttempt: 5,
      plugins: [
        'cookieauth',
        {
          retry: {
            retryErrors: true,
            retryStatusCodes: [429, 500, 501, 502, 503, 504],
            retryDelayMultiplier: 2,
            retryInitialDelayMsecs: 500
          }
        }
      ]
    });

    this.cloudant = cloudant;
    this.docs = cloudant.use(this.docsDbName);
    this.index = cloudant.use(this.indexDbName);
    this.users = cloudant.use(this.usersDbName);
  }

  async init({ reset = false, waitFor = 1000 } = {}) {
    async function setup(dbName) {
      if (reset) {
        try {
          await this.cloudant.db.destroy(dbName);
        } catch (err) {
          if (err.error !== 'not_found') {
            throw err;
          }
        }
      }

      let resp;
      try {
        resp = await this.cloudant.db.create(dbName);
      } catch (err) {
        if (err.error !== 'file_exists') {
          throw err;
        }
      }

      return Object.assign({ dbName }, resp);
    }

    const res = await Promise.all([
      setup.call(this, this.docsDbName),
      setup.call(this, this.indexDbName),
      setup.call(this, this.usersDbName)
    ]);

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, waitFor);
    });

    return res;
  }

  async ddoc({ waitFor = 1000 } = {}) {
    function toUnnamedString(f) {
      const str = f
        .toString()
        .replace('// @inject(striptags)', striptags.toString());

      // we remove the function name as it creates issue
      return 'function ' + str.slice(str.indexOf('('));
    }

    function stringify(ddoc) {
      return Object.keys(ddoc).reduce((sddoc, key) => {
        const value = ddoc[key];
        if (key === 'indexes') {
          sddoc[key] = Object.keys(value).reduce((sindexes, name) => {
            sindexes[name] = Object.assign({}, value[name], {
              index: toUnnamedString(value[name].index)
            });
            return sindexes;
          }, {});
        } else if (key === 'views') {
          sddoc[key] = Object.keys(value).reduce((sviews, name) => {
            sviews[name] = Object.assign({}, value[name], {
              map: toUnnamedString(value[name].map)
            });
            return sviews;
          }, {});
        } else {
          sddoc[key] = value;
        }
        return sddoc;
      }, {});
    }

    const revMap = await Promise.all([
      this.docs.head(ddocDocs._id).catch(err => {
        // noop
      }),
      this.users.head(ddocUsers._id).catch(err => {
        // noop
      }),
      this.index.head(ddocIndex._id).catch(err => {
        // noop
      })
    ]).then(heads => {
      return heads.filter(Boolean).reduce((map, head) => {
        const _id = head.uri
          .split('/')
          .slice(-2)
          .join('/');
        map[_id] = head.etag.replace(/"/g, '');

        return map;
      }, {});
    });

    const resps = await Promise.all([
      this.docs.insert(
        Object.assign(
          revMap[ddocDocs._id] ? { _rev: revMap[ddocDocs._id] } : {},
          stringify(ddocDocs)
        )
      ),
      this.users.insert(
        Object.assign(
          revMap[ddocUsers._id] ? { _rev: revMap[ddocUsers._id] } : {},
          stringify(ddocUsers)
        )
      ),
      this.index.insert(
        Object.assign(
          revMap[ddocIndex._id] ? { _rev: revMap[ddocIndex._id] } : {},
          stringify(ddocIndex)
        )
      )
    ]);

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, waitFor);
    });

    return resps;
  }

  async secure() {
    //  see https://cloud.ibm.com/docs/services/Cloudant?topic=cloudant-authorization
    const results = {};

    results.docs = await this.docs.set_security({
      nobody: [] // TODO? '_reader', '_replicator'
    });
    results.index = await this.index.set_security({
      nobody: []
    });
    results.users = await this.users.set_security({
      nobody: []
    });

    return results;
  }

  async getSecurity() {
    //  see https://cloud.ibm.com/docs/services/Cloudant?topic=cloudant-authorization
    const results = {};

    results.docs = await this.docs.get_security();
    results.index = await this.index.get_security();
    results.users = await this.users.get_security();

    return results;
  }

  async get(
    id,
    {
      user = null,
      raw = false // setting raw to `true` is the only way to get the role associated with a user
    } = {}
  ) {
    const [prefix] = id.split(':');

    switch (prefix) {
      case 'user': {
        const doc = await this.users.get(id);

        if (!raw) {
          if (doc.contactPoint) {
            delete doc.contactPoint.token;
          }
          delete doc.token;
          delete doc.apiKey;
          // To be sure not to leak identity we do not return the roles
          delete doc.defaultRole;
          delete doc.hasRole;
        }
        return doc;
      }

      case 'role': {
        const doc = await this.docs.get(id);
        return doc;
      }

      case 'review':
      case 'request':
        return this.docs.get(id);

      case 'question': {
        const question = QUESTIONS.find(
          question => question.identifier === unprefix(id)
        );
        if (!question) {
          throw createError(404, 'Not found');
        }

        return {
          '@id': id,
          '@type': question.type,
          text: question.question,
          description: question.help
        };
      }

      case 'preprint': {
        // Note we don't use `this.index.get(id)` as it may be outdated

        const actions = await this.getActionsByPreprintId(id);
        if (!actions.length) {
          throw createError(404);
        }

        const object = actions
          .map(action => action.object)
          .sort((a, b) => {
            if (a.sdRetrievedFields.length !== b.sdRetrievedFields.length) {
              return b.sdRetrievedFields.length - a.sdRetrievedFields.length;
            } else {
              return (
                new Date(b.sdDateRetrieved).getTime() -
                new Date(a.sdDateRetrieved).getTime()
              );
            }
          })[0];

        return Object.assign(object, {
          potentialAction: actions.map(dehydrateAction)
        });
      }

      default:
        throw createError(400, `invalid id`);
    }
  }

  // views
  async getUserByRoleId(roleId) {
    roleId = getId(roleId);
    const body = await this.users.view('ddoc-users', 'usersByRoleId', {
      key: roleId,
      include_docs: true,
      reduce: false
    });

    const row = body.rows[0];
    if (!row) {
      throw createError(404, `Not found (${roleId})`);
    }

    return row.doc;
  }

  async getUsersByRoleIds(roleIds) {
    const body = await this.users.view('ddoc-users', 'usersByRoleId', {
      keys: roleIds,
      include_docs: true,
      reduce: false
    });

    return body.rows.map(row => row.doc);
  }

  async getUserByContactPointVerificationToken(token) {
    const body = await this.users.view(
      'ddoc-users',
      'usersByContactPointVerificationToken',
      {
        key: token,
        include_docs: true,
        reduce: false
      }
    );

    const row = body.rows[0];
    if (!row) {
      throw createError(404, `Not found (${token})`);
    }

    return row.doc;
  }

  async getUserByApiKeyValue(value) {
    const body = await this.users.view('ddoc-users', 'usersByApiKeyValue', {
      key: value,
      include_docs: true,
      reduce: false
    });

    const row = body.rows[0];
    if (!row) {
      throw createError(404, `Not found`);
    }

    return row.doc;
  }

  async getActionsByPreprintId(preprintId) {
    preprintId = getId(preprintId);
    const body = await this.docs.view('ddoc-docs', 'actionsByObjectIdAndType', {
      startkey: [preprintId],
      endkey: [preprintId, '\ufff0'],
      include_docs: true,
      reduce: false
    });

    return body.rows.map(row => row.doc);
  }

  async getRequestsByPreprintId(preprintId) {
    preprintId = getId(preprintId);
    const body = await this.docs.view('ddoc-docs', 'actionsByObjectIdAndType', {
      key: [preprintId, 'RequestForRapidPREreviewAction'],
      include_docs: true,
      reduce: false
    });

    return body.rows.map(row => row.doc);
  }

  async getLatestTriggeringSeq() {
    const body = await this.index.view(
      'ddoc-index',
      'triggeringSeqByDateSynced',
      {
        include_docs: false,
        reduce: false,
        limit: 1,
        descending: true
      }
    );

    return body.rows && body.rows[0] ? body.rows[0].value : undefined;
  }

  async getMaxScore() {
    const body = await this.index.view(
      'ddoc-index',
      'preprintsByScoreAndDatePosted',
      {
        include_docs: false,
        reduce: false,
        limit: 1,
        descending: true
      }
    );

    return body.rows && body.rows[0] ? body.rows[0].key[0] : 1;
  }

  async getRoles(roleIds) {
    const body = await this.docs.list({
      keys: roleIds,
      include_docs: true,
      reduce: false
    });

    if (!body.rows || !body.rows.length) {
      throw createError(404);
    }

    return body.rows.map(row => row.doc);
  }

  // search
  async searchPreprints(params, { user = null } = {}) {
    const results = await this.index.search('ddoc-index', 'preprints', params);

    return results;
  }

  streamPreprints(params, { user = null } = {}) {
    return this.index.searchAsStream('ddoc-index', 'preprints', params);
  }

  async searchActions(params, { user = null } = {}) {
    const results = await this.docs.search('ddoc-docs', 'actions', params);

    return results;
  }

  streamActions(params, { user = null } = {}) {
    return this.docs.searchAsStream('ddoc-docs', 'actions', params);
  }

  async searchRoles(params, { user = null } = {}) {
    const results = await this.docs.search('ddoc-docs', 'roles', params);

    return results;
  }

  streamRoles(params, { user = null } = {}) {
    return this.docs.searchAsStream('ddoc-docs', 'roles', params);
  }

  async syncIndex(
    action, // a `RapidPREreviewAction` or `RequestForRapidPREreviewAction`
    {
      now = new Date().toISOString(),
      triggeringSeq // passed when this is called by the changes feed so we can retry easily
    } = {}
  ) {
    // we compact the action to reduce the space used by the index
    const compactedAction = dehydrateAction(action);

    const docId = getId(action.object);
    let body;
    try {
      body = await this.index.get(docId, { open_revs: 'all' });
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
      // merge all leaf docs (conflicting)
      merged = mergePreprintConflicts(docs);

      // add action to the merged document (and update score, just the numerator
      // as all the denominators are updated jointly)
      if (
        merged.sdRetrievedFields.length <
          action.object.sdRetrievedFields.length ||
        (merged.sdRetrievedFields.length ===
          action.object.sdRetrievedFields.length &&
          new Date(merged.sdDateRetrieved).getTime() <
            new Date(action.object.sdDateRetrieved).getTime())
      ) {
        INDEXED_PREPRINT_PROPS.forEach(p => {
          merged[p] = action.object[p];
        });
      }

      if (
        !merged.potentialAction.some(
          _action => getId(_action) === getId(action)
        )
      ) {
        merged.potentialAction.push(compactedAction);

        merged.score = getScore(merged.potentialAction, {
          now: merged.dateScoreLastUpdated
        });
        merged.dateScoreLastUpdated = now;
      } else {
        // handle `moderationAction`
        merged.potentialAction = merged.potentialAction.map(_action => {
          if (getId(_action) === getId(action)) {
            return cleanup(
              Object.assign({}, _action, {
                moderationAction: getUniqueModerationActions(
                  arrayify(_action.moderationAction).concat(
                    arrayify(action.moderationAction)
                  )
                )
              }),
              { removeEmptyArray: true }
            );
          } else {
            return _action;
          }
        });
      }
    } else {
      merged = Object.assign({}, nodeify(action.object), {
        _id: getId(action.object),
        score: getScore(action, { now }),
        dateScoreLastUpdated: now,
        potentialAction: [compactedAction]
      });
    }

    merged.dateSynced = now;
    if (triggeringSeq) {
      merged.triggeringSeq = triggeringSeq;
    }

    merged = cleanup(merged);

    // bulk update
    const payload = [merged].concat(
      docs.slice(1).map(doc => Object.assign({}, doc, { _deleted: true }))
    );

    const resp = await this.index.bulk({ docs: payload });

    if (!resp[0].ok) {
      const err = createError(
        resp[0].error === 'conflict' ? 409 : 500,
        resp[0].reason || 'something went wrong'
      );

      if (err.statusCode === 409) {
        // retry untill all conflicts are gone
        return await this.syncIndex(action, {
          now,
          triggeringSeq // passed when this is called by the changes feed so we can retry easily
        });
      }

      throw err;
    }

    return Object.assign({}, merged, { _rev: resp[0].rev });
  }

  /**
   * Add `action` to the `moderationAction` list of the review (`object` of
   * `action`)
   */
  async syncModerationAction(action) {
    // we resolve conflict (if any)
    const moderationAction = omit(action, ['object']);

    const reviewActionId = getId(action.object);
    let body;
    try {
      body = await this.docs.get(reviewActionId, { open_revs: 'all' });
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

    if (!docs.length) {
      throw createError(
        '400',
        `${action['@type']} could not find object ${getId(action.object)}`
      );
    }

    // merge all leaf docs (conflicting)
    // Note that the reviewAction are all identical aside from the
    // `moderationAction` list so we take the first one and just focus on merging
    // `moderationAction`
    const merged = cleanup(
      Object.assign({}, docs[0], {
        moderationAction: getUniqueModerationActions(
          flatten(docs.map(doc => arrayify(doc.moderationAction))).concat(
            moderationAction
          )
        )
      }),
      { removeEmptyArray: true }
    );

    const payload = [merged].concat(
      docs.slice(1).map(doc => Object.assign({}, doc, { _deleted: true }))
    );

    const resp = await this.docs.bulk({ docs: payload });
    if (!resp[0].ok) {
      throw createError(
        resp[0].error === 'conflict' ? 409 : 500,
        resp[0].reason || 'something went wrong'
      );
    }

    return Object.assign({}, merged, { _rev: resp[0].rev });
  }

  async updateScores({ now = new Date().toISOString() } = {}) {
    // get all docs with score > 0
    const body = await this.index.view(
      'ddoc-index',
      'preprintsByScoreAndDatePosted',
      {
        endkey: [SCORE_THRESHOLD],
        descending: true,
        reduce: false,
        include_docs: true
      }
    );

    const docs = body.rows
      .filter(row => row.doc)
      .map(({ doc }) =>
        Object.assign({}, doc, {
          dateScoreLastUpdated: now,
          score: getScore(doc.potentialAction, { now })
        })
      );

    const resps = await this.index.bulk({ docs });
    const revMap = resps.reduce((revMap, resp) => {
      if (resp.ok) {
        revMap[resp.id] = resp.rev;
      }
      return revMap;
    }, {});

    return docs.map(doc => {
      if (doc._id in revMap) {
        return Object.assign({}, doc, { _rev: revMap[doc._id] });
      }
      return doc;
    });
  }

  async resolveIndexConflicts() {
    const resolved = [];
    const body = await this.index.view('ddoc-index', 'conflictingByType', {
      reduce: false,
      key: 'ScholarlyPreprint'
    });

    for (const row of body.rows) {
      let body;
      try {
        body = await this.index.get(row.id, { open_revs: 'all' });
      } catch (err) {
        if (err.statusCode === 404) {
          body = [];
        } else {
          throw err;
        }
      }
      if (body) {
        const docs = body
          .filter(entry => entry.ok && !entry.ok._deleted)
          .map(entry => entry.ok);

        if (docs.length > 1) {
          let merged;

          switch (docs[0]['@type']) {
            case 'ScholarlyPreprint':
              merged = mergePreprintConflicts(docs);
              break;
            default:
              break;
          }
          if (merged) {
            const payload = [merged].concat(
              docs
                .slice(1)
                .map(doc => Object.assign({}, doc, { _deleted: true }))
            );

            const resp = await this.index.bulk({ docs: payload });
            if (resp[0].ok) {
              resolved.push(Object.assign({}, merged, { _rev: resp[0].rev }));
            }
          }
        }
      }
    }

    return resolved;
  }

  async resolveDocsConflicts() {
    const resolved = [];

    const body = await this.docs.view('ddoc-docs', 'conflictingByType', {
      reduce: false,
      key: 'RapidPREreviewAction'
    });

    for (const row of body.rows) {
      let body;
      try {
        body = await this.docs.get(row.id, { open_revs: 'all' });
      } catch (err) {
        if (err.statusCode === 404) {
          body = [];
        } else {
          throw err;
        }
      }
      if (body) {
        const docs = body
          .filter(entry => entry.ok && !entry.ok._deleted)
          .map(entry => entry.ok);

        if (docs.length > 1) {
          let merged;

          switch (docs[0]['@type']) {
            case 'RapidPREreviewAction':
              merged = mergeReviewActionConflicts(docs);
              break;
            default:
              break;
          }
          if (merged) {
            const payload = [merged].concat(
              docs
                .slice(1)
                .map(doc => Object.assign({}, doc, { _deleted: true }))
            );

            const resp = await this.docs.bulk({ docs: payload });
            if (resp[0].ok) {
              resolved.push(Object.assign({}, merged, { _rev: resp[0].rev }));
            }
          }
        }
      }
    }

    return resolved;
  }

  async resolveUsersConflicts() {
    const resolved = [];

    const body = await this.users.view('ddoc-users', 'conflictingByType', {
      reduce: false,
      key: 'Person'
    });

    for (const row of body.rows) {
      let body;
      try {
        body = await this.users.get(row.id, { open_revs: 'all' });
      } catch (err) {
        if (err.statusCode === 404) {
          body = [];
        } else {
          throw err;
        }
      }
      if (body) {
        const docs = body
          .filter(entry => entry.ok && !entry.ok._deleted)
          .map(entry => entry.ok);

        if (docs.length > 1) {
          let merged;

          switch (docs[0]['@type']) {
            case 'Person':
              merged = mergeUserConflicts(docs);
              break;
            default:
              break;
          }
          if (merged) {
            const payload = [merged].concat(
              docs
                .slice(1)
                .map(doc => Object.assign({}, doc, { _deleted: true }))
            );

            const resp = await this.users.bulk({ docs: payload });
            if (resp[0].ok) {
              resolved.push(Object.assign({}, merged, { _rev: resp[0].rev }));
            }
          }
        }
      }
    }

    return resolved;
  }

  async post(
    action = {},
    {
      sync = false,
      user = null,
      strict = true,
      now = new Date().toISOString(),
      isAdmin,
      isModerator
    } = {}
  ) {
    if (!action['@type']) {
      throw createError(400, 'action must have a @type');
    }

    let handledAction;
    switch (action['@type']) {
      case 'RegisterAction':
        handledAction = await handleRegisterAction.call(this, action, {
          strict,
          now,
          isAdmin,
          isModerator
        });
        break;

      case 'CreateApiKeyAction':
        handledAction = await handleCreateApiKeyAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'UpdateUserAction':
        handledAction = await handleUpdateUserAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'UpdateContactPointAction':
        handledAction = await handleUpdateContactPointAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'VerifyContactPointAction':
        handledAction = await handleVerifyContactPointAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'UpdateRoleAction':
        handledAction = await handleUpdateRoleAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'GrantModeratorRoleAction':
        handledAction = await handleGrantModeratorRoleAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'RevokeModeratorRoleAction':
        handledAction = await handleRevokeModeratorRoleAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'ModerateRoleAction':
        handledAction = await handleModerateRoleAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'UnmoderateRoleAction':
        handledAction = await handleUnmoderateRoleAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'ModerateRapidPREreviewAction':
        handledAction = await handleModerateRapidPrereviewAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'ReportRapidPREreviewAction':
        handledAction = await handleReportRapidPrereviewAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'IgnoreReportRapidPREreviewAction':
        handledAction = await handleIgnoreReportRapidPrereviewAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      case 'IgnoreModerateRapidPREreviewAction':
        throw createError(500, `Not implemented`);

      case 'DeanonymizeRoleAction':
        handledAction = await handleDeanonimyzeRoleAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'RapidPREreviewAction':
        handledAction = await handleRapidPrereviewAction.call(this, action, {
          strict,
          user,
          now
        });
        break;

      case 'RequestForRapidPREreviewAction':
        handledAction = await handleRequestForRapidPrereviewAction.call(
          this,
          action,
          {
            strict,
            user,
            now
          }
        );
        break;

      default:
        throw createError(400, `invalid action @type ${action['@type']}`);
    }

    // post processing (redundancy with changes feed)
    if (sync) {
      let actionToSync;
      if (
        handledAction['@type'] === 'RapidPREreviewAction' ||
        handledAction['@type'] === 'RequestForRapidPREreviewAction'
      ) {
        actionToSync = handledAction;
      } else if (
        handledAction.result &&
        (handledAction.result['@type'] === 'RapidPREreviewAction' ||
          handledAction.result['@type'] === 'RequestForRapidPREreviewAction')
      ) {
        actionToSync = handledAction.result;
      }

      if (actionToSync) {
        try {
          await this.syncIndex(actionToSync, { now });
        } catch (err) {
          // noop
        }
      }
    }

    return handledAction;
  }
}
