// base imports
import React, { Fragment, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';


import { formatDistanceStrict } from 'date-fns';


// hooks
import { useRole } from '../hooks/api-hooks';

// utils
import { unprefix } from '../utils/jsonld';

// components
import XLink from './xlink';



export default function RecentActivityCard({action}) {

  const [role, fetchRoleProgress] = useRole(action.agent);

  const { name, doi, arXivId } = action.preprint;

  return action['@type'] === 'RequestForRapidPREreviewAction' ? (
    <Fragment>
      <div className="dashboard__activity_item_text">
        {role && role['@type'] !== 'AnonymousReviewerRole'
          ? `${role.name} `
          : 'Anonymous '}{' '}
        {` requested a review for `}
        <XLink
          href={`/${doi || arXivId}`}
          to={{
            pathname: `/${doi || arXivId}`,
            state: {
              preprint: omit(action.preprint, ['potentialAction']),
              tab: 'read'
            }
          }}
        >
          {name}
        </XLink>
        { formatDistanceStrict(new Date(action.startTime), new Date()) + ` ago.`}
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div className="dashboard__activity_item_text">
        {role && role['@type'] !== 'AnonymousReviewerRole'
          ? `${role.name} `
          : 'Anonymous '}{' '}
        {` reviewed `}
        <XLink
          href={`/${doi || arXivId}`}
          to={{
            pathname: `/${doi || arXivId}`,
            state: {
              preprint: omit(action.preprint, ['potentialAction']),
              tab: 'read'
            }
          }}
        >
          {name}
        </XLink>{' '}
        {formatDistanceStrict(new Date(action.startTime), new Date()) + ` ago.`}
      </div>
    </Fragment>
  );
  
}
