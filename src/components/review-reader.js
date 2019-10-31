import React, { useState, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { MdInfoOutline } from 'react-icons/md';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats, getTextAnswers } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';
import ShareMenu from './share-menu';

const ReviewReader = React.memo(function ReviewReader({
  identifier,
  actions,
  defaultHighlightedRoleIds = [],
  onHighlighedRoleIdsChange = noop
}) {
  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds
  );

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
    <div className="review-reader">
      <h3 className="review-reader__title">
        {actions.length} Rapid PREreviews
      </h3>

      {!!actions.length && (
        <Fragment>
          <p className="review-reader__help-text">
            <MdInfoOutline className="review-reader__help-text-icon" />
            View only the reviews you are interested in by draging-and-dropping
            user badges to the filter bubble below.
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

          <Barplot
            stats={getYesNoStats(highlightedActions)}
            nHighlightedReviews={highlightedRoleIds.length || actions.length}
            nTotalReviews={actions.length}
          >
            <ShareMenu identifier={identifier} roleIds={highlightedRoleIds} />
          </Barplot>

          <TextAnswers answers={getTextAnswers(highlightedActions)} />
        </Fragment>
      )}
    </div>
  );
});

ReviewReader.propTypes = {
  identifier: PropTypes.string.isRequired, // DOI or arXivID
  onHighlighedRoleIdsChange: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      agent: PropTypes.string.isRequired
    })
  ).isRequired,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string)
};

export default ReviewReader;
