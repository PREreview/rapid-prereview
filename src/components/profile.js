import React, { Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
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

  const user = role && role.isRoleOf;

  return (
    <div className="profile">
      <HeaderBar />

      <header>
        {role && role.avatar && role.avatar.contentUrl ? (
          <img src={role.avatar.contentUrl} alt="avatar" />
        ) : null}
        <h2>{role && role.name ? role.name : unprefixedRoleId}</h2>

        <dl>
          <dt>Rapid PREreview identifier</dt>
          <dd>
            <Link to={`/about/${unprefixedRoleId}`}>{unprefixedRoleId}</Link>
          </dd>
          {!!role && (
            <Fragment>
              <dt>Identity</dt>
              <dd>
                {role['@type'] === 'AnonymousReviewerRole'
                  ? 'Anonymous'
                  : 'Public'}
              </dd>
            </Fragment>
          )}

          {!!user && (
            <Fragment>
              <dt>ORCID</dt>
              <dd>
                <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>
              </dd>
              <dt>Member since</dt>
              <dd>{format(new Date(user.dateCreated), 'MMM. d, yyyy')}</dd>
            </Fragment>
          )}
        </dl>
      </header>

      <h2>Activity</h2>

      <RoleActivity roleId={roleId} />
    </div>
  );
}
