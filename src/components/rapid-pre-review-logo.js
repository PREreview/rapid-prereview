import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import PreReviewLogo from '../svgs/rapid-prereview-icon.svg';

export default function RapidPreReviewLogo({ short = false }) {
  return (
    <div
      className={classNames('rapid-pre-review-logo', {
        'rapid-pre-review-logo--short': short
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
        {/* <OutbreakScienceLogo className="rapid-pre-review-logo__os-logo-svg" /> */}
      </Link>
    </div>
  );
}

RapidPreReviewLogo.propTypes = {
  short: PropTypes.bool
};
