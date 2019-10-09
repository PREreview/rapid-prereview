import React from 'react';
import { action } from '@storybook/addon-actions';

import Button from './button';

export default {
  title: 'Button',
  component: 'Button',
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

export function basicButton() {
  return <Button onClick={action('button-click')}>My Button</Button>;
}
export function basicButtonDisabled() {
  return (
    <Button disabled onClick={action('button-click')}>
      Disabled Button
    </Button>
  );
}

export function pillButton() {
  return <Button pill={true}>Label</Button>;
}

export function PrimaryButton() {
  return <Button primary={true}>Label</Button>;
}

export function PrimaryButtonDisabled() {
  return (
    <Button disabled primary={true}>
      Label
    </Button>
  );
}

export function PrimaryPillButton() {
  return (
    <Button primary={true} pill={true}>
      Label
    </Button>
  );
}
