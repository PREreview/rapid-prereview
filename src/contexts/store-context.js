import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PreprintsWithActionsStore,
  PreprintsSearchResultsStore
} from '../stores/preprint-stores';
import { RoleStore } from '../stores/user-stores';

const StoresContext = React.createContext();

export function StoresProvider({
  preprintsSearchResultsStore = new PreprintsSearchResultsStore(),
  preprintsWithActionsStore = new PreprintsWithActionsStore(),
  roleStore = new RoleStore(),
  children
}) {
  const [state] = useState({
    preprintsSearchResultsStore,
    preprintsWithActionsStore,
    roleStore
  });

  return (
    <StoresContext.Provider value={state}>{children}</StoresContext.Provider>
  );
}

StoresProvider.propTypes = {
  preprintsWithActionsStore: PropTypes.object,
  preprintsSearchResultsStore: PropTypes.object,
  roleStore: PropTypes.object,
  children: PropTypes.any
};

export function useStores() {
  return useContext(StoresContext);
}
