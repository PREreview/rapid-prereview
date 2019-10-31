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
import XLink from './xlink';

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
        <Link className="header-bar__nav-item" to="/app">
          Get App
        </Link>
        <span className="header-bar__nav-item header-bar__nav-item--user-badge">
          {user ? (
            <UserBadge user={user}>
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/settings'}
                href={
                  process.env.IS_EXTENSION
                    ? `${process.env.API_URL}/settings`
                    : undefined
                }
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Settings
              </MenuLink>
              <MenuLink href={`${process.env.API_URL}/auth/logout`}>
                Logout
              </MenuLink>
            </UserBadge>
          ) : (
            <XLink to="/login" href="/login">
              Login
            </XLink>
          )}
        </span>
      </div>
    </div>
  );
}

HeaderBar.propTypes = {
  onClickMenuButton: PropTypes.func
};
