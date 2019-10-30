import React from 'react';
import ReactDOM from 'react-dom';
import ExtensionShell from './components/extension-shell';
import { parseGoogleScholar } from './utils/scholar';
import { CHECK_SESSION_COOKIE, CHECK_PREPRINT, PREPRINT } from './constants';
import './content-script.css';

// When the user open the popup, we need to grab the preprint metadata
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  function respond() {
    const hasGscholar = !!document.head.querySelector(
      'meta[name^="citation_"], meta[property^="citation_"]'
    );
    sendResponse({
      type: PREPRINT,
      payload: hasGscholar
        ? parseGoogleScholar(document.head, {
            sourceUrl: window.location.href
          })
        : null
    });
  }

  if (request.type === CHECK_PREPRINT) {
    if (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
    ) {
      respond();
    } else {
      document.addEventListener('DOMContentLoaded', respond);
    }

    return true;
  }
});

// Inject the Shell
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

    // TODO notify background of `hasGscholar` so that we update the icon
    // TODO create the store here and setup an event listner on it to notify the backgound on number of review and requests for the icon

    if (hasGscholar) {
      const preprint = parseGoogleScholar(document.head, {
        sourceUrl: window.location.href
      });

      // We can't access the cookie store from the content script => we ask the
      // background script
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
