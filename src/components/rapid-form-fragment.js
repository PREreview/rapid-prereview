import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { QUESTIONS } from '../constants';
import Value from './value';

export default function RapidFormFragment({ answerMap = {}, onChange }) {
  function handleChange(key, value) {
    onChange(key, value);
  }

  const yesNoQuestions = QUESTIONS.filter(
    ({ type }) => type === 'YesNoQuestion'
  );

  const freeFormQuestions = QUESTIONS.filter(({ type }) => type === 'Question');

  return (
    <div className="rapid-form-fragment">
      <fieldset>{/* TODO title, datePosted and tags */}</fieldset>

      <fieldset>
        {yesNoQuestions.map(({ identifier, question, groupPrefix }, i) => {
          const answer = answerMap[identifier];

          return (
            <Fragment key={identifier}>
              <Value tagName="p">{question}</Value>

              <input
                type="radio"
                id={`question-${identifier}-yes`}
                name={identifier}
                value="yes"
                checked={answer === 'yes'}
                onChange={e => {
                  handleChange(identifier, 'yes');
                }}
              />
              <label htmlFor={`question-${identifier}-yes`}>Yes</label>

              <input
                type="radio"
                id={`question-${identifier}-no`}
                name={identifier}
                value="no"
                checked={answer === 'no'}
                onChange={e => {
                  handleChange(identifier, 'no');
                }}
              />
              <label htmlFor={`question-${identifier}-no`}>No</label>

              <input
                type="radio"
                id={`question-${identifier}-na`}
                name={identifier}
                value="n.a."
                checked={answer === 'n.a.'}
                onChange={e => {
                  handleChange(identifier, 'n.a.');
                }}
              />
              <label htmlFor={`question-${identifier}-na`}>
                <abbr title="Not Applicable">N.A.</abbr>
              </label>

              <input
                type="radio"
                id={`question-${identifier}-unsure`}
                name={identifier}
                value="unsure"
                checked={answer === 'unsure'}
                onChange={e => {
                  handleChange(identifier, 'unsure');
                }}
              />
              <label htmlFor={`question-${identifier}-unsure`}>Unsure</label>
            </Fragment>
          );
        })}
      </fieldset>

      <fieldset>
        {freeFormQuestions.map(({ identifier, question }) => {
          const answer = answerMap[identifier];

          return (
            <div key={identifier}>
              <Value tagName="label" htmlFor={`question-${identifier}`}>
                {question}
              </Value>

              <textarea
                id={`question-${identifier}`}
                name={identifier}
                rows="2"
                value={answer || ''}
                onChange={e => {
                  handleChange(identifier, e.target.value);
                }}
              />
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}

RapidFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object
};
