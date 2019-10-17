import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import { unprefix } from '../utils/jsonld';
import { useRole } from '../hooks/api-hooks';

export default function RoleBadge({ roleId, children }) {
  const [role, fetchRoleProgress] = useRole(roleId);

  return (
    <Menu>
      <MenuButton
        className="role-badge"
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
