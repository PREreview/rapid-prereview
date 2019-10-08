import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

const UserContext = React.createContext();

export function UserProvider({ user = null, children }) {
  const [state, setState] = useState({
    user,
    setUser(user) {
      setState(prevUser => Object.assign({}, prevUser, { user }));
    }
  });

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  user: PropTypes.shape({
    '@id': PropTypes.string,
    hasRole: PropTypes.array
  }),
  children: PropTypes.any
};

export function useUser() {
  const value = useContext(UserContext);
  return [value.user, value.setUser];
}
