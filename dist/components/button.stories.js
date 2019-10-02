"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withEmoji = exports.withText = exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _demo = require("@storybook/react/demo");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  title: 'Button'
};
exports.default = _default;

var withText = function withText() {
  return _react.default.createElement(_demo.Button, null, "Hello Button");
};

exports.withText = withText;

var withEmoji = function withEmoji() {
  return _react.default.createElement(_demo.Button, null, _react.default.createElement("span", {
    role: "img",
    "aria-label": "so cool"
  }, "\uD83D\uDE00 \uD83D\uDE0E \uD83D\uDC4D \uD83D\uDCAF"));
};

exports.withEmoji = withEmoji;