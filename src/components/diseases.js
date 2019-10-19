import React, { useState } from 'react';
import matchSorter from 'match-sorter';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption
} from '@reach/combobox';
import { DISEASES } from '../constants';

export default function Diseases() {
  const [term, setTerm] = useState('');

  const sorted =
    term.trim() === ''
      ? DISEASES
      : matchSorter(DISEASES, term, {
          keys: [
            ({ name, alternateName }) =>
              alternateName ? `${alternateName} (${name})` : name
          ]
        });

  return (
    <Combobox
      openOnFocus={true}
      onSelect={value => {
        // TODO
      }}
    >
      <ComboboxInput
        selectOnClick={true}
        autoComplete="off"
        onChange={e => {
          setTerm(e.target.value);
        }}
      />
      <ComboboxPopover>
        <ComboboxList persistSelection={true}>
          {sorted.map(({ name, alternateName }) => (
            <ComboboxOption
              key={name}
              value={alternateName ? `${alternateName} (${name})` : name}
            />
          ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
