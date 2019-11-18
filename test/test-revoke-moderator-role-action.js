import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('GrantModeratorRoleAction', function() {
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

    await db.post(
      {
        '@type': 'GrantModeratorRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin),
        object: user.defaultRole
      },
      { user: admin }
    );
  });

  it('admin should revoke moderator role to user default role', async () => {
    const action = await db.post(
      {
        '@type': 'RevokeModeratorRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin),
        object: user.defaultRole
      },
      { user: admin }
    );

    // console.log(require('util').inspect(action, { depth: null }));
    assert(!action.result.isModerator);
  });
});
