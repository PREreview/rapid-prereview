import React from 'react';
import PropTypes from 'prop-types';

export default function TagPill({
  children,
  backgroundColor,
  foregroundColor
}) {
  let style = {};
  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }
  if (foregroundColor) {
    style.color = foregroundColor;
  }

  return (
    <span style={style} className="tag-pill">
      {children}
    </span>
  );
}

TagPill.propTypes = {
  children: PropTypes.any,
  backgroundColor: PropTypes.string,
  foregroundColor: PropTypes.string
};
