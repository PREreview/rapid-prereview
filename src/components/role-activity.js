import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getId } from '../utils/jsonld';
import { useActionsSearchResults } from '../hooks/api-hooks';
import Value from './value';

export default function RoleActivity({ roleId }) {
  const [query, setQuery] = useState(
    `?q=agentId:"${roleId}"&sort=${JSON.stringify([
      '-startTime<number>'
    ])}&include_docs=true&counts=${JSON.stringify(['@type'])}`
  );

  const [results, progress] = useActionsSearchResults(query);

  return (
    <div className="role-activity">
      {!!(results.counts && results.counts['@type']) && (
        <dl>
          <dt>Total number of requests</dt>
          <dd>{results.counts['@type']['RequestForRapidPREreviewAction']}</dd>
          <dt>Total number of reviews</dt>
          <dd>{results.counts['@type']['RapidPREreviewAction']}</dd>
        </dl>
      )}

      <ul>
        {results.rows.map(({ doc }) => (
          <li key={getId(doc)}>
            {format(new Date(doc.startTime), 'MMM. d, yyyy')}{' '}
            {doc['@type'] === 'RequestForRapidPREreviewAction'
              ? 'requested feedback on'
              : 'reviewed'}{' '}
            <Link to={`/${doc.object.doi || doc.object.arXivId}`}>
              <Value tagName="span">{doc.object.name}</Value>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

RoleActivity.propTypes = {
  roleId: PropTypes.string.isRequired
};
