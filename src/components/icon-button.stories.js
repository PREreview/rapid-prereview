import React from 'react';
import { action } from '@storybook/addon-actions';
import { MdSearch } from 'react-icons/md';

import IconButton from './icon-button';

export default {
  title: 'Icon Button',
  component: 'Icon Button',
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

export function IconButtonNormal() {
  return (
    <IconButton onClick={action('button-click')}>
      <MdSearch />
    </IconButton>
  );
}
export function iconButtonDisabled() {
  return (
    <IconButton disabled onClick={action('button-click')}>
      <MdSearch />
    </IconButton>
  );
}
