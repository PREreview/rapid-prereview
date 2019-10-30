import React from 'react';
import ReactDOM from 'react-dom';
import ExtensionShell from './components/extension-shell';
import { parseGoogleScholar } from './utils/scholar';
import './content-script.css';
import { CHECK_SESSION_COOKIE } from './constants';

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

      chrome.runtime.sendMessage(
        { type: CHECK_SESSION_COOKIE },
        async response => {
          const cookie = response.payload;
          let user;
          if (cookie) {
            // we need to fetch the logged in user
            const r = await fetch(`${process.env.API_URL}/auth/user`, {
              method: 'GET',
              credential: 'include'
            });
            if (r.ok) {
              user = await r.json();
            }
          }

          ReactDOM.render(
            <ExtensionShell preprint={preprint} user={user} />,
            $div
          );
        }
      );
    }
  }

  window.onpopstate = function(event) {
    detect();
  };

  detect();
}
