import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats, getTextAnswers } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';

const ReviewReader = React.memo(function ReviewReader({
  actions,
  defaultHighlightedRoleIds = []
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
      <PotentialRoles
        roleIds={roleIds}
        onRemoved={roleId => {
          setHighlightedRoleIds(highlightedRoleIds.concat(roleId));
        }}
      />

      <hr />

      <HighlightedRoles
        roleIds={highlightedRoleIds}
        onRemoved={ids => {
          setHighlightedRoleIds(
            highlightedRoleIds.filter(roleId => !ids.some(id => roleId === id))
          );
        }}
      />

      <Barplot stats={getYesNoStats(highlightedActions)} />
      <TextAnswers answers={getTextAnswers(highlightedActions)} />
    </div>
  );
});

ReviewReader.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      agent: PropTypes.string.isRequired
    })
  ).isRequired,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string)
};

export default ReviewReader;
