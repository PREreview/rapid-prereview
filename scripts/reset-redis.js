import { createRedisClient } from '../src/utils/redis';

const redis = createRedisClient();
redis.keys('rpos:*', (err, keys) => {
  if (err) {
    console.error(err);
  }

  if (!keys.length) {
    redis.quit();
    return;
  }

  // ! redis client will re-ads the rpos: prefix
  redis.del(...keys.map(key => key.replace(/^rpos:/, '')), (err, res) => {
    if (err) {
      console.error(err);
    }
    console.log(keys, res);

    redis.quit();
  });
});
