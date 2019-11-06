import http from 'http';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import DB from './db/db';
import Feed from './db/feed';
import {
  setIntervalAsync,
  clearIntervalAsync
} from './utils/set-interval-async';
import { createRedisClient } from './utils/redis';
import { PRODUCTION_DOMAIN } from './constants';
import { createCacheKey } from './middlewares/cache';

let lastSeq = null;
let lastChangeErr = null;
let lastDateScoreUpdated = null;
let lastScoreErr = null;

const logger = pino({ logLevel: 'info' });

const config = {
  pino: logger,
  appRootUrl: PRODUCTION_DOMAIN,
  isBeta: true,
  disableSsr: true
};

const db = new DB(config);
const feed = new Feed(db);
feed.resume();
feed.on('error', err => {
  lastChangeErr = err;
  logger.error({ err }, 'Feed error');
});
feed.on('start', seq => {
  lastSeq = seq;
  logger.info({ seq }, 'Feed started');
});
feed.on('sync', (seq, preprint) => {
  lastSeq = seq;
  logger.info({ seq, id: preprint._id, rev: preprint._rev }, 'Feed synced');
});

const redisClient = createRedisClient(config);

const intervalId = setIntervalAsync(
  () => {
    lastDateScoreUpdated = new Date().toISOString();
    return db.updateScores().then(updatedDocs => {
      logger.info({ nDocs: updatedDocs.length }, 'Updated scores');

      redisClient
        .batch()
        .del(createCacheKey('home:score'))
        .del(createCacheKey('home:new'))
        .del(createCacheKey('home:date'))
        .exec(err => {
          if (err) {
            logger.error({ err }, 'Error invalidating cache on score update');
          }
        });
    });
  },
  config.updateScoreInterval || 5 * 60 * 1000,
  err => {
    lastScoreErr = err;
    logger.error({ err }, 'Error updating score');
  }
);

const app = express();
app.use(helmet());
app.get('/', (req, res, next) => {
  res.json({ lastSeq, lastChangeErr, lastScoreErr, lastDateScoreUpdated });
});

const server = http.createServer(app);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  logger.info({ port }, `server listenning on port ${port}`);
});

process.once('SIGINT', function() {
  server.close(() => {
    redisClient.quit(() => {
      clearIntervalAsync(intervalId);
      feed.stop();
      process.exit();
    });
  });
});
