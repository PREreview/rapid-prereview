import React, { useState } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { BrowserRouter as Router } from 'react-router-dom';
import { StoresProvider } from '../contexts/store-context';
import { RoleStore } from '../stores/user-stores';
import { getId } from '../utils/jsonld';
import { PotentialRoles, HighlightedRoles } from './role-list';

export default { title: 'RoleList' };

export function DnD() {
  const [roleIds, setRoleIds] = useState(ROLES.map(getId));
  const [highlightedRoleIds, setHighlightedRoleIds] = useState([]);

  return (
    <Router>
      <StoresProvider roleStore={roleStore}>
        <DndProvider backend={HTML5Backend}>
          <PotentialRoles
            roleIds={roleIds}
            onRemoved={roleId => {
              setRoleIds(roleIds.filter(_roleId => _roleId !== roleId));
              setHighlightedRoleIds(highlightedRoleIds.concat(roleId));
            }}
          />

          <hr />

          <HighlightedRoles
            roleIds={highlightedRoleIds}
            onRemoved={ids => {
              setHighlightedRoleIds(
                highlightedRoleIds.filter(
                  roleId => !ids.some(id => roleId === id)
                )
              );
              setRoleIds(roleIds.concat(ids));
            }}
          />
        </DndProvider>
      </StoresProvider>
    </Router>
  );
}

var ROLES = [
  {
    '@id': 'role:romain-gary', // visible display name (user selected and globally unique within Rapid PREreview)
    '@type': 'PublicReviewerRole',
    startDate: '2018-01-01T00:00:00.069Z',
    avatar: {
      '@type': 'ImageObject',
      encodingFormat: 'image/jpeg',
      contentUrl:
        'data:image/jpeg;base64,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'
    }
  },
  {
    '@id': 'role:emile-ajar', // visible display name (user selected and globally unique within Rapid PREreview)
    '@type': 'AnonymousReviewerRole',
    startDate: '2018-01-01T00:00:00.069Z',
    avatar: {
      '@type': 'ImageObject',
      encodingFormat: 'image/jpeg',
      contentUrl:
        'data:image/jpeg;base64,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'
    }
  }
];

var roleStore = new RoleStore();
ROLES.forEach(role => {
  roleStore.set(role);
});
