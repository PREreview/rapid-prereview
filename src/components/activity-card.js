import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, formatDistanceStrict } from 'date-fns';
import { MdChevronRight } from 'react-icons/md';
import { getId } from '../utils/jsonld';
import Value from './value';
import LabelStyle from './label-style';
import XLink from './xlink';
import { usePreprintActions } from '../hooks/api-hooks';
import { checkIfIsModerated } from '../utils/actions';
import { useAnimatedScore } from '../hooks/score-hooks';
import ScoreBadge from './score-badge';
import AnimatedNumber from './animated-number';

export default function ActivityCard({ action }) {
  const [actions, fetchProgress] = usePreprintActions(getId(action.object));

  const safeActions = useMemo(() => {
    return actions.filter(
      action =>
        !checkIfIsModerated(action) &&
        (action['@type'] === 'RequestForRapidPREreviewAction' ||
          action['@type'] === 'RapidPREreviewAction')
    );
  }, [actions]);

  const {
    nRequests,
    nReviews,
    now,
    onStartAnim,
    onStopAnim,
    dateFirstActivity,
    isAnimating
  } = useAnimatedScore(safeActions.length ? safeActions : [action]);

  return (
    <div key={getId(action)} className="activity-card">
      <LabelStyle>
        {format(new Date(action.startTime), 'MMM. d, yyyy')}{' '}
        {action['@type'] === 'RequestForRapidPREreviewAction'
          ? 'requested feedback on'
          : 'reviewed'}
      </LabelStyle>
      <div>
        <XLink
          to={`/${action.object.doi || action.object.arXivId}`}
          href={`/${action.object.doi || action.object.arXivId}`}
        >
          <Value tagName="span">{action.object.name}</Value>
        </XLink>

        <div className="activity-card__server-info">
          <Value tagName="span" className="activity-card__server-name">
            {(action.object.preprintServer || {}).name}
          </Value>
          <MdChevronRight className="activity-card__server-arrow-icon" />
          <Value tagName="span">
            {action.object.doi ? (
              <a
                href={`https://doi.org/${action.object.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.object.doi}
              </a>
            ) : (
              <a
                href={`https://arxiv.org/abs/${action.object.arXivId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.object.arXivId}
              </a>
            )}
          </Value>
        </div>

        {!fetchProgress.isActive && (
          <div className="activity-card__stats">
            <ScoreBadge
              now={now}
              nRequests={nRequests}
              nReviews={nReviews}
              dateFirstActivity={dateFirstActivity}
              onMouseEnter={onStartAnim}
              onMouseLeave={onStopAnim}
              isAnimating={isAnimating}
            />
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber value={nReviews} isAnimating={isAnimating} />
              </div>
              Review{nReviews > 1 ? 's' : ''}
            </div>
            <div className="activity-card__count">
              <div className="activity-card__count-badge">
                <AnimatedNumber value={nRequests} isAnimating={isAnimating} />{' '}
              </div>
              Request{nRequests > 1 ? 's' : ''}
            </div>
            {isAnimating && (
              <div className="activity-card__count">
                <span className="preprint-card__animation-time">
                  {`(${formatDistanceStrict(new Date(now), new Date())} ago)`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ActivityCard.propTypes = {
  action: PropTypes.object.isRequired
};
