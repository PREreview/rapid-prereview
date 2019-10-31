import React from 'react';
import ReactDOM from 'react-dom';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/user-context';
import { StoresProvider } from './contexts/store-context';
import Popup from './components/popup';
import { CHECK_PREPRINT } from './constants';
import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  chrome.cookies.get(
    {
      url: process.env.COOKIE_URL,
      name: 'rapid.sid'
    },
    async cookie => {
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

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: CHECK_PREPRINT },
          response => {
            let preprint;
            if (!chrome.runtime.lastError && response) {
              preprint = response.payload;
            }

            function dispatch(action) {
              chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, action);
              });
            }

            ReactDOM.render(
              <Router>
                <DndProvider backend={HTML5Backend}>
                  <StoresProvider>
                    <UserProvider user={user}>
                      <Popup preprint={preprint} dispatch={dispatch} />
                    </UserProvider>
                  </StoresProvider>
                </DndProvider>
              </Router>,
              document.getElementById('app')
            );
          }
        );
      });
    }
  );
});
