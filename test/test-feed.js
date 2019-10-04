import assert from 'assert';
import DB from '../src/db/db';
import Feed from '../src/db/feed';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi
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

    server = createPreprintServer();
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });
  });

  it('should sync index', done => {
    const feed = new Feed(db);
    feed.start();

    feed.on('sync', (seq, preprint) => {
      assert.equal(preprint['@type'], 'ScholarlyPreprint');
      const lastSeq = feed.stop();
      assert.equal(lastSeq, seq);
      done();
    });

    const action = db
      .post(
        {
          '@type': 'RequestForRapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: crossrefDoi
        },
        {
          user
        }
      )
      .catch(done);
  });

  after(done => {
    server.close(done);
  });
});
