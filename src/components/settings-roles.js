import React from 'react';
import PropTypes from 'prop-types';
import { getId, unprefix } from '../utils/jsonld';
import Value from './value';

export default function SettingsRoles({ user }) {
  return (
    <div>
      <Value tagName="span">{user.name}</Value>
      <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>

      <section>
        <h3>Roles</h3>

        <ul>
          {user.hasRole.map(role => (
            <li key={getId(role)}>
              <span>{role.name || unprefix(getId(role))}</span>

              <span>
                {role['@type'] === 'PublicReviewerRole'
                  ? 'Public'
                  : 'Anonymous'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

SettingsRoles.propTypes = {
  user: PropTypes.shape({
    orcid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hasRole: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string.isRequired,
        '@type': PropTypes.oneOf([
          'PublicReviewerRole',
          'AnonymousReviewerRole'
        ]),
        name: PropTypes.string
      })
    )
  })
};
