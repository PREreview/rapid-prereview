import React, { useState, createRef, useEffect } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

export default function TextInput({
  label,
  inputId,
  className,
  minimal = false,
  onChange = noop,
  ...inputProps
}) {
  /**
   * For accessability reasons, this component uses the label as a better
   * alternative to the 'placeholder' attr
   * see: https://www.smashingmagazine.com/2018/06/placeholder-attribute/
   */

  const inputRef = createRef();
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value) {
      console.log('value', inputRef.current.value);
      setEmpty(false);
    }
  }, [inputRef]);

  return (
    <div
      className={classNames('text-input', className, {
        'text-input--minimal': minimal,
        'text-input--empty': empty
      })}
    >
      <label className="text-input__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className="text-input__input"
        ref={inputRef}
        id={inputId}
        type="text"
        onChange={e => {
          if (e.currentTarget.value) {
            setEmpty(false);
          } else {
            setEmpty(true);
          }
          onChange(e);
        }}
        {...inputProps}
      />
    </div>
  );
}
