import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import { unprefix } from '../utils/jsonld';
import { useRole } from '../hooks/api-hooks';

export default function RoleBadge({ roleId, children }) {
  const [role, fetchRoleProgress] = useRole(roleId);

  return (
    <RoleBadgeUI
      roleId={roleId}
      role={role}
      fetchRoleProgress={fetchRoleProgress}
    >
      {children}
    </RoleBadgeUI>
  );
}

RoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired,
  children: PropTypes.any
};

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
export function RoleBadgeUI({
  roleId, // always defined
  role, // may be undefined while fetching
  fetchRoleProgress,
  children
}) {
  return (
    <Menu>
      <MenuButton
        className="role-badge-menu"
        style={
          role && role.avatar && role.avatar.contentUrl
            ? {
                background: `url(${role.avatar.contentUrl})`,
                backgroundSize: 'contain'
              }
            : undefined
        }
      >
        {role && role.avatar && role.avatar.contentUrl
          ? ''
          : (role && role.name) || unprefix(roleId)}
      </MenuButton>

      {/* Note: MenuList is currently bugged if children is undefined hence the ternary */}
      {children ? (
        <MenuList className="menu__list">
          <MenuLink
            as={Link}
            className="menu__list__link-item"
            to={`/about/${unprefix(roleId)}`}
          >
            Profile
          </MenuLink>
          {children}
        </MenuList>
      ) : (
        <MenuList className="menu__list">
          <MenuLink
            as={Link}
            className="menu__list__link-item"
            to={`/about/${unprefix(roleId)}`}
          >
            Profile
          </MenuLink>
        </MenuList>
      )}
    </Menu>
  );
}

RoleBadgeUI.propTypes = {
  roleId: PropTypes.string.isRequired,
  role: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf(['PublicReviewerRole', 'AnonymousReviewerRole'])
      .isRequired,
    name: PropTypes.string,
    avatar: PropTypes.shape({
      '@type': PropTypes.oneOf(['ImageObject']).isRequired,
      encodingFormat: PropTypes.oneOf(['image/jpeg', 'image/png']).isRequired,
      contentUrl: PropTypes.string.isRequired
    })
  }),
  fetchRoleProgress: PropTypes.shape({
    isActive: PropTypes.bool,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  children: PropTypes.any
};
