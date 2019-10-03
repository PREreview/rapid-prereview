import assert from 'assert';
import resolve from '../src/utils/resolve';
import { unprefix } from '../src/utils/jsonld';
import {
  createPreprintServer,
  createConfig,
  arXivId,
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

  it('should resolve an arXiv ID', async () => {
    const data = await resolve(arXivId, config);
    assert.deepEqual(data, {
      '@type': 'ScholarlyPreprint',
      arXivId: unprefix(arXivId),
      name: 'Non-algorithmic theory of randomness',
      datePosted: '2019-10-01T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'arXiv' }
    });
  });

  it('should resolve a crossref DOI', async () => {
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

  it('should resove an openAIRE DOI', async () => {
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
