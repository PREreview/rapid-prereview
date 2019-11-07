import React from 'react';
import Controls from './controls';
import Button from './button';

export default {
  title: 'Controls'
};

export function WithoutError() {
  return (
    <Controls>
      <Button>Cancel</Button>
      <Button>Submit</Button>
    </Controls>
  );
}

export function WithError() {
  const error = new Error('Error message');
  return (
    <Controls error={error}>
      <Button>Cancel</Button>
      <Button>Submit</Button>
    </Controls>
  );
}

export function WithLink() {
  const error = new Error('Error message');
  return (
    <Controls error={error}>
      <Button element="a" href="/">
        Cancel
      </Button>
      <Button>Submit</Button>
    </Controls>
  );
}
