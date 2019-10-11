import assert from 'assert';
import pick from 'lodash/pick';
import { QUESTIONS } from '../src/constants';
import { getYesNoStats } from '../src/utils/stats';

describe('stats utils', function() {
  describe('getYesNoStats', () => {
    it('should get yes no stats', () => {
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
      assert.deepEqual(
        stats
          .slice(0, 4)
          .map(stat => pick(stat, ['nReviews', 'yes', 'no', 'na', 'unsure'])),
        [
          {
            nReviews: 1,
            yes: ['role:roleId'],
            no: [],
            na: [],
            unsure: []
          },
          {
            nReviews: 1,
            yes: [],
            no: ['role:roleId'],
            na: [],
            unsure: []
          },
          {
            nReviews: 1,
            yes: [],
            no: [],
            na: ['role:roleId'],
            unsure: []
          },
          {
            nReviews: 1,
            yes: [],
            no: [],
            na: [],
            unsure: ['role:roleId']
          }
        ]
      );
    });
  });
});
