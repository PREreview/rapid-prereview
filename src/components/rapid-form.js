import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { QUESTIONS } from '../constants';
import { getId, unprefix, arrayify } from '../utils/jsonld';
import Value from './value';

export default function RapidForm({ rapidPREreviewAction: action, onSubmit }) {
  const [answerMap, setAnswerMap] = useState(getAnswerMap(action));

  useEffect(() => {
    setAnswerMap(getAnswerMap(action));
  }, [action]);

  function handleChange(identifier, value) {
    setAnswerMap(Object.assign({}, answerMap, { [identifier]: value }));
  }

  function handleSubmit(e) {
    onSubmit(actionify(action, answerMap));
  }

  const yesNoQuestions = QUESTIONS.filter(
    ({ type }) => type === 'YesNoQuestion'
  );

  const freeFormQuestions = QUESTIONS.filter(({ type }) => type === 'Question');

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
      }}
    >
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

      <button type="submit" onClick={handleSubmit}>
        SUBMIT
      </button>
    </form>
  );
}

RapidForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  rapidPREreviewAction: PropTypes.shape({
    '@type': PropTypes.oneOf(['RapidPREreviewAction']),
    object: PropTypes.object,
    resultReview: PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreview']),
      about: PropTypes.array,
      reviewAnswer: PropTypes.array
    })
  })
};

function getAnswerMap(action) {
  const answers = arrayify(
    action && action.resultReview && action.resultReview.reviewAnswer
  );

  return answers.reduce((map, answer) => {
    const questionId = unprefix(getId(answer.parentItem));
    if (answer['@type'] === 'YesNoAnswer') {
      map[questionId] = answer.text.toLowerCase().trim();
    } else {
      map[questionId] = answer.text;
    }

    return map;
  }, {});
}

function actionify(action, answerMap) {
  // TODO
  return Object.assign({}, action);
}
