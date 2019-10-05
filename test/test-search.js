import assert from 'assert';
import DB from '../src/db/db';
import { QUESTIONS } from '../src/constants';
import { getId, unprefix } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi,
  arXivId,
  openAireDoi
} from './utils/create-preprint-server';

describe('search', function() {
  this.timeout(40000);

  let user, server;
  const requests = [];
  const reviews = [];
  const port = 3333;
  const config = createConfig(port);
  const db = new DB(config);

  before(async () => {
    await db.init({ reset: true });
    await db.ddoc();

    const action = await db.post({
      '@type': 'RegisterAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'Person',
        orcid: createRandomOrcid(),
        name: 'Peter Jon Smith'
      }
    });

    user = action.result;

    server = createPreprintServer(config);
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });

    for (const id of [crossrefDoi, arXivId, openAireDoi]) {
      const request = await db.post(
        {
          '@type': 'RequestForRapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: id
        },
        {
          user,
          now:
            id === arXivId
              ? '2019-10-01T00:00:00.650Z'
              : '2019-10-20T00:00:00.650Z'
        }
      );

      requests.push(request);

      await db.syncIndex(request, { now: '2019-10-20T00:00:00.650Z' });

      const review = await db.post(
        {
          '@type': 'RapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: id,
          resultReview: {
            '@type': 'RapidPREreview',
            about: [
              {
                '@type': 'OutbreakScienceEntity',
                name: 'zika'
              }
            ],
            reviewAnswer: QUESTIONS.map(question => {
              return {
                '@type':
                  question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
                parentItem: `question:${question.identifier}`,
                text: question.type === 'YesNoQuestion' ? 'yes' : 'comment'
              };
            })
          }
        },
        { user, now: '2019-10-20T00:01:00.650Z' }
      );

      reviews.push(review);

      await db.syncIndex(review, { now: '2019-10-20T00:01:02.650Z' });
    }
  });

  describe('searchPreprints', () => {
    it.only('should search preprints', async () => {
      const results = await db.searchPreprints({ q: '*:*' });
      console.log(results);
    });
  });

  after(done => {
    server.close(done);
  });
});
