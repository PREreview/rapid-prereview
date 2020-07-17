import { QUESTIONS } from '../constants';
import { getId, arrayify } from './jsonld';
import { getAnswerMap, checkIfIsModerated } from './actions';

function isYes(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'yes';
}

function isNo(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'no';
}

function isNa(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'n.a.';
}

function isUnsure(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'unsure';
}

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
            return isYes(answer);
          }
        }
      }
    }
    return false;
  });

  const hasData = reviewsWithData.length && reviewsWithData.length >= threshold;

  // hasCode
  const reviewsWithCode = reviewActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynAvailableCode') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  });

  const hasCode = reviewsWithCode.length && reviewsWithCode.length >= threshold;

  /** collect all reviews where
   * reviewers say they'd recommend this preprint to others
  */
  const reviewsWithRecs = reviewActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynRecommend') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  });

  const othersCount = reviewsWithRecs.length

  const recdToOthers = othersCount && othersCount >= threshold;

  /*** collect all reviews where
   * reviewers say they'd recommend this preprint for peer review
   */
  const reviewsWithPeers = reviewActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynPeerReview') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  });

  const peerReviewCount = reviewsWithPeers.length
  const recdForPeers = peerReviewCount && peerReviewCount >= threshold;

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

  return { hasReviews, hasRequests, hasData, hasCode, othersCount, recdToOthers, peerReviewCount, recdForPeers, subjects };
}

export function getReviewerStats(actions = []) {

  const reviewActions = actions.filter(
    action => action['@type'] === 'RapidPREreviewAction'
  );

  const reviewerCount = {};

  reviewActions.forEach(action => {
    if (action.resultReview && action.agent) {
      if (typeof action.agent === 'string') {
        if (action.agent in reviewerCount) {
          reviewerCount[action.agent] += 1;
        } else {
          reviewerCount[action.agent] = 1;
        }
      }
    }
  });

  return { reviewerCount };
}

export function getYesNoStats(actions = []) {
  const pairs = actions
    .filter(action => action['@type'] === 'RapidPREreviewAction')
    .map(action => {
      return {
        roleId: getId(action.agent),
        answerMap: getAnswerMap(action)
      };
    });

  const nReviews = pairs.length;

  return QUESTIONS.filter(({ type }) => type === 'YesNoQuestion').map(
    ({ identifier, type, question }) => {
      return {
        questionId: `question:${identifier}`,
        nReviews,
        question,
        yes: pairs
          .filter(({ answerMap }) => {
            return isYes(answerMap[identifier]);
          })
          .map(({ roleId }) => roleId),
        no: pairs
          .filter(({ answerMap }) => {
            return isNo(answerMap[identifier]);
          })
          .map(({ roleId }) => roleId),
        na: pairs
          .filter(({ answerMap }) => {
            return isNa(answerMap[identifier]);
          })
          .map(({ roleId }) => roleId),
        unsure: pairs
          .filter(({ answerMap }) => {
            return isUnsure(answerMap[identifier]);
          })
          .map(({ roleId }) => roleId)
      };
    }
  );
}

export function getTextAnswers(actions = []) {
  const answersData = arrayify(actions)
    .filter(action => action['@type'] === 'RapidPREreviewAction')
    .map(action => {
      return {
        actionId: getId(action),
        roleId: getId(action.agent),
        answerMap: getAnswerMap(action)
      };
    });

  return QUESTIONS.filter(({ type }) => {
    return type === 'Question';
  }).map(({ question, identifier, required }) => {
    return {
      questionId: `question:${identifier}`,
      question,
      answers: answersData
        .map(({ actionId, roleId, answerMap }) => {
          return {
            actionId,
            roleId,
            text: answerMap[identifier]
          };
        })
        .filter(({ text }) => {
          return required || text !== undefined;
        })
    };
  });
}

export function getActiveReports(
  action // a `RapidPREreviewAction`
) {
  // moderation action are sorted so we get all the report untill the previous
  // `ModerateRapidPREreviewAction` or `IgnoreRapidPREreviewAction` action
  const moderationActions = arrayify(action.moderationAction);

  const reports = [];
  for (let i = moderationActions.length - 1; i >= 0; i--) {
    const moderationAction = moderationActions[i];
    if (moderationAction['@type'] === 'ReportRapidPREreviewAction') {
      reports.push(moderationAction);
    } else {
      break;
    }
  }

  return reports;
}

export function getCounts(actions) {
  const safeActions = arrayify(actions).filter(
    action => !checkIfIsModerated(action)
  );

  const nRequests = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const nReviews = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  return { nRequests, nReviews };
}
