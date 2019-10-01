import http from 'http';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';
import { rapid, assets } from './index';

const compiler = webpack(webpackConfig);

const config = {
  disableSsr: true
};

const app = express();
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  })
);
app.use(webpackHotMiddleware(compiler));

app.use(assets(config));
app.use(rapid(config));

const server = http.createServer(app);

const port = 3000;
server.listen(port, () => {
  console.log(`server listenning on port ${port}`);
});
