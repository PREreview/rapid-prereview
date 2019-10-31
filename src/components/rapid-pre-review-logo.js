import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import PreReviewLogo from '../svgs/rapid-prereview-icon.svg';

export default function RapidPreReviewLogo({
  short = false,
  responsive = true
}) {
  return (
    <div
      className={classNames('rapid-pre-review-logo', {
        'rapid-pre-review-logo--short': short,
        'rapid-pre-review-logo--responsive': responsive
      })}
    >
      <Link to="/" className="rapid-pre-review-logo__svg-container">
        <PreReviewLogo className="rapid-pre-review-logo__icon-svg" />
        <div className="rapid-pre-review-logo__outbreak-science">
          <span className="rapid-pre-review-logo__outbreak-science__outbreak">
            Outbreak
          </span>{' '}
          <span className="rapid-pre-review-logo__outbreak-science__science">
            Science
          </span>
        </div>
      </Link>
    </div>
  );
}

RapidPreReviewLogo.propTypes = {
  short: PropTypes.bool,
  responsive: PropTypes.bool
};
