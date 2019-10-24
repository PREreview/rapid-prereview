import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats, getTextAnswers } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';

export default function ReviewReader({ actions }) {
  const [roleIds, setRoleIds] = useState(
    actions.map(action => getId(action.agent))
  );

  const [highlightedRoleIds, setHighlightedRoleIds] = useState([]);

  // reset when actions change
  useEffect(() => {
    setRoleIds(actions.map(action => getId(action.agent)));
    setHighlightedRoleIds([]);
  }, [actions]);

  const highlighedActions = useMemo(() => {
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
          setRoleIds(roleIds.filter(_roleId => _roleId !== roleId));
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
          setRoleIds(roleIds.concat(ids));
        }}
      />

      <Barplot stats={getYesNoStats(highlighedActions)} />
      <TextAnswers answers={getTextAnswers(highlighedActions)} />
    </div>
  );
}

ReviewReader.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      agent: PropTypes.string.isRequired
    })
  ).isRequired
};
