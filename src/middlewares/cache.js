import noop from 'lodash/noop';
import { getId, arrayify } from '../utils/jsonld';
import { createError } from '../utils/errors';

/**
 * return a value that can be used as an ETag (that is is guarantee to change
 * if `obj` changes)
 */
function getOnlyIfValue(obj = {}) {
  switch (obj['@type']) {
    case 'Person':
    case 'RequestForRapidPREreviewAction':
    case 'RapidPREreviewAction':
      return obj._rev;

    // roles are embedded in user docs so don't have a _rev
    case 'AnonymousReviewerRole':
    case 'PublicReviewerRole':
      return obj.modifiedDate;

    default:
      throw createError(500, 'getOnlyIfValue: invalid type for obj');
  }
}

function createCacheKey(id) {
  id = getId(id);

  return id ? `cache:value:${id}` : id;
}

function createOnlyIfKey(id) {
  id = getId(id);

  return id ? `cache:onlyIf:${id}` : id;
}

export function cache(getKey) {
  if (typeof getKey !== 'function') {
    throw createError(500, `cache must be called with a getKey function`);
  }

  return function(req, res, next) {
    const redis = req.app.get('redisClient');
    const config = req.app.locals.config;

    const cacheKey = createCacheKey(getKey(req));

    if (!config || !config.cache || !cacheKey || typeof cacheKey !== 'string') {
      req.cache = noop;
      return next();
    }

    // provides `req.cache` so user can update the cached value
    req.cache = function(payload, ttl = 60 * 60 * 24 /* 1 day in sec */) {
      if (payload) {
        // we work around CouchDB 2.x eventual consistency window:
        // we only cache a value if its _rev (or similar in case of embeded
        // docs) matches the `cache:onlyIf` (see `invalidate`)

        let watchedKeys, onlyIfValues;
        switch (payload['@type']) {
          case 'Person':
          case 'AnonymousReviewerRole':
          case 'PublicReviewerRole':
          case 'RequestForRapidPREreviewAction':
          case 'RapidPREreviewAction':
            watchedKeys = [createOnlyIfKey(payload)];
            onlyIfValues = [getOnlyIfValue(payload)];
            break;

          case 'ScholarlyPreprint':
            watchedKeys = arrayify(
              payload.potentialAction.map(createOnlyIfKey)
            );
            onlyIfValues = arrayify(
              payload.potentialAction.map(getOnlyIfValue)
            );
            break;

          default:
            break;
        }

        redis.watch(...watchedKeys, err => {
          if (err) {
            req.log.error(
              { err, cacheKey, watchedKeys, command: 'WATCH' },
              'Cache error'
            );
          } else {
            // assess if the retrieved value is outdated
            redis.mget(...watchedKeys, (err, expectedOnlyIfValues) => {
              if (err) {
                req.log.error(
                  { err, cacheKey, watchedKeys, command: 'MGET' },
                  'Cache error'
                );
              } else {
                const isOutdated = expectedOnlyIfValues
                  .filter(Boolean) // there may not be onlyIf keys for all (in which case redis returns `null`)
                  .some(value => {
                    return !onlyIfValues.some(_value => value === _value);
                  });

                if (isOutdated) {
                  // Do not cache the value, the CouchDB node we read from is outdated, we will try again on next read
                  redis.unwatch();
                } else {
                  redis
                    .multi()
                    .set(cacheKey, JSON.stringify(payload), 'EX', ttl)
                    .exec((err, r) => {
                      if (err) {
                        req.log.error(
                          { err, cacheKey, command: 'SET' },
                          'Cache error'
                        );
                      }
                    });
                }
              }
            });
          }
        });
      }
    };

    redis.get(cacheKey, (err, value) => {
      if (err || value == null) {
        if (err) {
          req.log.error({ err, cacheKey, command: 'GET' }, 'Cache error');
        }
        return next();
      }

      res.set('X-Cached', 'true');
      res.set('Content-Type', 'application/json');
      res.status(200).send(value);
    });
  };
}

export function invalidate() {
  return function(req, res, next) {
    const redis = req.app.get('redisClient');
    const config = req.app.locals.config;

    if (!config || !config.cache) {
      req.invalidate = noop;
      return next();
    }

    req.invalidate = function(action) {
      if (action) {
        // In order to work around CouchDB 2.x eventual consistency we store the
        // _rev (or similar for embedded docs) of the latest update so that `cache`
        // only set a cached value in case of _rev match. This prevents a lagging
        // node to reset the cache to a value different from the latest

        switch (action['@type']) {
          case 'RegisterAction':
          case 'CreateRoleAction':
          case 'UpdateUserAction':
          case 'UpdateRoleAction':
          case 'DeanonymizeRoleAction': {
            // invalidate cacheKey for userId and roleId
            const user = action.result;
            const batch = redis.batch();
            batch.set(
              createOnlyIfKey(user),
              getOnlyIfValue(user),
              'EX',
              60 * 60 // 1 hour in sec
            );
            batch.del(createCacheKey(user));
            arrayify(user.hasRole).forEach(role => {
              batch.set(
                createOnlyIfKey(role),
                getOnlyIfValue(role),
                'EX',
                60 * 60 // 1 hour in sec
              );
              batch.del(createCacheKey(role));
            });

            batch.exec((err, res) => {
              if (err) {
                req.log.error({ err, action }, 'Invalidate error');
              }
            });
            break;
          }

          case 'RequestForRapidPREreviewAction':
          case 'RapidPREreviewAction': {
            // invalidate cache key for actionId, activity:<roleId>, home:score,
            // home:new, home:date and preprintId containing `action`
            const batch = redis.batch();
            batch.del(createCacheKey(action));
            batch.del(createCacheKey(`activity:${getId(action.agent)}`));
            batch.del(createCacheKey('home:score'));
            batch.del(createCacheKey('home:new'));
            batch.del(createCacheKey('home:date'));
            batch.del(createCacheKey(action.object));
            batch.set(
              createOnlyIfKey(action),
              getOnlyIfValue(action),
              'EX',
              60 * 60 // 1 hour in sec
            );
            batch.exec((err, res) => {
              if (err) {
                req.log.error({ err, action }, 'Invalidate error');
              }
            });
            break;
          }

          default:
            break;
        }
      }
    };

    next();
  };
}
