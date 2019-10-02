"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Home;

var _react = _interopRequireDefault(require("react"));

var _headerBar = _interopRequireDefault(require("./header-bar"));

var _searchBar = _interopRequireDefault(require("./search-bar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Home() {
  return _react.default.createElement("div", {
    className: "home"
  }, _react.default.createElement(_headerBar.default, null), _react.default.createElement(_searchBar.default, null), _react.default.createElement("h1", null, "Hello home"));
}