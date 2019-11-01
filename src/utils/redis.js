export function createRedisConfig(config = {}, { ns } = {}) {
  const opts = {
    host: config.redisHost || process.env['REDIS_HOST'] || '127.0.0.1',
    port: config.redisPort || process.env['REDIS_PORT'] || 6379
  };

  let redisPrefix = config.redisPrefix || 'rpos:';
  if (ns) {
    redisPrefix += `${ns}:`;
  }

  opts.prefix = redisPrefix;

  const redisPassword = config.redisPassword || process.env['REDIS_PASSWORD'];
  if (redisPassword) {
    opts.pass = redisPassword; // for compatibility with RedisStore (used in the session middleware)
    opts.password = redisPassword;
  }

  return opts;
}
