import React from 'react';
import ReactDOM from 'react-dom';
import ExtensionShell from './components/extension-shell';
import { parseGoogleScholar, getIdentifierFromPdfUrl } from './utils/scholar';
import {
  CHECK_SESSION_COOKIE,
  CHECK_PREPRINT,
  PREPRINT,
  ACTION_COUNTS,
  CSS_SCOPE_ID,
  HISTORY_STATE_UPDATED
} from './constants';
import { PreprintsWithActionsStore } from './stores/preprint-stores';
import { RoleStore } from './stores/user-stores';
import { getCounts } from './utils/stats';
import { createError } from './utils/errors';
import './content-script.css';

const port = chrome.runtime.connect({ name: 'stats' });

// When the user open the popup, we need to grab the preprint metadata
// => popup ask the content script the data and here we respond
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  function respond() {
    if (window.location.href.startsWith(process.env.API_URL)) {
      const counts = ['nReviews', 'nRequests'].reduce(
        (counts, p) => {
          const $meta = document.querySelector(
            `meta[name="rapid-prereview-extension-${p.toLowerCase()}"]`
          );
          if ($meta) {
            counts[p] = parseInt($meta.getAttribute('content'), 10);
          }

          return counts;
        },
        {
          nReviews: 0,
          nRequests: 0
        }
      );

      sendResponse({
        type: ACTION_COUNTS,
        payload: {
          counts,
          hasGscholar: !!(
            document.querySelector(
              `meta[name="rapid-prereview-extension-nrequests"]`
            ) ||
            document.querySelector(
              `meta[name="rapid-prereview-extension-nreviews"]`
            )
          )
        }
      });
    } else {
      getPreprint(window.location.href, document, (err, preprint) => {
        if (err) {
          console.error(err);
        }

        sendResponse({
          type: PREPRINT,
          payload: preprint
        });
      });
    }
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
  $div.id = CSS_SCOPE_ID;
  document.body.appendChild($div);

  function detect() {
    if (window.location.href.startsWith(process.env.API_URL)) {
      // We are on one of the rapid preview page => we relay the message sent by
      // the window postMessage API

      port.postMessage({
        type: 'HAS_GSCHOLAR',
        payload: { hasGscholar: false }
      });

      port.postMessage({
        type: 'STATS',
        payload: null
      });

      window.addEventListener('message', event => {
        if (event.source == window && event.data) {
          port.postMessage(event.data);
        }
      });
    } else {
      getPreprint(window.location.href, document, (err, preprint) => {
        if (err) {
          console.error(err);
        }

        port.postMessage({
          type: 'HAS_GSCHOLAR',
          payload: { hasGscholar: !!preprint }
        });

        if (preprint) {
          // We can't access the cookie store from the content script => we ask the
          // background script
          chrome.runtime.sendMessage(
            { type: CHECK_SESSION_COOKIE },
            async response => {
              const cookie = response.payload;
              let user;
              if (cookie) {
                // TODO check that cookie is not expired
                // we need to fetch the logged in user
                const r = await fetch(`${process.env.API_URL}/auth/user`, {
                  method: 'GET',
                  credential: 'include'
                });
                if (r.ok) {
                  // Note: `user` is kept up-to-date further down in the ExtensionShell component
                  user = await r.json();
                }
              }

              const preprintsWithActionsStore = new PreprintsWithActionsStore();
              const roleStore = new RoleStore();

              port.postMessage({
                type: 'STATS',
                payload: getCounts(
                  preprintsWithActionsStore.getActions(preprint)
                )
              });

              // Keep the popup badge up to date
              preprintsWithActionsStore.on('SET', preprintWithActions => {
                const counts = getCounts(preprintWithActions.potentialAction);

                port.postMessage({
                  type: 'STATS',
                  payload: counts
                });
              });

              let shellDefaultStatus = "minimized";

              if (window.location.hash === "#osrpre-shell") {
                shellDefaultStatus = "maximized";
                window.history.replaceState(null, '', '#');
              }

              ReactDOM.render(
                <ExtensionShell
                  preprint={preprint}
                  user={user}
                  preprintsWithActionsStore={preprintsWithActionsStore}
                  roleStore={roleStore}
                  defaultStatus={shellDefaultStatus}
                />,
                $div
              );
            }
          );
        }
      });
    }
  }

  window.onpopstate = event => {
    detect();
  };

  port.onMessage.addListener(msg => {
    if (msg.type === HISTORY_STATE_UPDATED) {
      detect();
    }
  });

  detect();
}

function getPreprint(sourceUrl, document, callback) {
  const hasGscholar = !!document.head.querySelector(
    'meta[name^="citation_"], meta[property^="citation_"]'
  );

  const preprint = parseGoogleScholar(document.head, {
    sourceUrl
  });

  if (hasGscholar) {
    return callback(null, preprint);
  }

  const identifier = getIdentifierFromPdfUrl(sourceUrl);
  if (!identifier) {
    return callback(null, null);
  }

  fetch(
    `${process.env.API_URL}/api/resolve?identifier=${encodeURIComponent(
      identifier
    )}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  )
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        return resp.json().then(
          body => {
            throw createError(resp.status, body.description || body.name);
          },
          err => {
            throw createError(resp.status, 'something went wrong');
          }
        );
      }
    })
    .then(body => {
      callback(null, body);
    })
    .catch(error => {
      console.error(error);
    });
}
