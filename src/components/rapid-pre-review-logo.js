import React from 'react';
import { Link } from 'react-router-dom';
import PreReviewLogo from '../svgs/prereview-logo.svg';

export default function RapidPreReviewLogo() {
  return (
    <div className="rapid-pre-review-logo">
      <Link to="/">
        <PreReviewLogo className="rapid-pre-review-logo__svg" />
      </Link>
    </div>
  );
}
