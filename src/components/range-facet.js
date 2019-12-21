import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';

export default function RangeFacet({
  type,
  range,
  value,
  isFetching,
  onChange
}) {
  const location = useLocation();
  const search = location.search;

  const prevRangeRef = useRef();
  const prevUnfilteredRangeRef = useRef();
  const prevSearchRef = useRef();

  // we buffer the prev values to remember the counts in case the user select a
  // facet
  useEffect(() => {
    if (range) {
      prevRangeRef.current = range;
    }
  }, [range]);

  useEffect(() => {
    prevSearchRef.current = search;
  }, [search]);

  const isSameQuery = checkIfIsSameQuery(type, search, prevSearchRef.current);

  const hasOneSelected = value != null;

  useEffect(() => {
    if (!isFetching && range && isSameQuery && !hasOneSelected) {
      prevUnfilteredRangeRef.current = range;
    }
  }, [hasOneSelected, isSameQuery, search, range, type, isFetching]);

  const overwrite =
    !!(isFetching && isSameQuery && prevUnfilteredRangeRef.current) ||
    !!(hasOneSelected && isSameQuery && prevUnfilteredRangeRef.current) ||
    !!(
      !hasOneSelected &&
      isSameQuery &&
      prevUnfilteredRangeRef.current &&
      !new URLSearchParams(search).has(
        type === 'review' ? 'minimumReviews' : 'minimumRequests'
      ) &&
      new URLSearchParams(prevSearchRef.current).has(
        type === 'review' ? 'minimumReviews' : 'minimumRequests'
      )
    );

  const eRange = overwrite
    ? prevUnfilteredRangeRef.current
    : range || prevRangeRef.current;
  const values = Object.values(eRange || {});
  let min, max;
  if (values.length) {
    min = Math.min(...values);
    max = Math.max(...values);
  }

  return (
    <div className="range-facet">
      <div className="range-facet__bars">
        {[1, 2, 3, 4, 5].map(i => {
          const key = `${i}+`;
          const checked = value === i;
          const na =
            (!range && !prevRangeRef.current) ||
            (!prevUnfilteredRangeRef.current && hasOneSelected && i < value);

          const height = na
            ? '1.3'
            : `${(eRange[key] ? 1.3 : 0) + rescale(eRange[key], { min, max })}`;

          const maxHeight = 2.3;

          return (
            <div key={key}>
              <Tooltip
                label={`Number of preprints with at least ${i} ${type}${
                  i > 1 ? 's' : ''
                }`}
              >
                <label
                  htmlFor={`${type}-${key}`}
                  className={classNames('range-facet__label', {
                    'range-facet__label--na': na,
                    'range-facet__label--active': checked,
                    'range-facet__label--disabled': eRange && !eRange[key]
                  })}
                >
                  <span className="range-facet__caption">{key}</span>

                  <span
                    className="range-facet__count"
                    style={{
                      height: `${height}em`
                    }}
                  >
                    <span className="range-facet__count-text">
                      {na ? '-' : eRange[key]}
                    </span>
                  </span>
                  <span
                    className="range-facet__count-filler"
                    style={{
                      height: `${maxHeight - height}em`
                    }}
                  />
                </label>
              </Tooltip>
              <input
                type="checkbox"
                id={`${type}-${key}`}
                name={i}
                checked={checked}
                disabled={isFetching || !eRange[key]}
                onChange={onChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

RangeFacet.propTypes = {
  isFetching: PropTypes.bool,
  type: PropTypes.oneOf(['review', 'request']).isRequired,
  range: PropTypes.shape({
    '1+': PropTypes.number,
    '2+': PropTypes.number,
    '3+': PropTypes.number,
    '4+': PropTypes.number,
    '5+': PropTypes.number
  }),
  value: PropTypes.oneOf([1, 2, 3, 4, 5]),
  onChange: PropTypes.func.isRequired
};

function rescale(x, { a = 0, b = 1, min, max }) {
  if (min === max) {
    return 1;
  }
  return ((b - a) * (x - min)) / (max - min) + a;
}

function checkIfIsSameQuery(type, search, prevSearch) {
  const p1 = new URLSearchParams(search);
  const p2 = new URLSearchParams(prevSearch);
  if (type === 'review') {
    p1.delete('minimumReviews');
    p2.delete('minimumReviews');
  } else if (type === 'request') {
    p1.delete('minimumRequests');
    p2.delete('minimumRequests');
  }

  return p1.toString() == p2.toString();
}
