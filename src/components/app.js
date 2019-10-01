import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './home';
import ExtensionFallback from './extension-fallback';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact={true} path="/">
          <Home />
        </Route>
        <Route exact={true} path="/:doi">
          <ExtensionFallback />
        </Route>
      </Switch>
    </Router>
  );
}
