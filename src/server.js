import http from 'http';
import express from 'express';
import helmet from 'helmet';
import { rapid, assets } from './index';
import { PRODUCTION_DOMAIN } from './constants';
import { createRedisClient } from './utils/redis';

const config = {
  appRootUrl: PRODUCTION_DOMAIN,
  isBeta: true,
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
  console.log(`server listenning on port ${port}`);
});

process.once('SIGINT', function() {
  server.close(() => {
    redisClient.quit(() => {
      process.exit();
    });
  });
});
