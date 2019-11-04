import noop from 'lodash/noop';
import { arrayify } from '../utils/jsonld';

const TTL_SEC = 60 * 60 * 24 * 7;

export function cache(
  getKey = function(req) {
    return req.originalUrl;
  }
) {
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
      redis.set(
        key,
        typeof payload === 'string' ? payload : JSON.stringify(payload),
        'EX',
        TTL_SEC,
        err => {
          if (err) {
            req.log.error({ err, key, command: 'SET' }, 'Cache error');
          }
        }
      );
    };

    redis.get(key, (err, value) => {
      if (err || value == null) {
        if (err) {
          req.log.error({ err, key, command: 'GET' }, 'Cache error');
        }
        return next();
      }

      // Respond with the cached value
      redis.expire(key, TTL_SEC, err => {
        if (err) {
          req.log.error({ err, key, command: 'EXPIRE' }, 'Cache error');
        }
      });

      res.set('X-Cached', 'true');
      res.set('Content-Type', 'application/json');
      res.status(200).send(value);
    });
  };
}

export function createCacheKey(id) {
  return `cache:${arrayify(id).join('::')}`;
}

export function invalidate(redisClient, doc) {
  // we use scan and glob to invalidate all the docs
}
