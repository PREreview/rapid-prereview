import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('UnmoderateRoleAction', function() {
  this.timeout(40000);

  let admin, user;
  const db = new DB();

  before(async () => {
    const adminAction = await db.post(
      {
        '@type': 'RegisterAction',
        actionStatus: 'CompletedActionStatus',
        agent: {
          '@type': 'Person',
          orcid: createRandomOrcid(),
          name: 'Peter Jon Smith'
        }
      },
      { isAdmin: true }
    );

    admin = adminAction.result;

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

    const moderateAction = await db.post(
      {
        '@type': 'ModerateRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin.defaultRole),
        object: user.defaultRole,
        moderationReason: 'Repeated violation of the Code of Conduct'
      },
      { user: admin }
    );
  });

  it('admin should be able to unblock the role of a user', async () => {
    const action = await db.post(
      {
        '@type': 'UnmoderateRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin.defaultRole),
        object: user.defaultRole
      },
      { user: admin }
    );

    // console.log(require('util').inspect(action, { depth: null }));
    assert(!action.result.isModerated);
  });
});
