import React from 'react';
import PropTypes from 'prop-types';

export default function CountBadge({
  count = 0,
  backgroundColor,
  foregroundColor,
  size,
  className = ''
}) {
  let style = {};

  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }

  if (foregroundColor) {
    style.foregroundColor = foregroundColor;
  }

  if (size) {
    style.height = size;
    style.minWidth = size;
  }

  return (
    <div style={style} className={`count-badge ${className}`}>
      <svg className="count-badge__number" viewBox="0 0 24 24">
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fill="currentcolor"
          fontSize="18px"
        >
          {count}
        </text>
      </svg>
    </div>
  );
}

CountBadge.propTypes = {
  count: PropTypes.number,
  backgroundColor: PropTypes.string,
  foregroundColor: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string
};
