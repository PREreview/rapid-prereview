import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MdChevronRight } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import { createActivityQs } from '../utils/search';
import { useActionsSearchResults } from '../hooks/api-hooks';
import Value from './value';
import Button from './button';
import LabelStyle from './label-style';

export default function RoleActivity({ roleId }) {
  const [bookmark, setBookmark] = useState(null);

  const search = createActivityQs({ roleId, bookmark });

  const [results, progress] = useActionsSearchResults(search);

  return (
    <div className="role-activity">
      {!!(results.counts && results.counts['@type']) && (
        <dl className="role-activity__summary">
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of requests</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.counts['@type']['RequestForRapidPREreviewAction'] || 0}
          </dd>
          <dt className="role-activity__summary__label">
            <LabelStyle>Total number of reviews</LabelStyle>
          </dt>
          <dd className="role-activity__summary__stat">
            {results.counts['@type']['RapidPREreviewAction'] || 0}
          </dd>
        </dl>
      )}

      {results.total_rows === 0 && !progress.isActive ? (
        <div>No activity yet.</div>
      ) : results.bookmark === bookmark ? (
        <div>No more activity.</div>
      ) : (
        <section className="role-activity__history">
          <h3 className="role-activity__sub-title">History</h3>
          <ul className="role-activity__list">
            {results.rows.map(({ doc }) => (
              <li key={getId(doc)} className="role-activity__list-item">
                <LabelStyle>
                  {format(new Date(doc.startTime), 'MMM. d, yyyy')}{' '}
                  {doc['@type'] === 'RequestForRapidPREreviewAction'
                    ? 'requested feedback on'
                    : 'reviewed'}
                </LabelStyle>
                <div className="role-activity__list-item-details">
                  <Link to={`/${doc.object.doi || doc.object.arXivId}`}>
                    <Value tagName="span">{doc.object.name}</Value>
                  </Link>
                  <div className="role-activity__server-info">
                    <Value
                      tagName="span"
                      className="role-activity__server-name"
                    >
                      {(doc.object.preprintServer || {}).name}
                    </Value>
                    <MdChevronRight className="role-activity__server-arrow-icon" />
                    <Value tagName="span">
                      {doc.object.doi || doc.object.arXivId}
                    </Value>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
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
