import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from '../contexts/user-context';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export default function PrivateRoute({ children, ...rest }) {
  const [user] = useUser();

  return <Route {...rest}>{user ? children : <Redirect to="/login" />}</Route>;
}

PrivateRoute.propTypes = {
  children: PropTypes.any.isRequired
};
