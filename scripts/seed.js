/* eslint-disable no-console */

import faker from 'faker';
import fetch from 'node-fetch';
import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
import { QUESTIONS } from '../src/constants';
import DB from '../src/db/db';
import { createRandomOrcid } from '../src/utils/orcid';
import { getId, cleanup } from '../src/utils/jsonld';
import {
  createPreprintServer,
  createConfig,
  id2paths,
  arXivId,
  crossrefDoi,
  openAireDoi,
  errorDoesNotExistArXivId
} from '../test/utils/create-preprint-server';

const identifiers = Object.keys(id2paths).filter(
  id =>
    id !== arXivId &&
    id !== crossrefDoi &&
    id !== openAireDoi &&
    id !== errorDoesNotExistArXivId
);

const N_USERS = 50;

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
  for (let i = 0; i < N_USERS; i++) {
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

    let user = action.result;
    const roles = action.resultRole;

    // add avatars and name
    for (const type of ['AnonymousReviewerRole', 'PublicReviewerRole']) {
      const role = roles.find(role => role['@type'] === type);

      let n = 0;
      while (n < 5) {
        const avatarUrl = faker.image.avatar();

        console.log(
          `\t\t- setting avatar ${avatarUrl} for ${type} (${getId(
            role
          )}) - try ${n + 1} / 5`
        );
        const r = await fetch(avatarUrl);
        if (r.ok) {
          const buffer = await r.buffer();

          const updateRoleAction = await db.post(
            {
              '@type': 'UpdateRoleAction',
              actionStatus: 'CompletedActionStatus',
              agent: getId(user),
              object: getId(role),
              payload: cleanup({
                name:
                  type === 'AnonymousReviewerRole'
                    ? faker.internet.userName()
                    : undefined,
                avatar: {
                  '@type': 'ImageObject',
                  encodingFormat: r.headers.get('Content-Type'),
                  contentUrl: `data:${r.headers.get(
                    'Content-Type'
                  )};base64,${buffer.toString('base64')}`
                }
              })
            },
            { user }
          );
          break;
        }
      }
    }

    // make 50% of user public
    if (Math.random() <= 0.5) {
      console.log(`\t\t- Making public role default for ${user.name}`);
      const updateDefaultRoleAction = await db.post(
        {
          '@type': 'UpdateUserAction',
          agent: getId(user),
          object: getId(user),
          actionStatus: 'CompletedActionStatus',
          payload: {
            defaultRole: getId(
              roles.find(role => role['@type'] === 'PublicReviewerRole')
            )
          }
        },
        { user }
      );
      user = updateDefaultRoleAction.result;
    }

    users.push(user);
  }

  for (const identifier of identifiers) {
    console.log(`\nProcessing ${identifier}...`);
    const reporters = sampleSize(users, Math.ceil(3 * Math.random()));
    const requesters = sampleSize(users, Math.ceil(5 * Math.random()));
    const reviewers = sampleSize(
      users.filter(
        user => !requesters.some(requester => getId(requester) === getId(user))
      ),
      identifier === identifiers[0]
        ? N_USERS - requesters.length
        : Math.ceil(5 * Math.random())
    );

    for (const user of requesters) {
      console.log(`\t- Starting ${user.name} request for ${identifier}...`);
      const action = await db.post(
        {
          '@type': 'RequestForRapidPREreviewAction',
          agent: user.defaultRole,
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
          agent: user.defaultRole,
          actionStatus: 'CompletedActionStatus',
          object: identifier,
          resultReview: {
            '@type': 'RapidPREreview',
            about: [
              {
                '@type': 'OutbreakScienceEntity',
                name:
                  {
                    'arXiv:1909.13766': 'Influenza',
                    'arXiv:1910.00274': 'Influenza',
                    'doi:10.1101/19001834': 'Influenza',
                    'doi:10.1101/19007971': 'Dengue',
                    'doi:10.1101/780627': 'Influenza',
                    'doi:10.1101/782680': 'Influenza',
                    'doi:10.1101/788968': 'Influenza',
                    'doi:10.1101/790493': 'Cholera',
                    'doi:10.1101/790642': 'Dengue',
                    'doi:10.1101/791004': 'Influenza',
                    'doi:10.1101/791038': 'Influenza'
                  }[identifier] || sample(['Influenza', 'Dengue', 'Zika'])
              }
            ],
            reviewAnswer: QUESTIONS.map(question => {
              return {
                '@type':
                  question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
                parentItem: `question:${question.identifier}`,
                text:
                  question.type === 'YesNoQuestion'
                    ? sample(['yes', 'no', 'n.a.', 'unsure'])
                    : faker.lorem.paragraph()
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

      // reporters report review as inapropriate
      for (const reporter of reporters) {
        if (getId(reporter) !== getId(user)) {
          console.log(`\t\t- Starting ${reporter.name} report...`);
          const reportAction = await db.post(
            {
              '@type': 'ReportRapidPREreviewAction',
              actionStatus: 'CompletedActionStatus',
              agent: reporter.defaultRole,
              object: getId(action),
              moderationReason: faker.lorem.paragraph()
            },
            { user: reporter }
          );

          console.log(`\t\t  -> OK`);
          console.log(
            `\t\t- Syncing index for ${reportAction['@type']} result (${getId(
              reportAction.result
            )})...`
          );
          await db.syncIndex(reportAction.result);
          console.log(`\t\t  -> OK`);
        }
      }
    }

    console.log(`\t- Updating scores for ${identifier}...`);
    await db.updateScores();
    console.log(`\t  -> OK`);
  }

  await new Promise(resolve => server.close(resolve));
})();
