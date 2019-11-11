import React from 'react';
import PropTypes from 'prop-types';
import RoleBadge from './role-badge';

export default function UserBadge({ user, children, ...others }) {
  return (
    <RoleBadge {...others} roleId={user.defaultRole}>
      {children}
    </RoleBadge>
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
    orcid: PropTypes.string.isRequired,
    defaultRole: PropTypes.string.isRequired,
    hasRole: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  children: PropTypes.any
};
