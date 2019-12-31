import React from 'react';
import PropTypes from 'prop-types';

export default function ToggleSwitch({
  id,
  checked,
  disabled,
  onChange,
  children
}) {
  return (
    <div className="toggle-switch">
      <input
        className="toggle-switch__input"
        type="checkbox"
        disabled={disabled}
        id={id}
        checked={checked}
        onChange={onChange}
      />
      <label className="toggle-switch__label" htmlFor={id}>
        {children}
      </label>
    </div>
  );
}

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.any
};
