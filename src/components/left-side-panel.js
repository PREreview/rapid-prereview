import React from 'react';
import PropTypes from 'prop-types';

export default function LeftSidePanel({ visible, children }) {
  return (
    <div
      className={`left-side-panel ${
        visible ? 'left-side-panel--visible' : 'left-side-panel--hidden'
      }`}
    >
      <div className="left-side-panel__content">{children}</div>
    </div>
  );
}

LeftSidePanel.propTypes = {
  visible: PropTypes.bool,
  children: PropTypes.any
};
