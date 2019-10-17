import React from 'react';
import { action } from '@storybook/addon-actions';

import RoleBadge from './role-badge';

export default {
  title: 'Role Badge',
  component: 'RoleBadge',
  decorators: [
    storyFn => (
      <div
        style={{
          backgroundColor: 'white',
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {storyFn()}
      </div>
    )
  ]
};

export function roleBadge() {
  return <RoleBadge roleId="role:e0a86b93-c127-4a3a-8399-dda0e60a30ef" />;
}
