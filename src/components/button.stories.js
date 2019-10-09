import React from 'react';
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
  return <Button>Label</Button>;
}

export function pillButton() {
  return <Button pill={true}>Label</Button>;
}

export function PrimaryButton() {
  return <Button primary={true}>Label</Button>;
}

export function PrimaryPillButton() {
  return (
    <Button primary={true} pill={true}>
      Label
    </Button>
  );
}
