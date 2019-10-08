import React from 'react';
import noop from 'lodash/noop';

export default function IconButton(props) {
  const { children, className, onMouseUp = noop, ...buttonProps } = props;

  return (
    <button
      className={`icon-button ${className ? className : ''}`}
      {...buttonProps}
      onMouseUp={e => {
        /* having a focus style forces button to catch a sticky focus appearance.
        Blur onMouseUp to release that focus appearance for mouse click only. */
        e.currentTarget.blur();
        onMouseUp(e);
      }}
    >
      <div className="icon-button__contents">{children}</div>
    </button>
  );
}
