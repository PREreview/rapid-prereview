import { createRedisClient } from '../src/utils/redis';

const redis = createRedisClient();

const prefix = process.argv[2] === '--cache-only' ? 'rpos:cache:*' : 'rpos:*';

redis.keys(prefix, (err, keys) => {
  console.log(`deleting ${prefix}`);

  if (err) {
    console.error(err);
  }

  if (!keys.length) {
    redis.quit();
    return;
  }

  // ! redis client will re-add the rpos: prefix
  redis.del(...keys.map(key => key.replace(/^rpos:/, '')), (err, res) => {
    if (err) {
      console.error(err);
    }
    console.log(keys, res);

    redis.quit();
  });
});
