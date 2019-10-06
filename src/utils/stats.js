import { getId } from './jsonld';

/**
 * Tags are computed following a majority rule
 */
export function getTags(actions) {
  const hasReviews = actions.some(
    action => action['@type'] === 'RapidPREreviewAction'
  );

  const hasRequests = actions.some(
    action => action['@type'] === 'RequestForRapidPREreviewAction'
  );

  const reviewActions = actions.filter(
    action => action['@type'] === 'RapidPREreviewAction'
  );

  const threshold = Math.ceil(reviewActions.length / 2);

  // hasData
  const reviewsWithData = reviewActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynAvailableData') {
            return (answer.text || '').toLowerCase().trim() === 'yes';
          }
        }
      }
    }
    return false;
  });

  const hasData = reviewsWithData.length >= threshold;

  // hasCode
  const reviewsWithCode = reviewActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynAvailableCode') {
            return (answer.text || '').toLowerCase().trim() === 'yes';
          }
        }
      }
    }
    return false;
  });

  const hasCode = reviewsWithCode.length >= threshold;

  // subjects
  const subjectCountMap = {};
  reviewActions.forEach(action => {
    if (action.resultReview && action.resultReview.about) {
      action.resultReview.about.forEach(subject => {
        if (typeof subject.name === 'string') {
          if (subject.name in subjectCountMap) {
            subjectCountMap[subject.name] += 1;
          } else {
            subjectCountMap[subject.name] = 1;
          }
        }
      });
    }
  });

  const subjects = Object.keys(subjectCountMap).filter(subjectName => {
    const count = subjectCountMap[subjectName];
    return count >= threshold;
  });

  return { hasReviews, hasRequests, hasData, hasCode, subjects };
}
