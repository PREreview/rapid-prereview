"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HeaderBar;

var _react = _interopRequireDefault(require("react"));

var _rapidPreReviewLogo = _interopRequireDefault(require("./rapid-pre-review-logo"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function HeaderBar() {
  return _react.default.createElement("div", {
    className: "header-bar"
  }, _react.default.createElement(_rapidPreReviewLogo.default, null), _react.default.createElement("div", {
    className: "header-bar__right"
  }, _react.default.createElement("span", {
    className: "header-bar__nav-item"
  }, "Get Browser Extension"), _react.default.createElement("span", {
    className: "header-bar__nav-item"
  }, "About"), _react.default.createElement("span", {
    className: "header-bar__nav-item"
  }, "PREreview"), _react.default.createElement("span", {
    className: "header-bar__nav-item"
  }, "Login")));
}