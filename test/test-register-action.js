import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('RegisterAction', function() {
  this.timeout(40000);

  const db = new DB();

  it('should register an user', async () => {
    const action = await db.post({
      '@type': 'RegisterAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'Person',
        orcid: createRandomOrcid(),
        name: 'Peter Jon Smith'
      }
    });

    assert(getId(action.result));
    assert(getId(action.result.hasRole[0]).startsWith('role:'));
    assert.equal(action.result.hasRole[0]['@type'], 'AnonymousReviewerRole');
  });
});
