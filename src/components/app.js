import React from 'react';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './home';
import ExtensionFallback from './extension-fallback';
import { UserProvider } from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';
import Login from './login';
import Settings from './settings';
import Profile from './profile';
import PrivateRoute from './private-route';
import ExtensionSplash from './extension-splash';

export default function App({ user }) {
  return (
    <HelmetProvider>
      <DndProvider backend={HTML5Backend}>
        <StoresProvider>
          <UserProvider user={user}>
            <Router>
              <Switch>
                <Route path="/:new(new)?" exact={true}>
                  <Home />
                </Route>
                <Route exact={true} path="/login">
                  <Login />
                </Route>
                <Route exact={true} path="/about/:roleId">
                  <Profile />
                </Route>
                <Route exact={true} path="/app">
                  <ExtensionSplash />
                </Route>
                <PrivateRoute exact={true} path="/settings">
                  <Settings />
                </PrivateRoute>
                <Route exact={true} path="/:identifierPart1/:identifierPart2?">
                  <ExtensionFallback />
                </Route>
              </Switch>
            </Router>
          </UserProvider>
        </StoresProvider>
      </DndProvider>
    </HelmetProvider>
  );
}

App.propTypes = {
  // `null` if user is not logged in
  user: PropTypes.shape({
    '@id': PropTypes.string,
    hasRole: PropTypes.array
  })
};
