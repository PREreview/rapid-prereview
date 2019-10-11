import React from 'react';
import PropTypes from 'prop-types';
import Value from './value';

export default function TextAnswers({ answers }) {
  return (
    <div className="text-answers">
      <dl>
        {answers.map(({ questionId, question, answers }) => (
          <div key={questionId}>
            <dt>
              <Value tagName="span">{question}</Value>
            </dt>
            {answers.map(({ roleId, text }) => (
              <dd key={roleId}>
                {/* TODO gravatar */}
                <span>{roleId}</span>
                <Value>{text}</Value>
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
