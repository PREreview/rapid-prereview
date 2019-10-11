import { QUESTIONS } from '../constants';
import { getId, unprefix, arrayify } from '../utils/jsonld';

export function getAnswerMap(action = {}) {
  const answers = arrayify(
    action.resultReview && action.resultReview.reviewAnswer
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

export function getReviewAnswers(answerMap = {}) {
  return QUESTIONS.filter(question => question.identifier in answerMap).map(
    ({ question, type, identifier }) => {
      return {
        '@type': type.replace('Question', 'Answer'),
        parentItem: {
          '@id': `question:${identifier}`,
          '@type': type,
          text: question
        },
        text: answerMap[identifier]
      };
    }
  );
}

export function checkIfAllAnswered(answerMap = {}) {
  return QUESTIONS.every(({ identifier }) => answerMap[identifier]);
}

export function checkIfHasReviewed(
  user = {}, // can be a role (or list thereof) too
  actions = []
) {
  return arrayify(user)
    .concat(arrayify((user || {}).hasRole))
    .filter(role => getId(role))
    .some(role => {
      return arrayify(actions).some(action => {
        return (
          action['@type'] === 'RapidPREreviewAction' &&
          getId(action.agent) === getId(role)
        );
      });
    });
}

export function checkIfHasRequested(
  user = {}, // can be a role (or list thereof) too
  actions = []
) {
  return arrayify(user)
    .concat(arrayify((user || {}).hasRole))
    .filter(role => getId(role))
    .some(role => {
      return arrayify(actions).some(action => {
        return (
          action['@type'] === 'RequestForRapidPREreviewAction' &&
          getId(action.agent) === getId(role)
        );
      });
    });
}
