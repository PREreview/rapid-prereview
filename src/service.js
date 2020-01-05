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
let lastDateSynced = null;
let lastScoreErr = null;

const logger = pino({ level: 'info' });

const config = {
  pino: logger,
  appRootUrl: PRODUCTION_DOMAIN,
  disableSsr: true
};

const redisClient = createRedisClient(config);
const db = new DB(config);
const feed = new Feed(db);
if (process.env.FEED_START_SEQ) {
  feed.start({ since: process.env.FEED_START_SEQ });
} else {
  feed.resume();
}
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
  lastDateSynced = new Date().toISOString();

  logger.info({ seq, id: preprint._id, rev: preprint._rev }, 'Feed synced');

  redisClient
    .batch()
    .del(createCacheKey('home:score'))
    .del(createCacheKey('home:reviewed'))
    .del(createCacheKey('home:requested'))
    .del(createCacheKey('home:new'))
    .del(createCacheKey('home:date'))
    .exec(err => {
      if (err) {
        logger.error({ err }, 'Error invalidating cache on sync');
      }
    });
});

const intervalId = setIntervalAsync(async () => {
  lastDateScoreUpdated = new Date().toISOString();

  // resolve conflicts
  try {
    const resolved = await db.resolveIndexConflicts();
    if (resolved.length) {
      logger.info({ nDocs: resolved.length }, 'resolved index conflicts');
    }
  } catch (err) {
    logger.error({ err }, 'Error resolving index conflicts');
  }
  try {
    const resolved = await db.resolveDocsConflicts();
    if (resolved.length) {
      logger.info({ nDocs: resolved.length }, 'resolved docs conflicts');
    }
  } catch (err) {
    logger.error({ err }, 'Error resolving docs conflicts');
  }
  try {
    const resolved = await db.resolveUsersConflicts();
    if (resolved.length) {
      logger.info({ nDocs: resolved.length }, 'resolved docs conflicts');
    }
  } catch (err) {
    logger.error({ err }, 'Error resolving users conflicts');
  }

  // update scores
  try {
    const updatedDocs = await db.updateScores();
    if (updatedDocs.length) {
      logger.info({ nDocs: updatedDocs.length }, 'Updated scores');
    }
  } catch (err) {
    logger.error({ err }, 'Error updating score');
  }

  // update cache
  redisClient
    .batch()
    .del(createCacheKey('home:score'))
    .del(createCacheKey('home:reviewed'))
    .del(createCacheKey('home:requested'))
    .del(createCacheKey('home:new'))
    .del(createCacheKey('home:date'))
    .exec(err => {
      if (err) {
        logger.error({ err }, 'Error invalidating cache on score update');
      }
    });
}, config.updateScoreInterval || 60 * 60 * 1000);

const app = express();
app.use(helmet());
app.get('/', (req, res, next) => {
  res.json({
    lastSeq,
    lastChangeErr,
    lastScoreErr,
    lastDateScoreUpdated,
    lastDateSynced
  });
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
