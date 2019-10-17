import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('UpdateUserAction', function() {
  this.timeout(40000);

  let user;
  const db = new DB();

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
  });

  it('should update a user', async () => {
    const now = new Date().toISOString();
    const action = await db.post(
      {
        '@type': 'UpdateUserAction',
        agent: getId(user),
        actionStatus: 'CompletedActionStatus',
        object: getId(user),
        payload: {
          defaultRole: getId(user.hasRole[1])
        }
      },
      { user, now }
    );

    // console.log(require('util').inspect(action, { depth: null }));

    assert.equal(action.result.defaultRole, getId(user.hasRole[1]));
    // we need `dateModified` for the reconciliation logic
    assert.equal(action.result.dateModified, now);
  });
});
