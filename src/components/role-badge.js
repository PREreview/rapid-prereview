import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button';
import classNames from 'classnames';
import Tooltip from '@reach/tooltip';
import { unprefix, getId } from '../utils/jsonld';
import { useRole } from '../hooks/api-hooks';
import NoticeBadge from './notice-badge';

const RoleBadge = React.forwardRef(function RoleBadge(
  { roleId, children, className, tooltip, showNotice },
  ref
) {
  const [role, fetchRoleProgress] = useRole(roleId);

  return (
    <RoleBadgeUI
      ref={ref}
      tooltip={tooltip}
      roleId={roleId}
      role={role}
      fetchRoleProgress={fetchRoleProgress}
      className={className}
      showNotice={showNotice}
    >
      {children}
    </RoleBadgeUI>
  );
});

RoleBadge.propTypes = {
  tooltip: PropTypes.bool,
  roleId: PropTypes.string.isRequired,
  children: PropTypes.any,
  className: PropTypes.string,
  showNotice: PropTypes.bool
};

export default RoleBadge;

/**
 * Non hooked version (handy for story book and `UserBadge`)
 */
const RoleBadgeUI = React.forwardRef(function RoleBadgeUI(
  {
    roleId,
    role,
    fetchRoleProgress,
    className,
    children,
    tooltip,
    showNotice = false
  },
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
      <div className="role-badge-menu-container">
        {showNotice && <NoticeBadge />}
        <MenuButton
          className={classNames('role-badge-menu', className, {
            'role-badge-menu--loading':
              fetchRoleProgress && fetchRoleProgress.isActive
          })}
        >
          {/*NOTE: the `ref` is typically used for Drag and Drop: we need 1 DOM element that will be used as the drag preview */}
          <Tooltipify tooltip={tooltip} role={role} roleId={roleId}>
            <div ref={ref}>
              <div
                className={classNames(
                  'role-badge-menu__generic-icon-container'
                )}
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
          </Tooltipify>
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
                ? `${role.name} (${unprefix(roleId).substring(0, 5)}…)`
                : `View Profile (${unprefix(roleId).substring(0, 5)}…)`}
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
                ? `${role.name} (${unprefix(roleId).substring(0, 5)}…)`
                : `View Profile (${unprefix(roleId).substring(0, 5)}…)`}
            </MenuLink>
          </MenuList>
        )}
      </div>
    </Menu>
  );
});

RoleBadgeUI.propTypes = {
  showNotice: PropTypes.bool,
  tooltip: PropTypes.bool,
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

function Tooltipify({ tooltip, roleId, role, children }) {
  return tooltip ? (
    <Tooltip
      label={
        role && role.name && role.name !== unprefix(roleId)
          ? `${role.name} (${unprefix(roleId).substring(0, 5)}…)`
          : unprefix(roleId)
      }
    >
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  );
}

Tooltipify.propTypes = {
  tooltip: PropTypes.bool,
  roleId: PropTypes.string,
  role: PropTypes.shape({
    name: PropTypes.string
  }),
  children: PropTypes.any
};
