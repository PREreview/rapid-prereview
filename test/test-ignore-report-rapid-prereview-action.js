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

describe('IgnoreReportRapidPREreviewAction', function() {
  this.timeout(40000);

  let admin, user, reviewAction;
  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);

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

    // make the user defaultRole moderator
    const grantAction = await db.post(
      {
        '@type': 'GrantModeratorRoleAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(admin),
        object: user.defaultRole
      },
      { user: admin }
    );

    server = createPreprintServer({ logLevel: 'fatal' });
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });

    reviewAction = await db.post(
      {
        '@type': 'RapidPREreviewAction',
        agent: getId(admin.defaultRole),
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
      { user: admin }
    );

    await db.post(
      {
        '@type': 'ReportRapidPREreviewAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(user.hasRole[1]),
        object: getId(reviewAction),
        moderationReason: 'Violation of Code of Conduct'
      },
      { user }
    );
  });

  it('should let moderator ignore the user report', async () => {
    const now = new Date().toISOString();
    const action = await db.post(
      {
        '@type': 'IgnoreReportRapidPREreviewAction',
        actionStatus: 'CompletedActionStatus',
        agent: user.defaultRole,
        object: getId(reviewAction),
        moderationReason: 'Actually it is OK'
      },
      { user, now }
    );

    // console.log(require('util').inspect(action, { depth: null }));

    assert(
      action.result.moderationAction.some(
        action => action['@type'] === 'ReportRapidPREreviewAction'
      ) &&
        action.result.moderationAction.some(
          action => action['@type'] === 'IgnoreReportRapidPREreviewAction'
        )
    );

    // check that we can't add the same action twice
    const reAction = await db.post(
      {
        '@type': 'IgnoreReportRapidPREreviewAction',
        actionStatus: 'CompletedActionStatus',
        agent: user.defaultRole,
        object: getId(reviewAction),
        moderationReason: 'Violation of Code of Conduct'
      },
      { user, now }
    );
    assert.equal(
      reAction.result.moderationAction.some(
        action => action['@type'] === 'ReportRapidPREreviewAction'
      ) &&
        reAction.result.moderationAction.filter(
          action => action['@type'] === 'IgnoreReportRapidPREreviewAction'
        ).length,
      1
    );

    // console.log(require('util').inspect(reAction, { depth: null }));
  });

  it('should not let a normal role (not moderator) ignore moderation', async () => {
    await assert.rejects(
      db.post(
        {
          '@type': 'IgnoreReportRapidPREreviewAction',
          actionStatus: 'CompletedActionStatus',
          agent: getId(user.hasRole[1]),
          object: getId(reviewAction)
        },
        { user }
      ),
      {
        statusCode: 403
      }
    );
  });

  after(done => {
    server.close(done);
  });
});
