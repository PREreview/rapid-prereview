import http from 'http';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import helmet from 'helmet';
import pino from 'pino';
import webpackConfig from '../webpack.config';
import DB from './db/db';
import Feed from './db/feed';
import { createRedisClient } from './utils/redis';
import { rapid, assets } from './index';
import {
  setIntervalAsync,
  clearIntervalAsync
} from './utils/set-interval-async';
import { createCacheKey } from './middlewares/cache';

const compiler = webpack(webpackConfig);

const logger = pino({ logLevel: 'info' });

const config = {
  pino: logger,
  cache: true,
  disableSsr: true
};

const db = new DB(config);
const feed = new Feed(db);
feed.resume();
feed.on('start', seq => {
  logger.info({ seq }, 'Feed started');
});
feed.on('sync', (seq, preprint) => {
  logger.info({ seq, id: preprint._id, rev: preprint._rev }, 'Feed synced');
});
feed.on('error', err => {
  logger.error({ err }, 'Feed error');
});

const redisClient = createRedisClient(config);

const intervalId = setIntervalAsync(
  () => {
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
    logger.error({ err }, 'Error updating score');
  }
);

const app = express();
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  })
);
app.use(webpackHotMiddleware(compiler));
app.use(helmet());
app.use(assets(config));
app.use(rapid(config, redisClient));

const server = http.createServer(app);

const port = 3000;
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
