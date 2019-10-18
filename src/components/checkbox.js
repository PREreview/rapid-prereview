import React, { useState } from 'react';
import PropTypes from 'prop-types';
import VisuallyHidden from '@reach/visually-hidden';
import noop from 'lodash/noop';
import { MdCheckBoxOutlineBlank, MdCheckBox } from 'react-icons/md';

import classNames from 'classnames';

export default function Checkbox({
  inputId,
  label,
  onBlur = noop,
  className,
  disabled = false,
  checked = false,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  const [focusSource, setFocusSource] = useState();

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
      <label
        htmlFor={inputId}
        className="checkbox__contents"
        onMouseDown={e => {
          setFocusSource('mouse');
        }}
        onFocus={e => {
          if (focusSource !== 'mouse') {
            setFocused(true);
            setFocusSource(undefined);
          }
        }}
      >
        <VisuallyHidden>
          <input
            className="checkbox__input"
            disabled={disabled}
            id={inputId}
            type="checkbox"
            checked={checked}
            {...inputProps}
            onBlur={e => {
              setFocused(false);
              onBlur(e);
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
  onBlur: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool
};
