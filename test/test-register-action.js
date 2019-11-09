import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('RegisterAction', function() {
  this.timeout(40000);

  const db = new DB();

  let registerAction;
  const now = new Date().toISOString();
  before(async () => {
    registerAction = await db.post(
      {
        '@type': 'RegisterAction',
        actionStatus: 'CompletedActionStatus',
        agent: {
          '@type': 'Person',
          orcid: createRandomOrcid(),
          name: 'Peter Jon Smith'
        }
      },
      { now }
    );
  });

  it('should have registered an user', async () => {
    // console.log(require('util').inspect(registerAction, { depth: null }));

    assert(getId(registerAction.result));
    assert(getId(registerAction.result.hasRole[0]).startsWith('role:'));
    assert.equal(
      registerAction.createdRole[0]['@type'],
      'AnonymousReviewerRole'
    );
    assert(!registerAction.createdRole[0].isRoleOf);
    assert(registerAction.createdRole[0]._rev);
    assert.equal(
      registerAction.createdRole[1].isRoleOf,
      getId(registerAction.result)
    );
  });

  it('should allow to call again RegisterAction on a registered user', async () => {
    const action = await db.post(
      {
        '@type': 'RegisterAction',
        actionStatus: 'CompletedActionStatus',
        agent: {
          '@type': 'Person',
          orcid: registerAction.result.orcid,
          name: 'Peter Jon Smith v2'
        }
      },
      { now: new Date(new Date(now).getTime() + 10) }
    );

    assert.equal(action.result.name, 'Peter Jon Smith v2');
    assert(
      new Date(action.result.dateModified).getTime() >
        new Date(registerAction.result.dateModified).getTime()
    );
    assert.equal(getId(action.defaultRole), getId(registerAction.defaultRole));
    assert.deepEqual(action.hasRole, registerAction.hasRole);

    //console.log(
    //  require('util').inspect({ registerAction, action }, { depth: null })
    //);
  });
});
