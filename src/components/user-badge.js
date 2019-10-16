import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import { unprefix, getId } from '../utils/jsonld';

export default function UserBadge({ user, children }) {
  return (
    <Menu>
      <MenuButton>{user.name}</MenuButton>
      {/* Note: MenuList is currently bugged if children is undefined hence the ternary */}
      {children ? (
        <MenuList>
          <MenuLink href={`/about/${unprefix(getId(user))}`}>Profile</MenuLink>
          {children}
        </MenuList>
      ) : (
        <MenuList>
          <MenuLink href={`/about/${unprefix(getId(user))}`}>Profile</MenuLink>
        </MenuList>
      )}
    </Menu>
  );
}

UserBadge.propTypes = {
  user: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf([
      'Person',
      'PublicReviewerRole',
      'AnonymousReviewerRole'
    ]).isRequired,
    name: PropTypes.string,
    avatar: PropTypes.shape({
      '@type': PropTypes.oneOf(['ImageObject']),
      contentUrl: PropTypes.string
    })
  }).isRequired,
  children: PropTypes.any
};
