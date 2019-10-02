"use strict";

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _webpackHotMiddleware = _interopRequireDefault(require("webpack-hot-middleware"));

var _webpack2 = _interopRequireDefault(require("../webpack.config"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compiler = (0, _webpack.default)(_webpack2.default);
var config = {
  disableSsr: true
};
var app = (0, _express.default)();
app.use((0, _webpackDevMiddleware.default)(compiler, {
  publicPath: _webpack2.default.output.publicPath
}));
app.use((0, _webpackHotMiddleware.default)(compiler));
app.use((0, _index.assets)(config));
app.use((0, _index.rapid)(config));

var server = _http.default.createServer(app);

var port = 3000;
server.listen(port, function () {
  console.log("server listenning on port ".concat(port));
});