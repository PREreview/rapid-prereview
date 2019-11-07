import React, { useRef, useEffect } from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';

export default function LeftSidePanel({
  visible,
  children,
  onClickOutside = noop
}) {
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current.contains(e.target)) {
        // inside click
        return;
      }

      if (!hasNoclickoutside(e.target)) {
        // outside click
        onClickOutside();
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClickOutside]);

  return (
    <div
      ref={ref}
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
  children: PropTypes.any,
  onClickOutside: PropTypes.func
};

function hasNoclickoutside(node) {
  if (!node) return false;

  let el = node;
  while (el && el.hasAttribute) {
    if (el.hasAttribute('data-noclickoutside')) {
      return true;
    }
    el = el.parentElement;
  }

  return false;
}
