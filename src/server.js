import http from 'http';
import express from 'express';
import { rapid, assets } from './index';
import { PRODUCTION_DOMAIN } from './constants';

const config = {
  appRootUrl: PRODUCTION_DOMAIN,
  isBeta: true,
  disableSsr: true
};

const app = express();
app.use(assets(config));
app.use(rapid(config));

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`server listenning on port ${port}`);
});

process.once('SIGINT', function() {
  server.close(() => {
    process.exit();
  });
});
