import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Barplot from './barplot';
import { getId } from '../utils/jsonld';
import { getYesNoStats, getTextAnswers } from '../utils/stats';
import TextAnswers from './text-answers';
import { PotentialRoles, HighlightedRoles } from './role-list';

export default function ReviewReader({ actions }) {
  const [highlightedRoleIds, setHighlightedRoleIds] = useState([]);

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
