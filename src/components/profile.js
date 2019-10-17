import React from 'react';
import { useParams } from 'react-router-dom';
import HeaderBar from './header-bar';
import { useRole } from '../hooks/api-hooks';
import RoleActivity from './role-activity';

// TODO:
// - other public persona + number of private persona
// - latest activity (with counts of rapid PREreviews and counts of request for rapid PREreviews)

export default function Profile() {
  const { roleId: unprefixedRoleId } = useParams();
  const roleId = `role:${unprefixedRoleId}`;

  const [role, fetchRoleProgress] = useRole(roleId);

  return (
    <div className="profile">
      <HeaderBar />

      <h2>Profile</h2>

      {!!role && <pre>{JSON.stringify(role, null, 2)}</pre>}

      <h2>Activity</h2>

      <RoleActivity roleId={roleId} />
    </div>
  );
}
