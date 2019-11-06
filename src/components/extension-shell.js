import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router } from 'react-router-dom';
import Shell from './shell';
import ShellContent from './shell-content';
import { UserProvider, useUser } from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';
import { TOGGLE_SHELL_TAB, SESSION_COOKIE_CHANGED } from '../constants';

export default function ExtensionShell({
  preprint,
  user,
  preprintsWithActionsStore,
  roleStore
}) {
  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <StoresProvider
          preprintsWithActionsStore={preprintsWithActionsStore}
          roleStore={roleStore}
        >
          <UserProvider user={user}>
            <div className="extension-shell">
              <Shell defaultStatus="minimized">
                {onRequireScreen => (
                  <ExtensionShellContent
                    onRequireScreen={onRequireScreen}
                    preprint={preprint}
                  />
                )}
              </Shell>
            </div>
          </UserProvider>
        </StoresProvider>
      </DndProvider>
    </Router>
  );
}

ExtensionShell.propTypes = {
  defaultTab: PropTypes.oneOf(['read', 'review', 'request']),
  preprint: PropTypes.object.isRequired,
  preprintsWithActionsStore: PropTypes.object.isRequired,
  roleStore: PropTypes.object.isRequired,
  user: PropTypes.object // only present if logged in
};

function ExtensionShellContent({ onRequireScreen, preprint }) {
  const [defaultTab, setDefaultTab] = useState('read');
  const [, setUser] = useUser();

  // handle tab toggling comming from the popup
  useEffect(() => {
    function handleMessage(request, sender, sendResponse) {
      if (request.type === TOGGLE_SHELL_TAB) {
        setDefaultTab(request.payload);
        onRequireScreen();
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [onRequireScreen]);

  // handle session cookie changes (user login or logout from another page)
  useEffect(() => {
    let controller;

    async function handleMessage(request, sender, sendResponse) {
      if (request.type === SESSION_COOKIE_CHANGED) {
        if (request.payload.removed) {
          setUser(null);
        } else {
          let controller = new AbortController();
          const r = await fetch(`${process.env.API_URL}/auth/user`, {
            method: 'GET',
            credential: 'include',

            signal: controller.signal
          });
          if (r.ok) {
            const user = await r.json();
            setUser(user);
          }
        }
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      if (controller) {
        controller.abort();
      }
    };
  }, [setUser]);

  return (
    <ShellContent
      key={defaultTab}
      onRequireScreen={onRequireScreen}
      preprint={preprint}
      defaultTab={defaultTab}
    />
  );
}

ExtensionShellContent.propTypes = {
  preprint: PropTypes.object.isRequired,
  onRequireScreen: PropTypes.func.isRequired
};
