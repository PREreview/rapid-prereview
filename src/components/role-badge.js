import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import classNames from 'classnames';
import { unprefix, getId } from '../utils/jsonld';
import { useRole } from '../hooks/api-hooks';

const RoleBadge = React.forwardRef(function RoleBadge(
  { roleId, children, className },
  ref
) {
  const [role, fetchRoleProgress] = useRole(roleId);

  return (
    <RoleBadgeUI
      ref={ref}
      roleId={roleId}
      role={role}
      fetchRoleProgress={fetchRoleProgress}
      className={className}
    >
      {children}
    </RoleBadgeUI>
  );
});

RoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired,
  children: PropTypes.any,
  className: PropTypes.string
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  { roleId, role, fetchRoleProgress, className, children },
  ref
) {
  if (roleId == null && fetchRoleProgress == null && !!role) {
    roleId = getId(role);
    fetchRoleProgress = {
      isActive: false,
      error: null
    };
  }

  return (
    <Menu>
      <MenuButton
        className={classNames('role-badge-menu', className, {
          'role-badge-menu--loading':
            fetchRoleProgress && fetchRoleProgress.isActive
        })}
      >
        {/*NOTE: the `ref` is typically used for Drag and Drop: we need 1 DOM element that will be used as the drag preview */}
        <div ref={ref}>
          <div
            className={classNames('role-badge-menu__generic-icon-container')}
          >
            <MdPerson className="role-badge-menu__generic-icon" />
          </div>

          <div
            className={classNames('role-badge-menu__avatar', {
              'role-badge-menu__avatar--loaded':
                !!role &&
                role.avatar &&
                role.avatar.contentUrl &&
                (fetchRoleProgress && !fetchRoleProgress.isActive)
            })}
            style={
              role && role.avatar && role.avatar.contentUrl
                ? {
                    backgroundImage: `url(${role.avatar.contentUrl})`,
                    backgroundSize: 'contain'
                  }
                : undefined
            }
          ></div>
        </div>
      </MenuButton>

      {/* Note: MenuList is currently bugged if children is undefined hence the ternary */}
      {children ? (
        <MenuList className="menu__list">
          <MenuLink
            as={process.env.IS_EXTENSION ? undefined : Link}
            className="menu__list__link-item"
            href={
              process.env.IS_EXTENSION
                ? `${process.env.API_URL}/about/${unprefix(roleId)}`
                : undefined
            }
            target={process.env.IS_EXTENSION ? '_blank' : undefined}
            to={
              process.env.IS_EXTENSION
                ? undefined
                : `/about/${unprefix(roleId)}`
            }
          >
            {role && role.name && role.name !== unprefix(roleId)
              ? `${role.name} (${unprefix(roleId)})`
              : `View Profile (${unprefix(roleId)})`}
          </MenuLink>
          {children}
        </MenuList>
      ) : (
        <MenuList className="menu__list">
          <MenuLink
            as={process.env.IS_EXTENSION ? undefined : Link}
            className="menu__list__link-item"
            href={
              process.env.IS_EXTENSION
                ? `${process.env.API_URL}/about/${unprefix(roleId)}`
                : undefined
            }
            target={process.env.IS_EXTENSION ? '_blank' : undefined}
            to={
              process.env.IS_EXTENSION
                ? undefined
                : `/about/${unprefix(roleId)}`
            }
          >
            {role && role.name && role.name !== unprefix(roleId)
              ? `${role.name} (${unprefix(roleId)})`
              : `View Profile (${unprefix(roleId)})`}
          </MenuLink>
        </MenuList>
      )}
    </Menu>
  );
});

RoleBadgeUI.propTypes = {
  roleId: PropTypes.string,
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
  }),
  children: PropTypes.any,
  className: PropTypes.string
};

export { RoleBadgeUI };
