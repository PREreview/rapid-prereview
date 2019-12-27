import assert from 'assert';
import DB from '../src/db/db';
import { createContactPointId } from '../src/utils/ids';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';

describe('UpdateContactPointAction', function() {
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

  it('should create and update a contact point', async () => {
    let now = new Date().toISOString();
    const createAction = await db.post(
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
      { user, now, strict: false }
    );

    // console.log(require('util').inspect(createAction, { depth: null }));

    assert(createAction.result.contactPoint.token.value);
    assert.equal(createAction.result.contactPoint.token.dateCreated, now);
    assert.equal(createAction.result.contactPoint.dateVerified, null);

    // we need `dateModified` for the reconciliation logic
    assert.equal(createAction.result.dateModified, now);

    // Update
    now = new Date().toISOString();
    const updateAction = await db.post(
      {
        '@type': 'UpdateContactPointAction',
        agent: getId(user),
        actionStatus: 'CompletedActionStatus',
        object: createContactPointId(user),
        payload: {
          contactType: 'notifications',
          email: 'mailto:me2@example.com',
          active: true
        }
      },
      { user, now, strict: false }
    );

    assert(updateAction.result.contactPoint.token.value);
    assert(
      createAction.result.contactPoint.token.value !==
        updateAction.result.contactPoint.token.value
    );
    assert.equal(updateAction.result.contactPoint.dateVerified, null);

    assert.equal(updateAction.result.dateModified, now);

    // console.log(require('util').inspect(updateAction, { depth: null }));
  });

  it('should not leak the token in strict mode', async () => {
    const action = await db.post(
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

    assert(!action.result.contactPoint.token);
  });
});
