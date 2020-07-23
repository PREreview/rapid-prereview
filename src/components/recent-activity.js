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

export default function RecentActivity({action}) {
  const user = action.agent
  const [role, fetchRoleProgress] = useRole(user);

  const { name, doi, arXivId } = action.preprint;

  return action['@type'] === 'RequestForRapidPREreviewAction' ? (
    <Fragment>
      <div className="dashboard__activity_item_text">
        {role && role['@type'] !== 'AnonymousReviewerRole'
          ? <XLink to={`/about/${unprefix(user)}`}
            href={`/about/${unprefix(user)}`} >{role.name}</XLink>
          : <XLink to={`/about/${unprefix(user)}`}
            href={`/about/${unprefix(user)}`} >{`Community reviewer ${user.slice(user.length - 4, user.length)}`}</XLink>}{' '}
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
        </XLink>{' '}
        {formatDistanceStrict(new Date(action.startTime), new Date()) + ` ago.`}
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div className="dashboard__activity_item_text">
        {role && role['@type'] !== 'AnonymousReviewerRole'
            ? <XLink to={`/about/${unprefix(user)}`}
              href={`/about/${unprefix(user)}`} >{role.name}</XLink>
            : <XLink to={`/about/${unprefix(user)}`}
              href={`/about/${unprefix(user)}`} >{`Community reviewer ${user.slice(user.length - 4, user.length)}`}</XLink>}{' '}
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
