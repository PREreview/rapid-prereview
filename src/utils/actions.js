import { getId, unprefix, arrayify } from '../utils/jsonld';

export function getAnswerMap(action) {
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
