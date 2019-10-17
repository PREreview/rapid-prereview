import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { PreprintsWithActionsStore } from '../stores/preprint-stores';
import { RoleStore } from '../stores/user-stores';

const StoresContext = React.createContext();

export function StoresProvider({
  preprintsWithActionsStore = new PreprintsWithActionsStore(),
  roleStore = new RoleStore(),
  children
}) {
  const [state] = useState({
    preprintsWithActionsStore,
    roleStore
  });

  return (
    <StoresContext.Provider value={state}>{children}</StoresContext.Provider>
  );
}

StoresProvider.propTypes = {
  preprintsWithActionsStore: PropTypes.object,
  roleStore: PropTypes.object,
  children: PropTypes.any
};

export function useStores() {
  return useContext(StoresContext);
}
