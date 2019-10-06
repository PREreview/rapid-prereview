import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Value from './value';
import { getId, unprefix } from '../utils/jsonld';
import { getTags } from '../utils/stats';

export default function PreprintCard({ preprint }) {
  const {
    name,
    preprintServer,
    doi,
    arXivId,
    datePosted,
    potentialAction: actions
  } = preprint;

  const reviews = actions.filter(
    action => action['@type'] === 'RapidPREreviewAction'
  );

  const requests = actions.filter(
    action => action['@type'] === 'RequestForRapidPREreviewAction'
  );

  const { hasData, hasCode, subjects } = getTags(actions);

  return (
    <div className="preprint-card">
      <Value tagName="h2">{name}</Value>

      <span>{format(new Date(datePosted), 'MMM. d, yyyy')}</span>
      <Value tagName="span">{preprintServer.name}</Value>
      <Value tagName="span">{doi || arXivId}</Value>

      <ul>
        {subjects.map(subject => (
          <li key="subject">{subject}</li>
        ))}
        <li>{hasData ? 'data' : 'no data'}</li>
        <li>{hasCode ? 'code' : 'no code'}</li>
      </ul>

      <button>upvote</button>
      <span>{actions.length}</span>
      <button>request</button>

      <div>
        {/* the reviewers */}
        {reviews.length > 0 && (
          <ul>
            {reviews.map(action => (
              <li key={getId(action)}>{unprefix(getId(action.agent))}</li>
            ))}
          </ul>
        )}
        <span>{reviews.length}</span> review{reviews.length > 1 ? 's' : ''} (
        <span>{requests.length}</span> request{requests.length > 1 ? 's' : ''})
      </div>
    </div>
  );
}

PreprintCard.propTypes = {
  preprint: PropTypes.shape({
    doi: PropTypes.string,
    arXivId: PropTypes.string,
    datePosted: PropTypes.string,
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@type': PropTypes.string.isRequired,
        '@value': PropTypes.string.isRequired
      }).isRequired
    ]).isRequired,
    preprintServer: PropTypes.shape({
      name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          '@type': PropTypes.string.isRequired,
          '@value': PropTypes.string.isRequired
        }).isRequired
      ]).isRequired
    }).isRequired,
    potentialAction: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          '@type': PropTypes.oneOf(['RequestForRapidPREreviewAction'])
        }),
        PropTypes.shape({
          '@type': PropTypes.oneOf(['RapidPREreviewAction'])
        })
      ])
    ).isRequired
  })
};
