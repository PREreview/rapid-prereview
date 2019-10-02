"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = App;

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _home = _interopRequireDefault(require("./home"));

var _extensionFallback = _interopRequireDefault(require("./extension-fallback"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function App() {
  return _react.default.createElement(_reactRouterDom.BrowserRouter, null, _react.default.createElement(_reactRouterDom.Switch, null, _react.default.createElement(_reactRouterDom.Route, {
    exact: true,
    path: "/"
  }, _react.default.createElement(_home.default, null)), _react.default.createElement(_reactRouterDom.Route, {
    exact: true,
    path: "/:doi"
  }, _react.default.createElement(_extensionFallback.default, null))));
}