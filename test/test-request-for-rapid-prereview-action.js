import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi
} from './utils/create-preprint-server';

describe('RequestForRapidPREreviewAction', function() {
  this.timeout(40000);

  let user;
  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);

  before(async () => {
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

    server = createPreprintServer({ logLevel: 'fatal' });
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });
  });

  it('should create a RequestForRapidPREreviewAction', async () => {
    const action = await db.post(
      {
        '@type': 'RequestForRapidPREreviewAction',
        agent: getId(user.hasRole[0]),
        actionStatus: 'CompletedActionStatus',
        object: crossrefDoi
      },
      { user }
    );

    assert(getId(action));
    // console.log(require('util').inspect(action, { depth: null }));
  });

  after(done => {
    server.close(done);
  });
});
