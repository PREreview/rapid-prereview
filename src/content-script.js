import React from 'react';
import ReactDOM from 'react-dom';
import Popup from './components/popup';
import './content-script.css';

if (
  document.readyState === 'interactive' ||
  document.readyState === 'complete'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start);
}

function start() {
  const $div = document.createElement('div');
  document.body.appendChild($div);

  function detect() {
    const hasGscholar = !!document.head.querySelector(
      'meta[name^="citation_"], meta[property^="citation_"]'
    );

    if (hasGscholar) {
      ReactDOM.render(<Popup />, $div);
    }
  }

  window.onpopstate = function(event) {
    detect();
  };

  detect();
}
