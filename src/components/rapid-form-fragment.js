import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { QUESTIONS } from '../constants';
import Value from './value';
import RadioButton from './radio-button';

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

      <fieldset className="rapid-form-fragment__multi-choice-questions">
        {yesNoQuestions.map(({ identifier, question, groupPrefix }, i) => {
          const answer = answerMap[identifier];

          return (
            <Fragment key={identifier}>
              <div className="radid-form-fragment__question-row">
                <Value tagName="p" className="radid-form-fragment__question">
                  {question}
                </Value>
                <div className="rapid-form-fragment__radio-group">
                  <RadioButton
                    inputId={`question-${identifier}-yes`}
                    name={identifier}
                    value="yes"
                    checked={answer === 'yes'}
                    onChange={e => {
                      handleChange(identifier, 'yes');
                    }}
                    label="Yes"
                  />

                  <RadioButton
                    inputId={`question-${identifier}-no`}
                    name={identifier}
                    value="no"
                    checked={answer === 'no'}
                    onChange={e => {
                      handleChange(identifier, 'no');
                    }}
                    label="No"
                  />

                  <RadioButton
                    inputId={`question-${identifier}-na`}
                    name={identifier}
                    value="n.a."
                    checked={answer === 'n.a.'}
                    onChange={e => {
                      handleChange(identifier, 'n.a.');
                    }}
                    label={<abbr title="Not Applicable">N.A.</abbr>}
                  />

                  <RadioButton
                    inputId={`question-${identifier}-unsure`}
                    name={identifier}
                    value="unsure"
                    checked={answer === 'unsure'}
                    onChange={e => {
                      handleChange(identifier, 'unsure');
                    }}
                    label="Unsure"
                  />
                </div>
              </div>
            </Fragment>
          );
        })}
      </fieldset>
      <hr className="rapid-form-fragment__divider" />
      <fieldset className="rapid-form-fragment__text-response-questions">
        {freeFormQuestions.map(({ identifier, question }) => {
          const answer = answerMap[identifier];

          return (
            <div
              key={identifier}
              className="radid-form-fragment__text-question-row"
            >
              <Value
                tagName="label"
                htmlFor={`question-${identifier}`}
                className="radid-form-fragment__text-question"
              >
                {question}
              </Value>

              <textarea
                className="radid-form-fragment__text-answer"
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
