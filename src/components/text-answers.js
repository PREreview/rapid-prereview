import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@reach/menu-button';
import Value from './value';
import RoleBadge from './role-badge';

export default function TextAnswers({
  answers,
  canModerate,
  isModerationInProgress,
  onModerate
}) {
  return (
    <div className="text-answers">
      <dl>
        {answers.map(({ questionId, question, answers }) => (
          <div key={questionId}>
            <dt className="text-answers__question">
              <Value tagName="span">{question}</Value>
            </dt>
            {answers.map(({ actionId, roleId, text }) => (
              <dd className="text-answers__response-row" key={roleId}>
                <div className="text-answers__user-badge-container">
                  <RoleBadge roleId={roleId}>
                    {!!canModerate && (
                      <MenuItem
                        disabled={isModerationInProgress}
                        onSelect={() => {
                          onModerate('role', roleId);
                        }}
                      >
                        Report Author
                      </MenuItem>
                    )}
                    {!!canModerate && (
                      <MenuItem
                        disabled={isModerationInProgress}
                        onSelect={() => {
                          onModerate('review', actionId);
                        }}
                      >
                        Report Author’s Review
                      </MenuItem>
                    )}
                  </RoleBadge>
                </div>

                <Value className="text-answers__response">{text}</Value>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}

TextAnswers.propTypes = {
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      questionId: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answers: PropTypes.arrayOf(
        PropTypes.shape({
          roleId: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  canModerate: PropTypes.bool,
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func
};
