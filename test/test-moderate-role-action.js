import assert from 'assert';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('ModerateRoleAction', function() {
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
  });

  it('admin should be able to block the role of a user', async () => {
    const action = await db.post(
      {
        '@type': 'ModerateRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin),
        object: user.defaultRole,
        moderationReason: 'Repeated violation of the Code of Conduct'
      },
      { user: admin }
    );

    // console.log(require('util').inspect(action, { depth: null }));
    assert(action.result.isModerated);
  });
});
