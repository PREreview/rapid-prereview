import React from 'react';
import Diseases from './diseases';

export default { title: 'Diseases' };

export function Autocomplete() {
  return (
    <Diseases
      onSubmit={subject => {
        console.log(subject);
      }}
    />
  );
}
