import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getId } from '../utils/jsonld';
import { createActivityQs } from '../utils/search';
import { useActionsSearchResults } from '../hooks/api-hooks';
import Value from './value';
import Button from './button';

export default function RoleActivity({ roleId }) {
  const [bookmark, setBookmark] = useState(null);

  const search = createActivityQs({ roleId, bookmark });

  const [results, progress] = useActionsSearchResults(search);

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

      {results.total_rows === 0 && !progress.isActive ? (
        <div>No activity yet.</div>
      ) : results.bookmark === bookmark ? (
        <div>No more activity.</div>
      ) : (
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
      )}

      <div className="role-activity__pagination">
        {/* Cloudant returns the same bookmark when it hits the end of the list */}
        {!!(
          results.rows.length < results.total_rows &&
          results.bookmark !== bookmark
        ) && (
          <Button
            onClick={() => {
              setBookmark(results.bookmark);
            }}
          >
            Next page
          </Button>
        )}

        {!!bookmark && (
          <Button
            onClick={() => {
              setBookmark(null);
            }}
          >
            Back to first page
          </Button>
        )}
      </div>
    </div>
  );
}

RoleActivity.propTypes = {
  roleId: PropTypes.string.isRequired
};
