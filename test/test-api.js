import assert from 'assert';
import fetch from 'node-fetch';
import querystring from 'querystring';
import DB from '../src/db/db';
import { QUESTIONS } from '../src/constants';
import { getId, unprefix } from '../src/utils/jsonld';
import { createRandomOrcid } from '../src/utils/orcid';
import {
  createPreprintServer,
  createConfig,
  crossrefDoi,
  arXivId,
  openAireDoi
} from './utils/create-preprint-server';

describe('API', function() {
  this.timeout(40000);

  let user, server;
  const requests = [];
  const reviews = [];
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });
  const db = new DB(config);
  const baseUrl = `http://127.0.0.1:${port}/api`;

  before(async () => {
    await db.init({ reset: true });
    await db.ddoc();

    server = createPreprintServer(config);
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

    for (const id of [crossrefDoi, arXivId, openAireDoi]) {
      const request = await db.post(
        {
          '@type': 'RequestForRapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: id
        },
        {
          user,
          now:
            id === arXivId
              ? '2019-10-01T00:00:00.650Z'
              : '2019-10-20T00:00:00.650Z'
        }
      );

      requests.push(request);

      await db.syncIndex(request, { now: '2019-10-20T00:00:00.650Z' });

      const review = await db.post(
        {
          '@type': 'RapidPREreviewAction',
          agent: getId(user.hasRole[0]),
          actionStatus: 'CompletedActionStatus',
          object: id,
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
        { user, now: '2019-10-20T00:01:00.650Z' }
      );

      reviews.push(review);

      await db.syncIndex(review, { now: '2019-10-20T00:01:02.650Z' });
    }
  });

  it('should get a user', async () => {
    const resp = await fetch(`${baseUrl}/user/${unprefix(getId(user))}`);
    const body = await resp.json();
    assert.equal(getId(body), getId(user));
    assert(!body.token);
  });

  it('should get a role', async () => {
    const resp = await fetch(
      `${baseUrl}/role/${unprefix(getId(user.hasRole[0]))}`
    );
    const body = await resp.json();
    assert.equal(getId(body), getId(user.hasRole[0]));
  });

  it('should get a review', async () => {
    const [review] = reviews;
    const resp = await fetch(`${baseUrl}/review/${unprefix(getId(review))}`);
    const body = await resp.json();
    assert.equal(getId(body), getId(review));
  });

  it('should get a request', async () => {
    const [request] = requests;
    const resp = await fetch(`${baseUrl}/request/${unprefix(getId(request))}`);
    const body = await resp.json();
    assert.equal(getId(body), getId(request));
  });

  it('should get a preprint', async () => {
    const [request] = requests;
    const preprintId = getId(request.object);
    const resp = await fetch(`${baseUrl}/preprint/${unprefix(preprintId)}`);
    const body = await resp.json();
    assert.equal(getId(body), preprintId);
  });

  it('should search preprints', async () => {
    const qs = {
      q: '*:*',
      include_docs: true,
      sort: JSON.stringify(['-score<number>', '-datePosted<number>']),
      counts: JSON.stringify([
        'hasData',
        'hasCode',
        'hasReviews',
        'hasRequests',
        'subjectName'
      ])
    };

    const resp = await fetch(
      `${baseUrl}/preprint?${querystring.stringify(qs)}`
    );
    const body = await resp.json();

    // console.log(require('util').inspect(body, { depth: null }));

    assert.deepEqual(body.counts, {
      hasCode: { true: 3 },
      hasData: { true: 3 },
      hasRequests: { true: 3 },
      hasReviews: { true: 3 },
      subjectName: { zika: 3 }
    });
  });

  it('should search actions', async () => {
    const qs = {
      q: '*:*',
      include_docs: true,
      sort: JSON.stringify(['-startTime<number>']),
      counts: JSON.stringify(['@type'])
    };

    const resp = await fetch(`${baseUrl}/action?${querystring.stringify(qs)}`);
    const body = await resp.json();

    // console.log(require('util').inspect(body, { depth: null }));

    assert.deepEqual(body.counts, {
      '@type': { RapidPREreviewAction: 3, RequestForRapidPREreviewAction: 3 }
    });
  });

  it('should get metadata about an identifier', async () => {
    const resp = await fetch(
      `${baseUrl}/resolve?identifier=${encodeURIComponent(crossrefDoi)}`
    );
    const body = await resp.json();
    assert.equal(body.doi, unprefix(crossrefDoi));
  });

  it('should 401 when posting an action not logged in', async () => {
    const resp = await fetch(`${baseUrl}/action`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '@type': 'Action'
      })
    });
    assert.equal(resp.status, 401);
    const body = await resp.json();
    assert.equal(body['@type'], 'Error');
    assert.equal(body.statusCode, 401);
  });

  after(done => {
    server.close(done);
  });
});
