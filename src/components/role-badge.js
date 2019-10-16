import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import { unprefix } from '../utils/jsonld';
import { useRole } from '../hooks/api-hooks';

export default function RoleBadge({ roleId, children }) {
  const [role, fetchRoleProgress] = useRole(roleId);

  if (fetchRoleProgress.isActive) {
    return null;
  }

  return (
    <Menu>
      <MenuButton
        style={
          role.avatar && role.avatar.contentUrl
            ? { background: `url(${role.avatar.contentUrl})` }
            : undefined
        }
      >
        {role.name}
      </MenuButton>
      {/* Note: MenuList is currently bugged if children is undefined hence the ternary */}
      {children ? (
        <MenuList>
          <MenuLink href={`/about/${unprefix(roleId)}`}>Profile</MenuLink>
          {children}
        </MenuList>
      ) : (
        <MenuList>
          <MenuLink href={`/about/${unprefix(roleId)}`}>Profile</MenuLink>
        </MenuList>
      )}
    </Menu>
  );
}

RoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired,
  children: PropTypes.any
};
