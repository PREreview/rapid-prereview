import redis from 'redis';

export function createRedisClient(config = {}) {
  const opts = {
    host: config.redisHost || process.env['REDIS_HOST'] || '127.0.0.1',
    port: config.redisPort || process.env['REDIS_PORT'] || 6379
  };

  const redisPrefix = config.redisPrefix || 'rpos:';

  opts.prefix = redisPrefix;

  const redisPassword = config.redisPassword || process.env['REDIS_PASSWORD'];
  if (redisPassword) {
    opts.pass = redisPassword; // for compatibility with RedisStore (used in the session middleware)
    opts.password = redisPassword;
  }

  return redis.createClient(opts);
}
