import assert from 'assert';
import { QUESTIONS } from '../src/constants';
import DB from '../src/db/db';
import { getId } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi
} from './utils/create-preprint-server';

describe('RapidPREreviewAction', function() {
  this.timeout(40000);

  let user, reviewAction;
  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);

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

    server = createPreprintServer({ logLevel: 'fatal' });
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });

    reviewAction = await db.post(
      {
        '@type': 'RapidPREreviewAction',
        agent: getId(user.hasRole[0]),
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

  it('should let anyone not moderated be able to report a RapidPREreviewAction', async () => {
    const now = new Date().toISOString();
    const action = await db.post(
      {
        '@type': 'ReportRapidPREreviewAction',
        actionStatus: 'CompletedActionStatus',
        agent: user.defaultRole,
        object: getId(reviewAction),
        moderationReason: 'Violation of Code of Conduct'
      },
      { user, now }
    );

    // console.log(require('util').inspect(action, { depth: null }));

    assert(
      action.result.moderationAction[0]['@type'] ===
        'ReportRapidPREreviewAction'
    );

    // check that we can't add the same action twice
    const reAction = await db.post(
      {
        '@type': 'ReportRapidPREreviewAction',
        actionStatus: 'CompletedActionStatus',
        agent: user.defaultRole,
        object: getId(reviewAction),
        moderationReason: 'Violation of Code of Conduct'
      },
      { user, now }
    );
    assert.equal(reAction.result.moderationAction.length, 1);
  });

  after(done => {
    server.close(done);
  });
});
