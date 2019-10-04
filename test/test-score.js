import assert from 'assert';
import { getScore } from '../src/utils/score';

describe('score', function() {
  it('should get a score when called with nothing', () => {
    const score = getScore();
    assert.equal(score, 0);
  });

  it('should get a score when called with 1 action', () => {
    const score = getScore(
      {
        '@type': 'RapidPREreviewAction',
        startTime: '2019-10-04T00:00:00.515Z'
      },
      {
        now: '2019-10-04T01:00:00.515Z'
      },
      { g: 1, threshold: 1e-5 }
    );
    assert.equal(score, 0.5);
  });

  it('should get a score when called with several actions', () => {
    const score = getScore(
      [
        {
          '@type': 'RapidPREreviewAction',
          startTime: '2019-10-04T00:00:00.515Z'
        },
        {
          '@type': 'RequestForRapidPREreviewAction',
          startTime: '2019-10-04T00:01:00.515Z'
        }
      ],
      {
        now: '2019-10-04T01:00:00.515Z'
      },
      { g: 1, threshold: 1e-5 }
    );
    assert.equal(score, 1);
  });

  it('should set score to 0 past the threshold', () => {
    const score = getScore(
      {
        '@type': 'RapidPREreviewAction',
        startTime: '2018-10-04T00:00:00.515Z'
      },
      {
        now: '2019-10-04T01:00:00.515Z'
      }
    );
    assert.equal(score, 0);
  });
});
