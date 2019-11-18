import React, { useState, useEffect, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import { MdInfoOutline } from 'react-icons/md';
import classNames from 'classnames';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';
import ShareMenu from './share-menu';

const ReviewReader = React.memo(function ReviewReader({
  user,
  role,
  preview,
  identifier,
  actions,
  nRequests,
  defaultHighlightedRoleIds,
  onHighlighedRoleIdsChange = noop,
  isModerationInProgress,
  onModerate
}) {
  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || []
  );

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  const roleIds = useMemo(() => {
    return actions
      .map(action => getId(action.agent))
      .filter(
        roleId =>
          !highlightedRoleIds.some(
            highlightedRoleId => roleId === highlightedRoleId
          )
      );
  }, [actions, highlightedRoleIds]);

  const highlightedActions = useMemo(() => {
    return highlightedRoleIds.length
      ? actions.filter(action =>
          highlightedRoleIds.some(roleId => getId(action.agent) === roleId)
        )
      : actions;
  }, [actions, highlightedRoleIds]);

  return (
    <div
      className={classNames('review-reader', {
        'review-reader--full': !preview,
        'review-reader--preview': preview
      })}
    >
      {!preview && (
        <h3 className="review-reader__title">
          {actions.length} review{actions.length !== 1 ? 's' : ''}
          {nRequests != null
            ? ` | ${nRequests} request${nRequests !== 1 ? 's' : ''}`
            : ''}
        </h3>
      )}

      {!!actions.length && (
        <Fragment>
          {!preview && (
            <Fragment>
              <p className="review-reader__help-text">
                <MdInfoOutline className="review-reader__help-text-icon" />
                View only the reviews you are interested in by
                dragging-and-dropping user badges to the filter bubble below.
              </p>
              <h4 className="review-reader__sub-header">Reviewers</h4>
              <div className="review-reader__persona-selector">
                <PotentialRoles
                  roleIds={roleIds}
                  onRemoved={roleId => {
                    const nextHighlightedRoleIds = highlightedRoleIds.concat(
                      roleId
                    );
                    onHighlighedRoleIdsChange(nextHighlightedRoleIds);
                    setHighlightedRoleIds(nextHighlightedRoleIds);
                  }}
                />
                <h4 className="review-reader__sub-header">Reviewers Filter</h4>

                <HighlightedRoles
                  roleIds={highlightedRoleIds}
                  onRemoved={ids => {
                    const nextHighlightedRoleIds = highlightedRoleIds.filter(
                      roleId => !ids.some(id => roleId === id)
                    );
                    onHighlighedRoleIdsChange(nextHighlightedRoleIds);
                    setHighlightedRoleIds(nextHighlightedRoleIds);
                  }}
                />
              </div>
            </Fragment>
          )}

          <Barplot
            preview={preview}
            stats={getYesNoStats(highlightedActions)}
            nHighlightedReviews={highlightedRoleIds.length || actions.length}
            nTotalReviews={actions.length}
          >
            <ShareMenu identifier={identifier} roleIds={highlightedRoleIds} />
          </Barplot>

          {!preview && (
            <TextAnswers
              user={user}
              role={role}
              actions={highlightedActions}
              isModerationInProgress={isModerationInProgress}
              onModerate={onModerate}
            />
          )}
        </Fragment>
      )}
    </div>
  );
});

ReviewReader.propTypes = {
  user: PropTypes.object,
  role: PropTypes.object,
  preview: PropTypes.bool,
  identifier: PropTypes.string.isRequired, // DOI or arXivID
  onHighlighedRoleIdsChange: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      actionStatus: PropTypes.oneOf(['CompletedActionStatus']).isRequired,
      agent: PropTypes.string.isRequired,
      moderationAction: PropTypes.arrayOf(
        PropTypes.shape({
          '@type': PropTypes.oneOf([
            // !! `ModerateRapidPREreviewAction` cannot be present reviews with it must be excluded upstream
            'ReportRapidPREreviewAction',
            'IgnoreReportRapidPREreviewAction'
          ]).isRequired
        })
      )
    })
  ).isRequired,
  nRequests: PropTypes.number,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string),
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func
};

export default ReviewReader;
