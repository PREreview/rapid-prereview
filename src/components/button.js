import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Button({
  children,
  className = '',
  pill = false,
  primary = false,
  ...buttonProps
}) {
  return (
    <button
      className={classNames('button', className, {
        'button--pill': pill,
        'button--primary': primary
      })}
      {...buttonProps}
    >
      <span className="button__contents">{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  pill: PropTypes.bool,
  primary: PropTypes.bool
};
