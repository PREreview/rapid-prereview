import React from 'react';
import RapidPreReviewLogo from './rapid-pre-review-logo';

export default function HeaderBar() {
  return (
    <div className="header-bar">
      <RapidPreReviewLogo />
      <div className="header-bar__right">
        <span className="header-bar__nav-item">Get Browser Extension</span>
        <span className="header-bar__nav-item">About</span>
        <span className="header-bar__nav-item">PREreview</span>
        <span className="header-bar__nav-item">Login</span>
      </div>
    </div>
  );
}
