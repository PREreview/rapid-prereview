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

  let user;
  let server;
  const port = 3333;
  const config = createConfig(port);
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

    server = createPreprintServer();
    await new Promise((resolve, reject) => {
      server.listen(port, resolve);
    });
  });

  it('should create a RapidPREreviewAction', async () => {
    const action = await db.post(
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

    assert(getId(action));
    // console.log(require('util').inspect(action, { depth: null }));
  });

  after(done => {
    server.close(done);
  });
});
