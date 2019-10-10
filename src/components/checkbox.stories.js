import React from 'react';
import { action } from '@storybook/addon-actions';

import Checkbox from './checkbox';

export default {
  title: 'Checkbox',
  component: 'Checkbox',
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

export function checkbox() {
  return (
    <Checkbox
      inputId="checkbox-id"
      onChange={action('checkbox-change')}
      label="My Checkbox"
    />
  );
}

export function checkboxDisabled() {
  return (
    <Checkbox
      inputId="checkbox-id"
      onChange={action('checkbox-change')}
      label="My Checkbox"
      disabled
    />
  );
}
