import React from 'react';
import Value from './value';

export default { title: 'Value' };

export function withText() {
  return <Value>Hello Value</Value>;
}

export function withTagName() {
  return <Value tagName="h1">Hello Value</Value>;
}

export function withHTML() {
  return (
    <Value>
      {{ '@type': 'rdf:HTML', '@value': 'Hello <strong>value</strong>' }}
    </Value>
  );
}
