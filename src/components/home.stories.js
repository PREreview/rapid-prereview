import React from 'react';
import Home from './home';
import { BrowserRouter as Router } from 'react-router-dom';
import { StoresProvider } from '../contexts/store-context';
import { UserProvider } from '../contexts/user-context';

export default { title: 'Home' };

export function Empty() {
  return (
    <Router>
      <StoresProvider>
        <UserProvider>
          <Home />
        </UserProvider>
      </StoresProvider>
    </Router>
  );
}
