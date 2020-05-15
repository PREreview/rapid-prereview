import React, { useState, useMemo } from 'react';
import matchSorter from 'match-sorter';
import PropTypes from 'prop-types';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption
} from '@reach/combobox';
import { MdAdd } from 'react-icons/md';
import { DISEASES } from '../constants';
import IconButton from './icon-button';

export default function Diseases({ onSubmit, blacklist = [] }) {
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const featured = useMemo(() => {
    return DISEASES.filter(
      subject => subject.featured
    )
  })

  const options = useMemo(() => {
    return DISEASES.filter(
      subject =>
        !blacklist.some(_subject => format(_subject) === format(subject))
    );
  }, [blacklist]);

  const sorted = useMemo(() => {
    return term.trim() === ''
      ? options
      : matchSorter(options, term, {
          keys: [subject => format(subject)]
        });
  }, [term, options]);

  function handleSubmit(value) {
    const subject = options.find(subject => format(subject) === value);
    if (subject) {
      setTerm(format(subject));
      onSubmit(subject);
    }
  }

  return (
    <div className="diseases">
      <Combobox
        className="diseases__combobox"
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
        <ComboboxPopover
          portal={
            false /* rendering a portal within a portal (modal) is currently bugged */
          }
          className="diseases__combobox-popover"
        >
          <ComboboxList persistSelection={true}>
            {featured.map(subject => (
              <ComboboxOption className="diseases__featured" key={subject.name} value={format(subject)} />
            ))}
            {sorted.map(subject => (
              <ComboboxOption key={subject.name} value={format(subject)} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
      <IconButton
        className="diseases__add-button"
        disabled={
          !options.find(subject => format(subject) === term) ||
          term === selected
        }
        onClick={() => {
          setSelected(term);
          handleSubmit(term);
        }}
      >
        <MdAdd className="diseases__add-icon" />
      </IconButton>
    </div>
  );
}

Diseases.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  blacklist: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      alternateName: PropTypes.string
    })
  )
};

function format(subject) {
  return subject.alternateName
    ? `${subject.alternateName} (${subject.name})`
    : subject.name;
}
