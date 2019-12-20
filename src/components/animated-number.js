import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function AnimatedNumber({ value, isAnimating }) {
  const previousValue = usePrevious(value);

  return (
    <div className="animated-number">
      {!!(isAnimating && value !== previousValue) && (
        <div className="animated-number__bg" />
      )}
      <span
        className={classNames('animated-number__value', {
          'animated-number__value--animating':
            value !== previousValue && isAnimating
        })}
      >
        {value}
      </span>
    </div>
  );
}

AnimatedNumber.propTypes = {
  value: PropTypes.number,
  isAnimating: PropTypes.bool
};

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
