import React, { useState } from 'react';
import matchSorter from 'match-sorter';
import PropTypes from 'prop-types';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption
} from '@reach/combobox';
import { DISEASES } from '../constants';
import Button from './button';

export default function Diseases({ onSubmit }) {
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const sorted =
    term.trim() === ''
      ? DISEASES
      : matchSorter(DISEASES, term, {
          keys: [subject => format(subject)]
        });

  function handleSubmit(value) {
    const subject = DISEASES.find(subject => format(subject) === value);
    if (subject) {
      setTerm(format(subject));
      onSubmit(subject);
    }
  }

  return (
    <div className="diseases">
      <Combobox
        openOnFocus={true}
        onSelect={term => {
          setSelected(term);
          handleSubmit(term);
        }}
      >
        <ComboboxInput
          placeholder="Select a disease"
          selectOnClick={true}
          autoComplete="off"
          onChange={e => {
            setTerm(e.target.value);
            setSelected(null);
          }}
        />
        <ComboboxPopover>
          <ComboboxList persistSelection={true}>
            {sorted.map(subject => (
              <ComboboxOption key={subject.name} value={format(subject)} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
      <Button
        disabled={
          !DISEASES.find(subject => format(subject) === term) ||
          term === selected
        }
        onClick={() => {
          setSelected(term);
          handleSubmit(term);
        }}
      >
        Add
      </Button>
    </div>
  );
}

Diseases.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

function format(subject) {
  return subject.alternateName
    ? `${subject.alternateName} (${subject.name})`
    : subject.name;
}
