import React from 'react';
import PropTypes from 'prop-types';
import { MdMenu } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import RapidPreReviewLogo from './rapid-pre-review-logo';
import IconButton from './icon-button';
import { useUser } from '../contexts/user-context';

export default function HeaderBar({ onClickMenuButton }) {
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
        <span className="header-bar__nav-item">
          {user ? (
            <Menu>
              <MenuButton>{user.name}</MenuButton>
              <MenuList>
                <MenuLink href="/auth/logout">Logout</MenuLink>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </span>
      </div>
    </div>
  );
}

HeaderBar.propTypes = {
  onClickMenuButton: PropTypes.func.isRequired
};
