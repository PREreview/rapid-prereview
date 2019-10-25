import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats, getTextAnswers } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';

const ReviewReader = React.memo(function ReviewReader({
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
    <div>
      <h4>Preprint Reviewers</h4>
      <div className="review-reader__persona-selector">
        <PotentialRoles
          roleIds={roleIds}
          onRemoved={roleId => {
            const nextHighlightedRoleIds = highlightedRoleIds.concat(roleId);
            onHighlighedRoleIdsChange(nextHighlightedRoleIds);
            setHighlightedRoleIds(nextHighlightedRoleIds);
          }}
        />

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
      <Barplot stats={getYesNoStats(highlightedActions)} />
      <TextAnswers answers={getTextAnswers(highlightedActions)} />
    </div>
  );
});

ReviewReader.propTypes = {
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
