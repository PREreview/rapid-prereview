import React, { useState } from 'react';
import PropTypes from 'prop-types';
import VisuallyHidden from '@reach/visually-hidden';
import noop from 'lodash/noop';
import { MdCheckBoxOutlineBlank, MdCheckBox } from 'react-icons/md';

import classNames from 'classnames';

export default function Checkbox({
  inputId,
  label,
  onChange = noop,
  onFocus = noop,
  onBlur = noop,
  className,
  disabled = false,
  ...inputProps
}) {
  const [checked, setChecked] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={classNames('checkbox', className, {
        'checkbox--checked': checked,
        'checkbox--disabled': disabled,
        'checkbox--focused': focused
      })}
    >
      {/*  The label element is responsible for triggering the onChange callback 
      of the Checkbox since the native checkbox element will be visually hidden. */}
      <label htmlFor={inputId} className="checkbox__contents">
        <VisuallyHidden>
          <input
            className="checkbox__input"
            disabled={disabled}
            id={inputId}
            type="checkbox"
            {...inputProps}
            onFocus={e => {
              setFocused(true);
              onFocus(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur(e);
            }}
            onChange={e => {
              setChecked(e.currentTarget.checked);
              onChange(e);
            }}
          />
        </VisuallyHidden>
        <div className="checkbox__icon-container">
          {checked ? (
            <MdCheckBox className="checkbox__icon" />
          ) : (
            <MdCheckBoxOutlineBlank className="checkbox__icon" />
          )}
        </div>
        <span className="checkbox__label">{label}</span>
      </label>
    </div>
  );
}

Checkbox.propTypes = {
  inputId: PropTypes.string,
  label: PropTypes.any,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool
};
