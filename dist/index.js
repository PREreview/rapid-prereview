"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rapid = rapid;
exports.assets = assets;

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _appRoutes = _interopRequireDefault(require("./routes/app-routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rapid() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var app = (0, _express.default)();
  app.locals.config = config;
  app.enable('case sensitive routing');
  app.set('views', _path.default.join(_path.default.dirname(__dirname), 'views'));
  app.set('view engine', 'ejs');
  app.use('/', _appRoutes.default);
  return app;
}

function assets() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var app = (0, _express.default)();
  app.use(_express.default.static(_path.default.join(_path.default.dirname(__dirname), 'public')));
  return app;
}