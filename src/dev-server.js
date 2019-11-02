import http from 'http';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import helmet from 'helmet';
import webpackConfig from '../webpack.config';
import DB from './db/db';
import Feed from './db/feed';
import { createRedisClient } from './utils/redis';
import { rapid, assets } from './index';
import {
  setIntervalAsync,
  clearIntervalAsync
} from './utils/set-interval-async';

const compiler = webpack(webpackConfig);

const config = {
  disableSsr: true
};

const db = new DB(config);
const feed = new Feed(db);
feed.start(); // TODO use feed.resume()
feed.on('error', err => {
  console.error(err);
});

const intervalId = setIntervalAsync(
  () => {
    return db.updateScores();
  },
  5 * 60 * 1000,
  err => console.error(err)
);

const redisClient = createRedisClient(config);

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
  console.log(`server listenning on port ${port}`);
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
