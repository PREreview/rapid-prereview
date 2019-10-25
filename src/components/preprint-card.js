import React, { Fragment, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MdArrowUpward,
  MdTimeline,
  MdCode,
  MdChevronRight,
  MdExpandLess,
  MdExpandMore
} from 'react-icons/md';
import Tooltip from '@reach/tooltip';
import Value from './value';
import { getTags } from '../utils/stats';
import { checkIfHasReviewed, checkIfHasRequested } from '../utils/actions';
import CountBadge from './count-badge';
import ScoreBadge from './score-badge';
import IconButton from './icon-button';
import TagPill from './tag-pill';
import AddPrereviewIcon from '../svgs/add_prereview_icon.svg';
import Collapse from './collapse';
import ReviewReader from './review-reader';

export default function PreprintCard({
  user,
  preprint,
  onNewRequest,
  onNewReview
}) {
  const [isOpened, setIsOpened] = useState(false);

  const { name, preprintServer, doi, arXivId, datePosted } = preprint;

  const reviews = useMemo(() => {
    return preprint.potentialAction.filter(
      action => action['@type'] === 'RapidPREreviewAction'
    );
  }, [preprint]);

  const requests = useMemo(() => {
    return preprint.potentialAction.filter(
      action => action['@type'] === 'RequestForRapidPREreviewAction'
    );
  }, [preprint]);

  const hasReviewed = checkIfHasReviewed(user, reviews);
  const hasRequested = checkIfHasRequested(user, requests);

  const { hasData, hasCode, subjects } = getTags(preprint.potentialAction);

  return (
    <Fragment>
      <div className="preprint-card">
        <div className="preprint-card__score-panel">
          <Tooltip
            label={
              hasRequested
                ? 'You already requested feedback for this preprint'
                : 'Add your request for review'
            }
          >
            <div className="preprint-card__score-panel__top">
              <IconButton
                disabled={hasRequested}
                onClick={() => {
                  onNewRequest(preprint);
                }}
              >
                <MdArrowUpward className="preprint-card__up-request-icon" />
              </IconButton>
            </div>
          </Tooltip>
          <Tooltip label="Number of reviews and requests for reviews for this preprint">
            <div className="preprint-card__score-panel__middle">
              <ScoreBadge
                nRequests={requests.length}
                nReviews={reviews.length}
              />
            </div>
          </Tooltip>
          <Tooltip
            label={
              hasReviewed
                ? 'You already reviewed this preprint'
                : 'Add your review'
            }
          >
            <div className="preprint-card__score-panel__bottom">
              <IconButton
                disabled={hasReviewed}
                onClick={() => {
                  onNewReview(preprint);
                }}
              >
                <AddPrereviewIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>

        <div className="preprint-card__contents">
          <div className="preprint-card__header">
            <Link
              to={{
                pathname: `/${doi || arXivId}`,
                state: {
                  preprint: omit(preprint, ['potentialAction']),
                  tab: 'read'
                }
              }}
              className="preprint-card__title"
            >
              <Value tagName="h2" className="preprint-card__title-text">
                {name}
              </Value>
            </Link>

            <span className="preprint-card__pub-date">
              {format(new Date(datePosted), 'MMM. d, yyyy')}
            </span>
          </div>
          <div className="preprint-card__info-row">
            <div className="preprint-card__info-row__left">
              <Value tagName="span" className="preprint-card__server-name">
                {preprintServer.name}
              </Value>
              <MdChevronRight className="preprint-card__server-arrow-icon" />
              <Value tagName="span" className="preprint-card__server-id">
                {doi || arXivId}
              </Value>
            </div>

            <div className="preprint-card__info-row__right">
              <ul className="preprint-card__tag-list">
                {subjects.map(subject => (
                  <li key={subject} className="preprint-card__tag-list__item">
                    <Tooltip
                      label={`Majority of reviewers tagged with ${subject}`}
                    >
                      <div>
                        <TagPill>{subject}</TagPill>
                      </div>
                    </Tooltip>
                  </li>
                ))}
                <li className="preprint-card__tag-list__item">
                  <Tooltip
                    label={
                      hasData
                        ? 'Majority of reviewers reported data'
                        : 'Majority of reviewers did not report data'
                    }
                  >
                    <div
                      className={`preprint-card__tag-icon ${
                        hasData
                          ? 'preprint-card__tag-icon--active'
                          : 'preprint-card__tag-icon--inactive'
                      }`}
                    >
                      <MdTimeline className="preprint-card__tag-icon__icon" />
                    </div>
                  </Tooltip>
                </li>
                <li className="preprint-card__tag-list__item">
                  <Tooltip
                    label={
                      hasCode
                        ? 'Majority of reviewers reported code'
                        : 'Majority of reviewers did not report code'
                    }
                  >
                    <div
                      className={`preprint-card__tag-icon ${
                        hasCode
                          ? 'preprint-card__tag-icon--active'
                          : 'preprint-card__tag-icon--inactive'
                      }`}
                    >
                      <MdCode className="preprint-card__tag-icon__icon" />
                    </div>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>

          <div className="preprint-card__expansion-header">
            {/* the reviewers */}
            {/*reviews.length > 0 && (
                <ul>
                {reviews.map(action => (
                <li key={getId(action)}>{unprefix(getId(action.agent))}</li>
                ))}
                </ul>
                )*/}

            <CountBadge
              count={reviews.length}
              className="preprint-card__count-badge"
            />
            <div className="preprint-card__count-label">
              review{reviews.length > 1 ? 's' : ''}
            </div>
            <CountBadge
              count={requests.length}
              className="preprint-card__count-badge"
            />
            <div className="preprint-card__count-label">
              request{requests.length > 1 ? 's' : ''}
            </div>

            <IconButton
              className="preprint-card__expansion-toggle"
              onClick={e => {
                setIsOpened(!isOpened);
              }}
            >
              {isOpened ? (
                <MdExpandLess className="preprint-card__expansion-toggle-icon" />
              ) : (
                <MdExpandMore className="preprint-card__expansion-toggle-icon" />
              )}
            </IconButton>
          </div>
        </div>
      </div>
      <Collapse isOpened={isOpened} className="preprint-card__collapse">
        <div className="preprint-card-expansion">
          <ReviewReader actions={reviews} />
        </div>
      </Collapse>
    </Fragment>
  );
}

PreprintCard.propTypes = {
  user: PropTypes.object,
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
  }),
  onNewRequest: PropTypes.func.isRequired,
  onNewReview: PropTypes.func.isRequired
};
