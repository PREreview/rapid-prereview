import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdArrowUpward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';

export default function SortOptions({ value, onChange }) {
  return (
    <div className="sort-options">
      {['score', 'new', 'date'].map(name => (
        <div key={name} className="sort-options__item">
          <input
            type="radio"
            id={`sort-options-${name}`}
            name={name}
            value={name}
            checked={name === value}
            onChange={e => {
              onChange(e.target.value);
            }}
          />
          <Tooltip
            label={`Sort by ${
              name === 'score'
                ? 'trending activity (number of reviews and requests divided by time elapsed since first activity)'
                : name === 'new'
                ? 'date of first review or request for review posted'
                : 'date preprint posted'
            }`}
          >
            <label htmlFor={`sort-options-${name}`}>{name}</label>
          </Tooltip>
          <MdArrowUpward
            className={classNames('sort-options__icon', {
              'sort-options__icon--hidden': name !== value
            })}
          />
        </div>
      ))}
    </div>
  );
}

SortOptions.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOf(['score', 'new', 'date'])
};
