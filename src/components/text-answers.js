import React from 'react';
import PropTypes from 'prop-types';
import Value from './value';

export default function TextAnswers({ answers }) {
  return (
    <div className="text-answers">
      <dl>
        {answers.map(({ questionId, question, answers }) => (
          <div key={questionId}>
            <dt className="text-answers__question">
              <Value tagName="span">{question}</Value>
            </dt>
            {answers.map(({ roleId, text }) => (
              <dd className="text-answers__response-row" key={roleId}>
                {/* TODO gravatar */}
                <span className="text-answers__user-badge-container">
                  {roleId}
                </span>
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
  ).isRequired
};
