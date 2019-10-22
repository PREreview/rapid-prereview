import React from 'react';
import PropTypes from 'prop-types';
import { MdMenu } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { MenuLink } from '@reach/menu-button';
import noop from 'lodash/noop';
import RapidPreReviewLogo from './rapid-pre-review-logo';
import IconButton from './icon-button';
import { useUser } from '../contexts/user-context';
import UserBadge from './user-badge';

export default function HeaderBar({ onClickMenuButton = noop }) {
  const [user] = useUser();

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
        <span className="header-bar__nav-item header-bar__nav-item--user-badge">
          {user ? (
            <UserBadge user={user}>
              <MenuLink as={Link} to="/settings">
                Settings
              </MenuLink>
              <MenuLink href="/auth/logout">Logout</MenuLink>
            </UserBadge>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </span>
      </div>
    </div>
  );
}

HeaderBar.propTypes = {
  onClickMenuButton: PropTypes.func
};
