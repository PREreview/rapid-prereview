import React, { useState, createRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import VisuallyHidden from '@reach/visually-hidden';
import noop from 'lodash/noop';
import { MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import classNames from 'classnames';

export default function RadioButton({
  inputId,
  label,
  className,
  disabled = false,

  ...inputProps
}) {
  const inputRef = createRef();

  return (
    <div
      className={classNames('radio-button', className, {
        'radio-button--disabled': disabled
      })}
    >
      {/*  The label element is responsible for triggering the onChange callback 
      of the radio-button since the native radio-button element will be visually hidden. */}
      <label htmlFor={inputId} className="radio-button__contents">
        <input
          className="radio-button__input"
          disabled={disabled}
          id={inputId}
          type="radio"
          ref={inputRef}
          {...inputProps}
        />

        <span className="radio-button__label">{label}</span>
      </label>
    </div>
  );
}

RadioButton.propTypes = {
  inputId: PropTypes.string,
  label: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool
};
