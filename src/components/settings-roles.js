import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getId, unprefix, arrayify } from '../utils/jsonld';
import Button from './button';
import Modal from './modal';
import RoleEditor from './role-editor';

export default function SettingsRoles({ user }) {
  const [editedRoleId, setEditedRoleId] = useState(null);

  return (
    <section>
      <h3>Personas</h3>

      <p>
        Personas allow you to manage your identity on Rapid PREreview. Personas
        can be public (linked to your{' '}
        <a href={`https://orcid.org/${user.orcid}`}>ORCID</a> profile) or kept
        anonymous.
      </p>

      <ul>
        {arrayify(user.hasRole).map(role => (
          <li key={getId(role)}>
            <span>{role.name || unprefix(getId(role))}</span>

            <span>
              {role['@type'] === 'PublicReviewerRole' ? 'Public' : 'Anonymous'}
            </span>

            <Button
              onClick={() => {
                setEditedRoleId(getId(role));
              }}
            >
              Edit
            </Button>
            <Button>Make Default</Button>
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
            role={arrayify(user.hasRole).find(
              role => getId(role) === editedRoleId
            )}
            onCancel={() => {
              setEditedRoleId(null);
            }}
            onSaved={() => {
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
