import React from 'react';

export default function IconButton(props) {
  const { children, className, ...buttonProps } = props;

  return (
    <button
      className={`icon-button ${className ? className : ''}`}
      {...buttonProps}
    >
      <div className="icon-button__contents">{children}</div>
    </button>
  );
}
