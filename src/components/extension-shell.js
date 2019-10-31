import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router } from 'react-router-dom';
import Shell from './shell';
import ShellContent from './shell-content';
import { UserProvider } from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';
import { TOGGLE_SHELL_TAB } from '../constants';

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
              <Shell>
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
