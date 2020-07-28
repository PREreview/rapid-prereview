import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import mobile from 'is-mobile';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import smoothscroll from 'smoothscroll-polyfill';
import 'url-search-params-polyfill'; /* pollyfill for IE / Edge */
import Home from './home';
import ExtensionFallback from './extension-fallback';
import { UserProvider } from '../contexts/user-context';
import { StoresProvider } from '../contexts/store-context';
import Login from './login';
import Settings from './settings';
import Profile from './profile';
import PrivateRoute, { AdminRoute } from './private-route';
import ModeratorRoute from './moderator-route';
import ExtensionSplash from './extension-splash';
import Dashboard from './dashboard'
import ToCPage from './toc-page';
import About from './about';
import CodeOfConduct from './code-of-conduct';
import NotFound from './not-found';
import API from './api';
import AdminPanel from './admin-panel';
import BlockPanel from './block-panel';
import SuspenseLoading from './suspense-loading';

const Moderate = React.lazy(() =>
  import(/* webpackChunkName: "moderate" */ './moderate')
);

// kick off the polyfill!
smoothscroll.polyfill();

export default function App({ user }) {
  return (
    <HelmetProvider>
      <DndProvider
        backend={mobile({ tablet: true }) ? TouchBackend : HTML5Backend}
      >
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

                <Route exact={true} path="/about">
                  <ToCPage>
                    <About />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/dashboard">
                  <Dashboard />
                </Route>

                <Route exact={true} path="/code-of-conduct">
                  <ToCPage>
                    <CodeOfConduct />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/api">
                  <ToCPage>
                    <API />
                  </ToCPage>
                </Route>

                <Route exact={true} path="/about/:roleId">
                  <Profile />
                </Route>
                <Route exact={true} path="/extension">
                  <ExtensionSplash />
                </Route>
                <PrivateRoute exact={true} path="/settings">
                  <Settings />
                </PrivateRoute>
                <AdminRoute exact={true} path="/admin">
                  <AdminPanel />
                </AdminRoute>
                <AdminRoute exact={true} path="/block">
                  <BlockPanel />
                </AdminRoute>
                <ModeratorRoute exact={true} path="/moderate">
                  <Suspense
                    fallback={<SuspenseLoading>Loading</SuspenseLoading>}
                  >
                    <Moderate />
                  </Suspense>
                </ModeratorRoute>
                <Route exact={true} path="/:identifierPart1/:identifierPart2?/:identifierPart3?">
                  <ExtensionFallback />
                </Route>

                <Route>
                  <NotFound />
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
