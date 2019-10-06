/* eslint-disable no-console */

import faker from 'faker';
import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
import { QUESTIONS } from '../src/constants';
import DB from '../src/db/db';
import { createRandomOrcid } from '../src/utils/orcid';
import { getId } from '../src/utils/jsonld';
import {
  createPreprintServer,
  createConfig,
  id2path,
  arXivId,
  crossrefDoi,
  openAireDoi
} from '../test/utils/create-preprint-server';

const identifiers = Object.keys(id2path).filter(
  id => id !== arXivId && id !== crossrefDoi && id !== openAireDoi
);

const subjects = ['influenza', 'dengue', 'zika'];
const answers = ['yes', 'no', 'n.a.', 'unsure'];

(async function() {
  const port = 3333;
  const config = createConfig(port);
  const db = new DB(config);

  await db.init({ reset: true });
  await db.ddoc();

  const server = createPreprintServer();
  await new Promise(resolve => {
    server.listen(port, resolve);
  });

  const users = [];
  console.log('Registering users...');
  for (let i = 0; i < 10; i++) {
    const action = await db.post({
      '@type': 'RegisterAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'Person',
        orcid: createRandomOrcid(),
        name: faker.name.findName()
      }
    });
    console.log(`\t- ${action.result.name} (${action.result.orcid})`);
    users.push(action.result);
  }

  for (const identifier of identifiers) {
    console.log(`\nProcessing ${identifier}...`);
    const requesters = sampleSize(users, Math.ceil(5 * Math.random()));
    const reviewers = sampleSize(
      users.filter(
        user => !requesters.some(requester => getId(requester) === getId(user))
      ),
      Math.ceil(5 * Math.random())
    );

    for (const user of requesters) {
      console.log(`\t- Starting ${user.name} request for ${identifier}...`);
      const action = await db.post(
        {
          '@type': 'RequestForRapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: identifier
        },
        { user }
      );
      console.log(`\t  -> OK`);
      console.log(`\t- Syncing index for ${identifier}...`);
      await db.syncIndex(action);
      console.log(`\t  -> OK`);
    }

    for (const user of reviewers) {
      console.log(`\t- Starting ${user.name} review for ${identifier}...`);
      const action = await db.post(
        {
          '@type': 'RapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: identifier,
          resultReview: {
            '@type': 'RapidPREreview',
            about: [
              {
                '@type': 'OutbreakScienceEntity',
                name: sample(subjects)
              }
            ],
            reviewAnswer: QUESTIONS.map(question => {
              return {
                '@type':
                  question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
                parentItem: `question:${question.identifier}`,
                text:
                  question.type === 'YesNoQuestion'
                    ? sample(answers)
                    : 'comment'
              };
            })
          }
        },
        { user }
      );
      console.log(`\t  -> OK`);

      console.log(`\t- Syncing index for ${identifier}...`);
      await db.syncIndex(action);
      console.log(`\t  -> OK`);
    }

    console.log(`\t- Updating scores for ${identifier}...`);
    await db.updateScores();
    console.log(`\t  -> OK`);
  }

  await new Promise(resolve => server.close(resolve));
})();
