import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('DeanonymizeRoleAction', function() {
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

  it('should deanonymize a role', async () => {
    const action = await db.post(
      {
        '@type': 'DeanonymizeRoleAction',
        agent: getId(user),
        actionStatus: 'CompletedActionStatus',
        object: user.hasRole[0]
      },
      { user }
    );

    // console.log(require('util').inspect(action, { depth: null }));

    assert.equal(action.result['@type'], 'PublicReviewerRole');
    assert.equal(action.result.isRoleOf, getId(user));
  });
});
