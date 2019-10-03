import Cloudant from '@cloudant/cloudant';
import handleRegisterAction from './handle-register-action';
import handleRapidPrereviewAction from './handle-rapid-prereview-action';
import ddocDocs from '../ddocs/ddoc-docs';
import ddocUsers from '../ddocs/ddoc-users';
import ddocIndex from '../ddocs/ddoc-index';
import { getId, cleanup, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

export default class DB {
  constructor(config = {}) {
    const username =
      config.couchUsername || process.env.COUCH_USERNAME || 'admin';
    const password =
      config.couchPassword || process.env.COUCH_PASSWORD || 'pass';
    const protocol =
      config.couchProtocol || process.env.COUCH_PROTOCOL || 'http:';
    const host = config.couchHost || process.env.COUCH_HOST || '127.0.0.1';
    const port = config.couchPort || process.env.COUCH_PORT || '5984';

    this.docsDbName =
      config.couchDocsDbName ||
      process.env.COUCH_DOCS_DB_NAME ||
      'rapid-prereview-docs';
    this.indexDbName =
      config.couchIndexDbName ||
      process.env.COUCH_INDEX_DB_NAME ||
      'rapid-prereview-index';
    this.usersDbName =
      config.couchUsersDbName ||
      process.env.COUCH_USERS_DB_NAME ||
      'rapid-prereview-users';

    const cloudant = new Cloudant({
      username,
      password,
      url: `${protocol}//${host}:${port}`
    });

    this.cloudant = cloudant;
    this.docs = cloudant.use(this.docsDbName);
    this.index = cloudant.use(this.indexDbName);
    this.users = cloudant.use(this.usersDbName);
  }

  async init({ reset = false } = {}) {
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

    return Promise.all([
      setup.call(this, this.docsDbName),
      setup.call(this, this.indexDbName),
      setup.call(this, this.usersDbName)
    ]);
  }

  async ddoc() {
    function toUnnamedString(f) {
      const str = f.toString();
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

    const resps = await Promise.all([
      this.docs.insert(stringify(ddocDocs)),
      this.users.insert(stringify(ddocUsers)),
      this.index.insert(stringify(ddocIndex))
    ]);
    return resps;
  }

  async secure() {
    // TODO see https://cloud.ibm.com/docs/services/Cloudant?topic=cloudant-authorization
    // and set_security method
    // we make the docs DB public for read
  }

  async get(id, { user = null } = {}) {
    const [prefix] = id.split(':');

    switch (prefix) {
      case 'user': {
        const doc = await this.users.get(id);
        if (getId(user) === getId(doc)) {
          return doc;
        } else {
          // we need to remove the anonymous roles
          return cleanup(
            Object.assign({}, doc, {
              hasRole: arrayify(doc.hasRole).filter(
                role => role['@type'] !== 'AnonymousReviewerRole'
              )
            }),
            { removeEmptyArray: true }
          );
        }
      }

      case 'role': {
        const body = await this.users.view('ddoc-users', 'usersByRoleId', {
          key: id,
          include_docs: true,
          reduce: false
        });
        const row = body.rows[0];
        if (!row) {
          throw createError(404, `Not found (${id})`);
        }

        const doc = row.value;
        return arrayify(doc.hasRole).find(role => getId(role) === id);
      }

      case 'review':
      case 'request':
        return this.docs.get(id);

      case 'preprint':
        return this.index.get(id);
    }
  }

  async search(index, query, { user = null } = {}) {}

  async post(action, { user = null, strict = true } = {}) {
    if (!action['@type']) {
      throw new Error('action must have a @type');
    }

    switch (action['@type']) {
      case 'RegisterAction':
        return handleRegisterAction.call(this, action, { strict });

      case 'CreateRoleAction':
        break;

      case 'UpdateRoleAction':
        break;

      case 'DeanonymizeRoleAction':
        break;

      case 'RapidPREreviewAction':
        return handleRapidPrereviewAction.call(this, action, { strict, user });

      case 'RequestForRapidPREreviewAction':
        break;

      default:
        break;
    }
  }
}
