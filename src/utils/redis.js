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
    opts.auth_pass = redisPassword; // for compatibility with Azure
    opts.password = redisPassword;
  }

  // See https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/cache-nodejs-get-started
  if (opts.port.toString() === '6380') {
    opts.tls = {
      servername: opts.host
    };
  }

  return redis.createClient(opts);
}
