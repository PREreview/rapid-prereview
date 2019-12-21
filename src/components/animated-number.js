import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { usePrevious } from '../hooks/ui-hooks';

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
