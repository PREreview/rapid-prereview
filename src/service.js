import http from 'http';
import express from 'express';
import helmet from 'helmet';
import DB from './db/db';
import Feed from './db/feed';
import {
  setIntervalAsync,
  clearIntervalAsync
} from './utils/set-interval-async';
import { PRODUCTION_DOMAIN } from './constants';

let lastSeq = null;
let lastChangeErr = null;
let lastDateScoreUpdated = null;
let lastScoreErr = null;

const config = {
  appRootUrl: PRODUCTION_DOMAIN,
  isBeta: true,
  disableSsr: true
};

const db = new DB(config);
const feed = new Feed(db);
feed.resume();
feed.on('error', err => {
  lastChangeErr = err;
  console.error(err);
});
feed.on('start', seq => {
  lastSeq = seq;
});
feed.on('sync', seq => {
  lastSeq = seq;
});

const intervalId = setIntervalAsync(
  () => {
    lastDateScoreUpdated = new Date().toISOString();
    return db.updateScores();
  },
  5 * 60 * 1000,
  err => {
    lastScoreErr = err;
    console.error(err);
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
  console.log(`server listenning on port ${port}`);
});

process.once('SIGINT', function() {
  server.close(() => {
    clearIntervalAsync(intervalId);
    feed.stop();
    process.exit();
  });
});
