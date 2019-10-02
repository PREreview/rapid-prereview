"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ExtensionFallback;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ExtensionFallback() {
  return _react.default.createElement("div", null, _react.default.createElement("h1", null, "Hello extension fallback"), _react.default.createElement("iframe", {
    src: "https://www.biorxiv.org/content/biorxiv/early/2019/09/24/780577.full.pdf"
  }));
}