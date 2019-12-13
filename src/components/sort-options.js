import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdArrowUpward } from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import { useIsMobile } from '../hooks/ui-hooks';

export default function SortOptions({
  value,
  onChange,
  onMouseEnterSortOption,
  onMouseLeaveSortOption
}) {
  const isMobile = useIsMobile();

  return (
    <div className="sort-options">
      {['score', 'new', 'date'].map(name => (
        <div
          key={name}
          className={classNames('sort-options__item', {
            'sort-options__item--active': name === value
          })}
        >
          <input
            type="radio"
            id={`sort-options-${name}`}
            name={name}
            value={name}
            checked={name === value}
            onChange={e => {
              const sortOption = e.target.value;
              onChange(sortOption);
              if (!isMobile) {
                onMouseLeaveSortOption(sortOption);
              }
            }}
          />
          <Tooltip
            label={`Sort by ${
              name === 'score'
                ? 'trending score (number of reviews and requests divided by time elapsed since first activity)'
                : name === 'new'
                ? 'date of last activity'
                : 'date posted on preprint server'
            }`}
          >
            <label
              className="sort-options__item-text"
              htmlFor={`sort-options-${name}`}
              onMouseEnter={() => {
                if (!isMobile) {
                  onMouseEnterSortOption(name);
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  onMouseLeaveSortOption(name);
                }
              }}
            >
              {name === 'score'
                ? 'Trending'
                : name === 'new'
                ? 'Recently Active'
                : isMobile
                ? 'Date Posted'
                : 'Preprint Server Post Date'}
            </label>
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
  value: PropTypes.oneOf(['score', 'new', 'date']),
  onMouseEnterSortOption: PropTypes.func.isRequired,
  onMouseLeaveSortOption: PropTypes.func.isRequired
};
