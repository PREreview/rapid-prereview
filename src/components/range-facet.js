import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '@reach/tooltip';

export default function RangeFacet({
  type,
  range = { '1+': 0, '2+': 0, '3+': 0, '4+': 0, '5+': 0 },
  value
}) {
  const values = Object.values(range);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="range-facet">
      <div className="range-facet__bars">
        {[1, 2, 3, 4, 5].map(i => {
          const key = `${i}+`;
          const checked = value === i;
          const na = value && i < value;

          return (
            <div key={key}>
              <Tooltip label={`With at least ${i} ${type}${i > 1 ? 's' : ''}`}>
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
                      height: na
                        ? '1em'
                        : `${1.3 + rescale(range[key], { min, max })}em`
                    }}
                  >
                    {na ? '-' : range[key]}
                  </span>
                </label>
              </Tooltip>
              <input
                type="checkbox"
                id={`${type}-${key}`}
                name={key}
                checked={checked}
                onChange={() => {
                  console.log('change');
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

RangeFacet.propTypes = {
  type: PropTypes.oneOf(['review', 'request']).isRequired,
  range: PropTypes.shape({
    '1+': PropTypes.number,
    '2+': PropTypes.number,
    '3+': PropTypes.number,
    '4+': PropTypes.number,
    '5+': PropTypes.number
  }),
  value: PropTypes.oneOf([1, 2, 3, 4, 5])
};

function rescale(x, { a = 0, b = 1, min, max }) {
  return ((b - a) * (x - min)) / (max - min) + a;
}
