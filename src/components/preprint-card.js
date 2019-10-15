import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MdArrowUpward,
  MdCode,
  MdChevronRight,
  MdExpandLess,
  MdExpandMore
} from 'react-icons/md';
import Value from './value';
import { getTags, getYesNoStats, getTextAnswers } from '../utils/stats';
import { checkIfHasReviewed, checkIfHasRequested } from '../utils/actions';
import CountBadge from './count-badge';
import ScoreBadge from './score-badge';
import IconButton from './icon-button';
import TagPill from './tag-pill';
import AddPrereviewIcon from '../svgs/add_prereview_icon.svg';
import Collapse from './collapse';
import Barplot from './barplot';
import TextAnswers from './text-answers';

export default function PreprintCard({
  user,
  preprint,
  onNewRequest,
  onNewReview
}) {
  const [isOpened, setIsOpened] = useState(false);

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

  const hasReviewed = checkIfHasReviewed(user, reviews);
  const hasRequested = checkIfHasRequested(user, requests);

  const { hasData, hasCode, subjects } = getTags(actions);

  return (
    <Fragment>
      <div className="preprint-card">
        <div className="preprint-card__score-panel">
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
          <div className="preprint-card__score-panel__middle">
            <ScoreBadge score={actions.length} />
          </div>
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
                  <li key="subject" className="preprint-card__tag-list__item">
                    <TagPill>{subject}</TagPill>
                  </li>
                ))}
                <li className="preprint-card__tag-list__item">
                  <div
                    className={`preprint-card__tag-icon ${
                      hasData
                        ? 'preprint-card__tag-icon--active'
                        : 'preprint-card__tag-icon--inactive'
                    }`}
                  >
                    <MdCode
                      className="preprint-card__tag-icon__icon"
                      title="Has Data"
                    />
                  </div>
                </li>
                <li className="preprint-card__tag-list__item">
                  <div
                    className={`preprint-card__tag-icon ${
                      hasCode
                        ? 'preprint-card__tag-icon--active'
                        : 'preprint-card__tag-icon--inactive'
                    }`}
                  >
                    <MdCode
                      className="preprint-card__tag-icon__icon"
                      title="Has Source Code"
                    />
                  </div>
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
              {isOpened ? <MdExpandLess /> : <MdExpandMore />}
            </IconButton>
          </div>
        </div>
      </div>
      <Collapse isOpened={isOpened}>
        <div className="preprint-card-expansion">
          <Barplot stats={getYesNoStats(actions)} />
          <TextAnswers answers={getTextAnswers(actions)} />
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
