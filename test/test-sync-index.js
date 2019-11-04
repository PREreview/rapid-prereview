import assert from 'assert';
import { QUESTIONS } from '../src/constants';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi
} from './utils/create-preprint-server';

describe('sync index', function() {
  this.timeout(40000);

  let user;
  let server;
  const port = 3333;
  const config = createConfig(port);
  const db = new DB(config);

  before(async () => {
    await db.init({ reset: true });
    await db.ddoc();

    server = createPreprintServer({ logLevel: 'fatal' });
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });

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
  });

  it('should sync actions to the index', async () => {
    let action = await db.post(
      {
        '@type': 'RequestForRapidPREreviewAction',
        agent: getId(user.hasRole[0]),
        actionStatus: 'CompletedActionStatus',
        object: crossrefDoi
      },
      { user }
    );

    let preprint = await db.syncIndex(action);
    assert.equal(preprint['@type'], 'ScholarlyPreprint');
    assert.equal(preprint.potentialAction.length, 1);
    assert.equal(getId(preprint.potentialAction[0]), getId(action));

    action = await db.post(
      {
        '@type': 'RapidPREreviewAction',
        agent: getId(user.hasRole[0]),
        actionStatus: 'CompletedActionStatus',
        object: crossrefDoi,
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
      { user }
    );
    preprint = await db.syncIndex(action);
    assert.equal(preprint.potentialAction.length, 2);
    // console.log(require('util').inspect(preprint, { depth: null }));

    // TODO create conflict with replication and test merge
  });

  after(done => {
    server.close(done);
  });
});
