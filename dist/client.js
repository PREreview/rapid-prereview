"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

require("./index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function render() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var Provider = require('./components/app').default;

  _reactDom.default[config.ssr ? 'hydrate' : 'render'](_react.default.createElement(Provider, {
    initialState: initialState
  }), document.getElementById('app'));
}

document.addEventListener('DOMContentLoaded', function () {
  var initialState = window.__INITIAL_STATE__;
  var config = window.__CONFIG__;

  if (module.hot) {
    // See https://blog.isquaredsoftware.com/2016/11/practical-redux-part-3-project-planning-and-setup/
    module.hot.accept('./components/app', function () {
      setTimeout(function () {
        render(config, initialState);
      }, 0);
    });
  }

  render(config, initialState);
});