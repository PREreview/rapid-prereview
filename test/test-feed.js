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

describe('feed', function() {
  this.timeout(40000);

  let user;
  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);

  before(async () => {
    await db.init({ reset: true, waitFor: 2000 });
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

  it('follow the changes feed and sync index DB and make the latest triggering seq accessible via the getLatestTriggeringSeq view', done => {
    const feed = new Feed(db);
    feed.start();

    feed.on('sync', (seq, preprint) => {
      assert.equal(preprint['@type'], 'ScholarlyPreprint');
      assert.equal(preprint.triggeringSeq, seq);
      const lastSeq = feed.stop();
      assert.equal(lastSeq, seq);

      db.getLatestTriggeringSeq()
        .then(latestTriggeringSeq => {
          assert.equal(latestTriggeringSeq, seq);
          done();
        })
        .catch(done);
    });

    feed.on('error', err => {
      feed.stop();
      done(err);
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
