import omit from 'lodash/omit';
import uniqWith from 'lodash/uniqWith';
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
  return QUESTIONS.every(
    ({ identifier, required }) => !required || answerMap[identifier]
  );
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

export function checkIfIsModerated(action) {
  return arrayify(action.moderationAction).some(
    action => action['@type'] === 'ModerateRapidPREreviewAction'
  );
}

export function getUniqueModerationActions(
  actions // list of conflicting moderation actions (`ReportRapidPREreviewAction`, `IgnoreReportRapidPREreviewAction`, `ModerateRapidPREreviewAction`)
) {
  return uniqWith(arrayify(actions), (a, b) => {
    return (
      a['@type'] === b['@type'] &&
      getId(a.agent) === getId(b.agent) &&
      a.startTime &&
      b.startTime
    );
  }).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

export function omitPrivate(action) {
  switch (action['@type']) {
    case 'UpdateContactPointAction':
      return Object.assign({}, action, {
        result: Object.assign({}, action.result, {
          contactPoint: omit(action.result.contactPoint, ['token'])
        })
      });

    default:
      return action;
  }
}
