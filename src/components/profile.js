import React, { Fragment, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MdPublic } from 'react-icons/md';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import HeaderBar from './header-bar';
import { useRole } from '../hooks/api-hooks';
import RoleActivity from './role-activity';
import LabelStyle from './label-style';

// TODO:
// - other public persona + number of private persona
// - latest activity (with counts of rapid PREreviews and counts of request for rapid PREreviews)

export default function Profile() {
  const { roleId: unprefixedRoleId } = useParams();
  const roleId = `role:${unprefixedRoleId}`;

  const [role, fetchRoleProgress] = useRole(roleId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const user = role && role.isRoleOf;

  return (
    <div className="profile">
      <HeaderBar />
      <section className="profile__content">
        <header className="profile__header">
          {role && role.avatar && role.avatar.contentUrl ? (
            <img
              src={role.avatar.contentUrl}
              alt="avatar"
              className="profile__avatar-img"
            />
          ) : null}

          <section className="profile__identity-info">
            <header className="profile__indentity-info-header">
              <h2 className="profile__username">
                {role && role.name ? role.name : unprefixedRoleId}
              </h2>
              {!!role && (
                <span className="profile__persona-status">
                  {role['@type'] === 'PublicReviewerRole' ? (
                    <div className="profile__persona-status__icon-container">
                      <MdPublic className="profile__persona-status__icon" />{' '}
                      Public
                    </div>
                  ) : (
                    <div className="profile__persona-status__icon-container">
                      <IncognitoIcon className="profile__persona-status__icon" />{' '}
                      Anonymous
                    </div>
                  )}
                </span>
              )}
            </header>

            <dl>
              <dt>
                <LabelStyle>Rapid PREreview identifier</LabelStyle>
              </dt>
              <dd>
                <Link to={`/about/${unprefixedRoleId}`}>
                  {unprefixedRoleId}
                </Link>
              </dd>
              {!!role && (
                <Fragment>
                  <dt>
                    <LabelStyle>Identity</LabelStyle>
                  </dt>
                  <dd>
                    {role['@type'] === 'AnonymousReviewerRole'
                      ? 'Anonymous'
                      : 'Public'}
                  </dd>
                </Fragment>
              )}

              {!!user && (
                <Fragment>
                  <dt>
                    <LabelStyle>ORCID</LabelStyle>
                  </dt>
                  <dd>
                    <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>
                  </dd>
                </Fragment>
              )}

              {!!role && (
                <Fragment>
                  <dt>
                    <LabelStyle>Member since</LabelStyle>
                  </dt>
                  <dd>{format(new Date(role.startDate), 'MMM. d, yyyy')}</dd>
                </Fragment>
              )}
            </dl>
          </section>
        </header>
        <section className="profile__activity-section">
          <h2 className="profile__section-title">Activity</h2>

          <RoleActivity roleId={roleId} />
        </section>
      </section>
    </div>
  );
}
