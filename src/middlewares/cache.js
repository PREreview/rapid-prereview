import noop from 'lodash/noop';
import { promisify } from 'util';
import EventEmitter from 'events';
import { arrayify, getId } from '../utils/jsonld';
import { createError } from '../utils/errors';

const TTL_SEC = 60 * 60 * 24 * 7;

export function cache(
  getKey = function(req) {
    return req.originalUrl;
  }
) {
  const lua = `
-- ARGV are the doc ids that need to be checked (may be invalidated)

local isInvalidated = false;

for _,docId in ipairs(ARGV) do
  local isMember = redis.call('SISMEMBER', 'rpos:cache:invalidate', docId)

  if (isMember) then
    isInvalidated = true
    -- delete cached document
    local cacheKey = 'rpos:cache:doc:'..docId
    redis.call('DEL', cacheKey)

    -- delete search results containing cached documents
    local searchResultsByDocIdKey = 'rpos:cache:search:'..docId
    local searchResultCacheKeys = redis.call('SMEMBERS', searchResultsByDocIdKey)
    redis.call('DEL', unpack(searchResultCacheKeys))

    -- everything was invalidated so we can remove the docId from the invalidate set
    redis.call('SREM', 'rpos:cache:invalidate', docId)
  end

end

return isInvalidated
`;

  return function(req, res, next) {
    const redis = req.app.get('redisClient');
    const config = req.app.locals.config;

    if (!config || !config.cache) {
      req.cache = noop;
      return next();
    }

    const key = createCacheKey(getKey(req));

    // provides `req.cache` so user can update the cached value
    req.cache = function(payload) {
      // TODO add `key` to  cache:search:<docId> for each docId of payload

      redis.set(key, JSON.stringify(payload), 'EX', TTL_SEC, err => {
        if (err) {
          req.log.error({ err, key, command: 'SET' }, 'Cache error');
        }
      });
    };

    redis.get(key, (err, value) => {
      if (err || value == null) {
        if (err) {
          req.log.error({ err, key, command: 'GET' }, 'Cache error');
        }
        return next();
      }

      // Respond with the cached value if (and only if) it hasn't been
      // invalidated
      const data = JSON.parse(value);
      let docIds = [];
      if ('@id' in data) {
        docIds = [getId(data)];
      } else if (data.rows) {
        docIds = data.rows.map(row => row.id);
      }

      redis.eval(lua, 0, ...docIds, (err, isInvalidated) => {
        if (err) {
          req.log.error({ err, key, command: 'ISMEMBER' }, 'Cache error');
          // we don't know if cache is invalidated, we serve data from DB
          return next();
        }

        if (isInvalidated) {
          return next();
        }

        res.set('X-Cached', 'true');
        res.set('Content-Type', 'application/json');
        res.status(200).send(value);
      });
    });
  };
}

export function createCacheKey(id) {
  return `cache:${arrayify(id).join('::')}`;
}

// TODO make 3 separate classes
export class CacheInvalidator extends EventEmitter {
  constructor(db, redisClient) {
    super();
    this.redis = redisClient;
    this.db = db;
  }

  async start() {
    if (this.feedDocs || this.feedIndex || this.feedUsers) {
      throw createError(400, 'cache invalidator is already started');
    }

    const mget = promisify(this.redis.mget).bind(this.redis);

    const [sinceDocs, sinceIndex, sinceUsers] = await mget(
      `cache:seq:docs`,
      `cache:seq:index`,
      `cache:seq:users`
    );

    this.feedDocs = this.db.docs.follow({
      since: sinceDocs || 'now',
      include_docs: true
    });
    this.feedDocs.on('change', change => {
      const { doc } = change;

      if (
        doc['@type'] === 'RequestForRapidPREreviewAction' ||
        doc['@type'] === 'RapidPREreviewAction'
      ) {
        this.feedDocs.pause();

        this.redis
          .multi()
          .sadd('cache:invalidate', getId(doc), getId(doc.object))
          .set('cache:seq:docs', change.seq)
          .exec((err, replies) => {
            if (err) {
              err.seq = change.seq;
              err.db = 'docs';
              this.emit('error', err);
            }

            if (this.feedDocs) {
              // user may have called `stop`
              this.feedDocs.resume();
            }
          });
      }
    });
    this.feedDocs.follow();

    this.feedIndex = this.db.index.follow({
      since: sinceIndex || 'now',
      include_docs: true
    });
    this.feedIndex.on('change', change => {
      const { doc } = change;

      if (doc['@type'] === 'ScholarlyPreprint') {
        this.feedIndex.pause();

        this.redis
          .multi()
          .sadd('cache:invalidate', getId(doc))
          .set('cache:seq:index', change.seq)
          .exec((err, replies) => {
            if (err) {
              err.seq = change.seq;
              err.db = 'index';
              this.emit('error', err);
            }

            if (this.feedIndex) {
              // user may have called `stop`
              this.feedIndex.resume();
            }
          });
      }
    });
    this.feedIndex.follow();

    this.feedUsers = this.db.users.follow({
      since: sinceUsers || 'now',
      include_docs: true
    });
    this.feedUsers.on('change', change => {
      const { doc } = change;

      if (doc['@type'] === 'Person') {
        this.feedUsers.pause();

        this.redis
          .multi()
          .sadd('cache:invalidate', [getId(doc)].concat(doc.hasRole.map(getId)))
          .set('cache:seq:user', change.seq)
          .exec((err, replies) => {
            if (err) {
              err.seq = change.seq;
              err.db = 'users';
              this.emit('error', err);
            }

            if (this.feedUser) {
              // user may have called `stop`
              this.feedUser.resume();
            }
          });
      }
    });
    this.feedUsers.follow();

    return { sinceDocs, sinceIndex, sinceUsers };
  }

  stop() {
    if (this.feedDocs) {
      this.feedDocs.stop();
      this.feedDocs = null;
    }

    if (this.feedIndex) {
      this.feedIndex.stop();
      this.feedIndex = null;
    }

    if (this.feedUsers) {
      this.feedUsers.stop();
      this.feedUsers = null;
    }
  }
}
