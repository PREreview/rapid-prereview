import assert from 'assert';
import omit from 'lodash/omit';
import DB from '../src/db/db';
import { createContactPointId } from '../src/utils/ids';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('VerifyContactPointAction', function() {
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

    const updateAction = await db.post(
      {
        '@type': 'UpdateContactPointAction',
        agent: getId(user),
        actionStatus: 'CompletedActionStatus',
        object: createContactPointId(user),
        payload: {
          contactType: 'notifications',
          email: 'mailto:me@example.com',
          active: true
        }
      },
      { user }
    );

    user = updateAction.result;
  });

  it('should verify a contact point', async () => {
    const now = new Date().toISOString();
    const action = await db.post(
      {
        '@type': 'VerifyContactPointAction',
        agent: getId(user),
        actionStatus: 'CompletedActionStatus',
        object: createContactPointId(user),
        token: omit(user.contactPoint.token, ['dateCreated'])
      },
      { user, now }
    );

    // console.log(require('util').inspect(action, { depth: null }));

    assert.equal(action.result.contactPoint.dateVerified, now);

    // we need `dateModified` for the reconciliation logic
    assert.equal(action.result.dateModified, now);
  });
});
