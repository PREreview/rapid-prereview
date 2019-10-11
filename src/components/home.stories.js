import React from 'react';
import Home from './home';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from '../contexts/user-context';

export default { title: 'home' };

export function empty() {
  return (
    <Router>
      <UserProvider>
        <Home />
      </UserProvider>
    </Router>
  );
}
