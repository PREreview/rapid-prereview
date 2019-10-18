import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getId, unprefix, arrayify } from '../utils/jsonld';
import { getDefaultRole } from '../utils/users';
import Button from './button';
import Modal from './modal';
import RoleEditor from './role-editor';
import { RoleBadgeUI } from './role-badge';
import Controls from './controls';
import { usePostAction } from '../hooks/api-hooks';

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

      <ul className="settings__persona-list">
        {arrayify(user.hasRole).map(role => (
          <li key={getId(role)} className="settings__persona-list-item">
            <div className="settings__persona-list-item__left">
              <RoleBadgeUI role={role} />

              <Link to={`/about/${unprefix(getId(role))}`}>
                {role.name || unprefix(getId(role))}
              </Link>

              <span className="settings__persona-status">
                {role['@type'] === 'PublicReviewerRole'
                  ? 'Public'
                  : 'Anonymous'}
              </span>
            </div>
            <div className="settings__persona-list-item__right">
              {getId(role) === getId(defaultRole) ? (
                <ActivePersonaInfoModalButton role={role} />
              ) : (
                <MakeActivePersonaModalButton user={user} role={role} />
              )}
              <Button
                onClick={() => {
                  setEditedRoleId(getId(role));
                }}
              >
                Edit
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {!!editedRoleId && (
        <Modal
          title="Edit Role"
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

function ActivePersonaInfoModalButton({ role }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <Button
        primary={true}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Active persona
      </Button>

      {isOpen && (
        <Modal
          onClose={() => {
            setIsOpen(false);
          }}
          title="info"
          showCloseButton={true}
        >
          <p>
            The <strong>active</strong> persona is the persona that will be used
            when you write <em>new</em> Rapid PREreviews or <em>new</em> request
            for feedback on preprints. It can be changed at any time.
          </p>
        </Modal>
      )}
    </Fragment>
  );
}
ActivePersonaInfoModalButton.propTypes = {
  role: PropTypes.object.isRequired
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
        Make active
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
