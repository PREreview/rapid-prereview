import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { getId, unprefix, arrayify } from '../utils/jsonld';
import { getDefaultRole } from '../utils/users';
import Button from './button';
import { MdPublic, MdStar, MdStarBorder } from 'react-icons/md';
import Modal from './modal';
import RoleEditor from './role-editor';
import { RoleBadgeUI } from './role-badge';
import Controls from './controls';
import { usePostAction } from '../hooks/api-hooks';
import IncognitoIcon from '../svgs/incognito_icon.svg';
import XLink from './xlink';

export default function SettingsRoles({ user }) {
  const [editedRoleId, setEditedRoleId] = useState(null);

  const defaultRole = getDefaultRole(user);

  return (
    <section className="settings__section">
      <h3 className="settings__title">Personas</h3>

      <p>
        Personas allow you to manage your identity on Rapid PREreview. Personas
        can be public (linked to your{' '}
        <a href={`https://orcid.org/${user.orcid}`}>ORCID</a> profile) or kept
        anonymous.
      </p>
      <p>
        The <strong>active</strong> persona is the persona that will be used
        when you write <em>new</em> Rapid PREreviews or <em>new</em> request for
        feedback on preprints. It can be changed at any time.
      </p>
      <ul className="settings__persona-list">
        <li className="settings__persona-list-header">
          <div className="settings__persona-list-header__active">
            <span>Active</span>
          </div>
          <span className="settings__persona-list-header__username">
            Username
          </span>
          <span className="settings__persona-list-header__anon">Anonymity</span>
          <span />
        </li>
        <li className="settings__persona-list-divider">
          <hr></hr>
        </li>
        {arrayify(user.hasRole).map(role => (
          <li key={getId(role)} className="settings__persona-list-item">
            <div className="settings__persona-list-item__active-state">
              {getId(role) === getId(defaultRole) ? (
                <span className="settings__persona-list-item__is-active">
                  <MdStar className="settings__persona-active-icon" />
                  <span className="settings__persona-active-label">Active</span>
                </span>
              ) : (
                <MakeActivePersonaModalButton user={user} role={role} />
              )}
            </div>
            <div className="settings__persona-list-item__username">
              <RoleBadgeUI role={role} className="settings__persona-badge" />

              <XLink
                href={`/about/${unprefix(getId(role))}`}
                to={`/about/${unprefix(getId(role))}`}
                className="settings__persona-link"
              >
                {role.name || unprefix(getId(role))}
              </XLink>
            </div>
            <span className="settings__persona-status">
              {role['@type'] === 'PublicReviewerRole' ? (
                <div className="settings__persona-status__icon-container">
                  <MdPublic className="settings__persona-status__icon" />{' '}
                  <span className="settings__persona-status__label">
                    Public
                  </span>
                </div>
              ) : (
                <div className="settings__persona-status__icon-container">
                  <IncognitoIcon className="settings__persona-status__icon" />{' '}
                  <span className="settings__persona-status__label">
                    Anonymous
                  </span>
                </div>
              )}
            </span>
            <Button
              onClick={() => {
                setEditedRoleId(getId(role));
              }}
            >
              Edit
            </Button>
          </li>
        ))}
      </ul>

      {!!editedRoleId && (
        <Modal
          className="settings-role-editor-modal"
          title="Edit Persona Settings"
          onClose={() => {
            setEditedRoleId(null);
          }}
        >
          <RoleEditor
            key={editedRoleId}
            user={user}
            role={arrayify(user.hasRole).find(
              role => getId(role) === editedRoleId
            )}
            onCancel={() => {
              setEditedRoleId(null);
            }}
            onSaved={action => {
              setEditedRoleId(null);
            }}
          />
        </Modal>
      )}
    </section>
  );
}

SettingsRoles.propTypes = {
  user: PropTypes.shape({
    orcid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    defaultRole(props, propName, componentName) {
      if (
        props[propName] &&
        !arrayify(props.hasRole).some(
          role => getId(role) === getId(props[propName])
        )
      ) {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Value must be one of ${arrayify(
            props.hasRole
          )
            .map(getId)
            .filter(Boolean)
            .join(', ')}`
        );
      }
    },
    hasRole: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string.isRequired,
        '@type': PropTypes.oneOf([
          'PublicReviewerRole',
          'AnonymousReviewerRole'
        ]),
        name: PropTypes.string,
        avatar: PropTypes.shape({
          '@type': PropTypes.oneOf(['ImageObject']),
          encodingFormat: PropTypes.oneOf(['image/jpeg', 'image/png']),
          contentUrl: PropTypes.string // base64
        })
      })
    )
  }).isRequired
};

function MakeActivePersonaModalButton({ user, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [post, postProgress] = usePostAction();

  return (
    <Fragment>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <MdStarBorder className="settings__persona-active-icon settings__persona-active-icon--inactive" />
        <span className="settings__persona-active-label">Activate…</span>
      </Button>

      {isOpen && (
        <Modal
          title={`Set active persona to ${role.name || unprefix(getId(role))}`}
        >
          <p>
            The <strong>active</strong> persona is the persona that will be used
            when you write <em>new</em> Rapid PREreviews or <em>new</em> request
            for feedback on preprints. It can be changed at any time.
          </p>

          <Controls error={postProgress.error}>
            <Button
              disabled={postProgress.isActive}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={postProgress.isActive}
              onClick={() => {
                post(
                  {
                    '@type': 'UpdateUserAction',
                    agent: getId(user),
                    object: getId(user),
                    actionStatus: 'CompletedActionStatus',
                    payload: {
                      defaultRole: getId(role)
                    }
                  },
                  body => {
                    setIsOpen(false);
                  }
                );
              }}
            >
              Make active
            </Button>
          </Controls>
        </Modal>
      )}
    </Fragment>
  );
}
MakeActivePersonaModalButton.propTypes = {
  user: PropTypes.object.isRequired,
  role: PropTypes.object.isRequired
};
