import React from 'react';
import { Link } from 'react-router-dom';
import PreReviewLogo from '../svgs/rapid-prereview-icon.svg';
import OutbreakScienceLogo from '../svgs/outbreak-science-logo.svg';

export default function RapidPreReviewLogo() {
  return (
    <div className="rapid-pre-review-logo">
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
