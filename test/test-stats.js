import assert from 'assert';
import { QUESTIONS } from '../src/constants';
import { getYesNoStats } from '../src/utils/stats';

describe('stats utils', function() {
  describe('getYesNoStats', () => {
    it('should work', () => {
      const actions = [
        {
          '@type': 'RapidPREreviewAction',
          agent: 'role:roleId',
          actionStatus: 'CompletedActionStatus',
          object: 'arXiv:1910.00585',
          resultReview: {
            '@type': 'RapidPREreview',
            about: [
              {
                '@type': 'OutbreakScienceEntity',
                name: 'zika'
              }
            ],
            reviewAnswer: QUESTIONS.map((question, i) => {
              let text;
              if (question.type === 'YesNoQuestion') {
                text =
                  i === 0
                    ? 'yes'
                    : i === 1
                    ? 'no'
                    : i === 2
                    ? 'n.a.'
                    : 'unsure';
              } else {
                text = 'comment';
              }

              return {
                '@type':
                  question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
                parentItem: `question:${question.identifier}`,
                text
              };
            })
          }
        }
      ];

      const stats = getYesNoStats(actions);
    });
  });
});
