"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SearchBar;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SearchBar() {
  return _react.default.createElement("div", {
    className: "search-bar"
  }, _react.default.createElement("div", {
    className: "search-bar__search-box"
  }, _react.default.createElement("input", {
    type: "text",
    className: "search-bar__search-box__input"
  })));
}