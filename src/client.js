import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

function render(config = {}, initialState = {}) {
  const App = require('./components/app').default;

  ReactDOM[config.ssr ? 'hydrate' : 'render'](
    <App initialState={initialState} />,
    document.getElementById('app')
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const initialState = window.__INITIAL_STATE__;
  const config = window.__CONFIG__;

  if (module.hot) {
    // See https://blog.isquaredsoftware.com/2016/11/practical-redux-part-3-project-planning-and-setup/
    module.hot.accept('./components/app', () => {
      setTimeout(() => {
        render(config, initialState);
      }, 0);
    });
  }

  render(config, initialState);
});
