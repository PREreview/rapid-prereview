import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import XLink from './xlink';

export default function Button({
  children,
  className = '',
  pill = false,
  primary = false,
  onMouseUp = noop,
  element = 'button',
  isWaiting = false,
  ...buttonProps
}) {
  const El = element === 'XLink' ? XLink : element;
  return (
    <El
      className={classNames('button', className, {
        'button--pill': pill,
        'button--primary': primary,
        'button--waiting': isWaiting
      })}
      {...buttonProps}
      onMouseUp={e => {
        /* having a focus style forces button to catch a sticky focus appearance.
           Blur onMouseUp to release that focus appearance for mouse click only. */
        e.currentTarget.blur();
        onMouseUp(e);
      }}
    >
      <span className="button__contents">
        {children}
        <div className="button__heartbeat" />
      </span>
    </El>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  pill: PropTypes.bool,
  primary: PropTypes.bool,
  onMouseUp: PropTypes.func,
  element: PropTypes.string,
  isWaiting: PropTypes.bool
};
