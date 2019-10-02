import React from 'react';
import { MdMenu } from 'react-icons/md';
import RapidPreReviewLogo from './rapid-pre-review-logo';
import IconButton from './icon-button';

export default function HeaderBar(props) {
  const { onClickMenuButton } = props;

  return (
    <div className="header-bar">
      <div className="header-bar__left">
        <IconButton
          onClick={onClickMenuButton}
          className="header-bar__menu-button"
        >
          <MdMenu className="header-bar__menu-button-icon" />
        </IconButton>
        <RapidPreReviewLogo />
      </div>

      <div className="header-bar__right">
        <span className="header-bar__nav-item">Get Browser Extension</span>
        <span className="header-bar__nav-item">About</span>
        <span className="header-bar__nav-item">PREreview</span>
        <span className="header-bar__nav-item">Login</span>
      </div>
    </div>
  );
}
