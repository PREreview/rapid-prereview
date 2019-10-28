import React from 'react';
import ReactDOM from 'react-dom';
import ExtensionShell from './components/extension-shell';
import { parseGoogleScholar } from './utils/scholar';
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
      const preprint = parseGoogleScholar(document.head, {
        sourceUrl: window.location.href
      });

      ReactDOM.render(<ExtensionShell preprint={preprint} />, $div);
    }
  }

  window.onpopstate = function(event) {
    detect();
  };

  detect();
}
