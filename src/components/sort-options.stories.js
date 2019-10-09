import React, { useState } from 'react';
import SortOptions from './sort-options';

export default {
  title: 'SortOptions'
};

export function ByScore() {
  const [value, setValue] = useState('score');

  return <SortOptions value={value} onChange={setValue} />;
}
