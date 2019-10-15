import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './home';
import ExtensionFallback from './extension-fallback';
import { UserProvider } from '../contexts/user-context';
import Login from './login';
import Settings from './settings';
import PrivateRoute from './private-route';

export default function App({ user }) {
  return (
    <UserProvider user={user}>
      <Router>
        <Switch>
          <Route path="/:new(new)?" exact={true}>
            <Home />
          </Route>
          <Route exact={true} path="/login">
            <Login />
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
  );
}

App.propTypes = {
  // `null` if user is not logged in
  user: PropTypes.shape({
    '@id': PropTypes.string,
    hasRole: PropTypes.array
  })
};
