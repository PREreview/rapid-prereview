import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('CreateApiKeyAction', function() {
  this.timeout(40000);

  let user;
  const db = new DB();

  before(async () => {
    const action = await db.post(
      {
        '@type': 'RegisterAction',
        actionStatus: 'CompletedActionStatus',
        agent: {
          '@type': 'Person',
          orcid: createRandomOrcid(),
          name: 'leticia buffoni'
        }
      },
      { isAdmin: false }
    );

    user = action.result;
  });

  it('should create an api key', async () => {
    const now = new Date().toISOString();
    const action = await db.post(
      {
        '@type': 'CreateApiKeyAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(user),
        object: getId(user)
      },
      { user, now }
    );

    // console.log(require('util').inspect(action, { depth: null }));
    const { apiKey } = action.result;

    assert.equal(apiKey['@type'], 'ApiKey');
    assert(apiKey.value);
    assert.equal(apiKey.dateCreated, now);
  });
});
