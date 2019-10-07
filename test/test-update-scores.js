import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi,
  arXivId
} from './utils/create-preprint-server';

describe('update scores', function() {
  this.timeout(40000);

  let user;
  let server;
  const port = 3333;
  const config = createConfig(port);
  const db = new DB(config);

  before(async () => {
    await db.init({ reset: true });
    await db.ddoc();

    server = createPreprintServer();
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

    for (const id of [crossrefDoi, arXivId]) {
      const action = await db.post(
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

      await db.syncIndex(action, { now: '2019-10-20T00:00:00.650Z' });
    }
  });

  it('should update scores', async () => {
    // first update so that 1 score get to 0
    let preprints = await db.updateScores({
      now: '2019-10-29T00:00:00.650Z'
    });

    assert.equal(preprints.length, 2);
    assert.equal(preprints.filter(preprint => preprint.score === 0).length, 1);

    // update again, this time only 1 preprint is updated (the one with score non null)
    preprints = await db.updateScores({
      now: '2019-10-29T03:00:00.650Z'
    });
    assert.equal(preprints.length, 1);
  });

  after(done => {
    server.close(done);
  });
});
