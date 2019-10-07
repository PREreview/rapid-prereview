import assert from 'assert';
import resolve from '../src/utils/resolve';
import { unprefix } from '../src/utils/jsonld';
import {
  createPreprintServer,
  createConfig,
  arXivId,
  errorDoesNotExistArXivId,
  crossrefDoi,
  openAireDoi
} from './utils/create-preprint-server';

describe('resolve', function() {
  this.timeout(40000);

  let server;
  const port = 3333;
  const config = createConfig(port);

  before(done => {
    server = createPreprintServer();
    server.listen(port, done);
  });

  it('should error on invalid identifier', async () => {
    await assert.rejects(resolve('invalidId', config), {
      statusCode: 400
    });
  });

  it('should resolve an arXiv ID through the OAI-PMH API', async () => {
    const data = await resolve(arXivId, config);
    assert.deepEqual(data, {
      '@type': 'ScholarlyPreprint',
      arXivId: unprefix(arXivId),
      name: 'Non-algorithmic theory of randomness',
      datePosted: '2019-10-01T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'arXiv' }
    });
  });

  it('should 404 on inexisting arXiv ID  through the OAI-PMH API', async () => {
    await assert.rejects(resolve(errorDoesNotExistArXivId, config), {
      statusCode: 404
    });
  });

  it('should resolve a crossref DOI through the crossref API', async () => {
    const data = await resolve(crossrefDoi, config);
    assert.deepEqual(data, {
      '@type': 'ScholarlyPreprint',
      doi: unprefix(crossrefDoi),
      name:
        'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
      datePosted: '2019-09-30T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' }
    });
  });

  it('should resolve a zenodo DOI through the openAIRE API', async () => {
    const data = await resolve(openAireDoi, config);
    assert.deepEqual(data, {
      '@type': 'ScholarlyPreprint',
      doi: unprefix(openAireDoi),
      name:
        'Trumping the agenda? The continuity and discontinuity in foreign affairs between the U.S. and Colombia',
      datePosted: '2019-12-31T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'ZENODO' }
    });
  });

  after(done => {
    server.close(done);
  });
});
