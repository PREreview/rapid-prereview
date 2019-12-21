import React, { useRef, useEffect } from 'react';
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
  const prevRangeRef = useRef();
  const prevMinRef = useRef();
  const prevMaxRef = useRef();

  const eRange = range || prevRangeRef.current;

  const values = Object.values(eRange || {});
  let min, max;
  if (values.length) {
    min = Math.min(...values);
    max = Math.max(...values);
  }

  // we track prev values to avoid rescaling of the barplot
  useEffect(() => {
    if (range) {
      prevRangeRef.current = range;
    }
    if (min != null) {
      prevMinRef.current = min;
    }
    if (max != null) {
      prevMaxRef.current = max;
    }
  }, [range, min, max, value]);

  if (
    value != null &&
    range &&
    prevRangeRef.current &&
    range[`${value}+`] === prevRangeRef.current[`${value}+`]
  ) {
    if (prevMinRef.current != null) {
      min = Math.min(min, prevMinRef.current);
    }
    if (prevMaxRef.current != null) {
      max = Math.max(max, prevMaxRef.current);
    }
  }

  return (
    <div className="range-facet">
      <div className="range-facet__bars">
        {[1, 2, 3, 4, 5].map(i => {
          const key = `${i}+`;
          const checked = value === i;
          const na = !eRange || (value && i < value);
          const height = na
            ? '1.3'
            : `${1.3 + rescale(eRange[key], { min, max })}`;

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
                    'range-facet__label--active': checked
                  })}
                >
                  <span className="range-facet__caption">{key}</span>

                  <span
                    className="range-facet__count"
                    style={{
                      height: `${height}em`
                    }}
                  >
                    {na ? '-' : eRange[key]}
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
                disabled={isFetching}
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
