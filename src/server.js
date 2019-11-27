import http from 'http';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import { rapid, assets } from './index';
import { PRODUCTION_DOMAIN } from './constants';
import { createRedisClient } from './utils/redis';

const logger = pino({ logLevel: 'info' });

const config = {
  cache: true,
  pino: logger,
  appRootUrl: PRODUCTION_DOMAIN,
  disableSsr: true
};

const redisClient = createRedisClient(config);

const app = express();
app.use(helmet());
app.use(assets(config));
app.use(rapid(config, redisClient));

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(
    { port, NODE_ENV: process.env.NODE_ENV },
    `server listenning on port ${port}`
  );
});

process.once('SIGINT', function() {
  server.close(() => {
    redisClient.quit(() => {
      process.exit();
    });
  });
});
