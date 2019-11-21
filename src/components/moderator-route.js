import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from '../contexts/user-context';
import { useRole } from '../hooks/api-hooks';
import NotFound from './not-found';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated and 404 if
// you are not a moderator
export default function ModeratorRoute({ children, ...rest }) {
  const [user] = useUser();
  const [role, fetchRoleProgress] = useRole(user && user.defaultRole);

  return (
    <Route {...rest}>
      {user ? (
        role && role.isModerator && !role.isModerated ? (
          children
        ) : fetchRoleProgress.isActive ? null /* TODO nicer loading */ : (
          <NotFound />
        )
      ) : (
        <Redirect to="/login" />
      )}
    </Route>
  );
}

ModeratorRoute.propTypes = {
  children: PropTypes.any.isRequired
};
