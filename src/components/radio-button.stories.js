import React from 'react';
import { action } from '@storybook/addon-actions';

import RadioButton from './radio-button';

export default {
  title: 'Radio Button',
  component: 'RadioButton',
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

export function radioButton() {
  return (
    <div>
      <RadioButton
        inputId="radio-id-1"
        onChange={action('radio-button-change')}
        label="My Radio Button 1"
        name="radio-group"
        value="radio-1"
      />
      <RadioButton
        inputId="radio-id-2"
        onChange={action('radio-button-change')}
        label="My Radio Button 2"
        name="radio-group"
        value="radio-2"
      />
    </div>
  );
}

export function radioButtonDisabled() {
  return (
    <RadioButton
      inputId="radio-id"
      onChange={action('radio-button-change')}
      label="My Radio Button"
      disabled
    />
  );
}
