import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@reach/menu-button';
import Value from './value';
import RoleBadge from './role-badge';
import { getId, arrayify } from '../utils/jsonld';
import { getTextAnswers } from '../utils/stats';

export default function TextAnswers({
  user,
  role,
  actions,
  isModerationInProgress,
  onModerate
}) {
  const answers = getTextAnswers(actions);

  const isLoggedIn = !!user;

  return (
    <div className="text-answers">
      <dl>
        {answers.map(({ questionId, question, answers }) => (
          <div key={questionId}>
            <dt className="text-answers__question">
              <Value tagName="span">{question}</Value>
            </dt>
            {answers.map(({ actionId, roleId, text }) => {
              const action = actions.find(action => getId(action) === actionId);
              return (
                <dd className="text-answers__response-row" key={roleId}>
                  <div className="text-answers__user-badge-container">
                    <RoleBadge roleId={roleId}>
                      {isLoggedIn && (
                        <MenuItem
                          disabled={
                            isModerationInProgress ||
                            arrayify(action.moderationAction).some(
                              action =>
                                action['@type'] ===
                                  'ReportRapidPREreviewAction' &&
                                getId(action.agent) === getId(role)
                            )
                          }
                          onSelect={() => {
                            onModerate(actionId);
                          }}
                        >
                          Report Author’s Review
                        </MenuItem>
                      )}
                    </RoleBadge>
                  </div>

                  <Value className="text-answers__response">{text}</Value>
                </dd>
              );
            })}
          </div>
        ))}
      </dl>
    </div>
  );
}

TextAnswers.propTypes = {
  user: PropTypes.object,
  role: PropTypes.object,
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
  canBan: PropTypes.bool,
  canModerate: PropTypes.bool,
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func
};
