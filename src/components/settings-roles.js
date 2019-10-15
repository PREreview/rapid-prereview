import React from 'react';
import PropTypes from 'prop-types';
import { getId, unprefix } from '../utils/jsonld';

export default function SettingsRoles({ user }) {
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
        {user.hasRole.map(role => (
          <li key={getId(role)}>
            <span>{role.name || unprefix(getId(role))}</span>

            <span>
              {role['@type'] === 'PublicReviewerRole' ? 'Public' : 'Anonymous'}
            </span>
          </li>
        ))}
      </ul>
    </section>
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
