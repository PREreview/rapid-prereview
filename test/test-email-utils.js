import assert from 'assert';
import omit from 'lodash/omit';
import { QUESTIONS } from '../src/constants';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi
} from './utils/create-preprint-server';
import { createContactPointId } from '../src/utils/ids';
import { createEmailMessages } from '../src/utils/email';

describe('email utils', function() {
  this.timeout(40000);

  let user, requester;
  let reviewAction;
  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);

  before(async () => {
    server = createPreprintServer({ logLevel: 'fatal' });
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });

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

    const createRequesterAction = await db.post({
      '@type': 'RegisterAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'Person',
        orcid: createRandomOrcid(),
        name: 'Leticia Buffoni'
      }
    });

    requester = createRequesterAction.result;

    const updateContactPointAction = await db.post(
      {
        '@type': 'UpdateContactPointAction',
        agent: getId(requester),
        actionStatus: 'CompletedActionStatus',
        object: createContactPointId(requester),
        payload: {
          contactType: 'notifications',
          email: 'mailto:me@example.com',
          active: true
        }
      },
      { user: requester, strict: false }
    );

    requester = updateContactPointAction.result;

    const verifyContactPointAction = await db.post(
      {
        '@type': 'VerifyContactPointAction',
        agent: getId(requester),
        actionStatus: 'CompletedActionStatus',
        object: createContactPointId(requester),
        token: omit(requester.contactPoint.token, ['dateCreated'])
      },
      { user: requester }
    );
    requester = verifyContactPointAction.result;

    const requestAction = await db.post(
      {
        '@type': 'RequestForRapidPREreviewAction',
        agent: getId(requester.defaultRole),
        actionStatus: 'CompletedActionStatus',
        object: crossrefDoi
      },
      { user: requester }
    );

    reviewAction = await db.post(
      {
        '@type': 'RapidPREreviewAction',
        agent: getId(user.defaultRole),
        actionStatus: 'CompletedActionStatus',
        object: crossrefDoi,
        resultReview: {
          '@type': 'RapidPREreview',
          about: [
            {
              '@type': 'OutbreakScienceEntity',
              name: 'zika'
            }
          ],
          reviewAnswer: QUESTIONS.map(question => {
            return {
              '@type':
                question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
              parentItem: `question:${question.identifier}`,
              text: question.type === 'YesNoQuestion' ? 'yes' : 'comment'
            };
          })
        }
      },
      { user }
    );
  });

  it.skip('should create emails so that requesters are notified when reviews are created', async () => {
    const messages = await createEmailMessages({ db }, reviewAction);
    console.log(require('util').inspect(messages, { depth: null }));
  });

  after(done => {
    server.close(done);
  });
});
