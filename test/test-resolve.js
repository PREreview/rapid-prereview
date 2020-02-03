import assert from 'assert';
import resolve from '../src/utils/resolve';
import { unprefix } from '../src/utils/jsonld';
import {
  createPreprintServer,
  createConfig,
  arXivId,
  errorDoesNotExistArXivId,
  crossrefDoi,
  openAireDoi,
  arXivPdfUrl,
  bioRxivPdfUrl
} from './utils/create-preprint-server';

describe('resolve', function() {
  this.timeout(40000);

  let server;
  const port = 3333;
  const config = createConfig(port, { logLevel: 'fatal' });

  before(done => {
    server = createPreprintServer({ logLevel: 'fatal' });
    server.listen(port, done);
  });

  it('should error on invalid identifier', async () => {
    await assert.rejects(resolve('invalidId', config), {
      statusCode: 400
    });
  });

  describe('all strategy (default, starts with HTML)', () => {
    it('should resolve an arXiv ID directly through the HTML of the article', async () => {
      const data = await resolve(arXivId, config);
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        arXivId: unprefix(arXivId),
        name: 'Non-algorithmic theory of randomness',
        datePosted: '2019-10-01T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'arXiv' },
        url: 'https://arxiv.org/abs/1910.00585v1',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl: 'https://arxiv.org/pdf/1910.00585'
          }
        ]
      });
    });

    it('should resolve a crossref DOI directly through the HTML of the article', async () => {
      const data = await resolve(crossrefDoi, config);
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        doi: unprefix(crossrefDoi),
        name:
          'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
        datePosted: '2019-09-30T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' },
        url: 'https://www.biorxiv.org/content/10.1101/674655v2',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl:
              'https://www.biorxiv.org/content/biorxiv/early/2019/09/30/674655.full.pdf'
          }
        ]
      });
    });

    it('should resolve a zenodo DOI directly through the HTML of the article', async () => {
      const data = await resolve(openAireDoi, config);
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        doi: unprefix(openAireDoi),
        name:
          'Trumping the agenda? The continuity and discontinuity in foreign affairs between the U.S. and Colombia',
        datePosted: '2019-12-31T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'Zenodo' },
        url: 'https://zenodo.org/record/3356153',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl:
              'https://zenodo.org/record/3356153/files/TRUMPING%20THE%20AGENDA%20final%20version%20FD%20y%20MCJ.pdf'
          }
        ]
      });
    });
  });

  describe('api strategy', () => {
    it('should resolve an arXiv ID through the OAI-PMH API', async () => {
      const data = await resolve(arXivId, config, { strategy: 'apiOnly' });
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        arXivId: unprefix(arXivId),
        name: 'Non-algorithmic theory of randomness',
        datePosted: '2019-10-01T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'arXiv' }
      });
    });

    it('should 404 on inexisting arXiv ID through the OAI-PMH API', async () => {
      await assert.rejects(
        resolve(errorDoesNotExistArXivId, config, { strategy: 'apiOnly' }),
        {
          statusCode: 404
        }
      );
    });

    it('should resolve a crossref DOI through the crossref API', async () => {
      const data = await resolve(crossrefDoi, config, { strategy: 'apiOnly' });
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
      const data = await resolve(openAireDoi, config, { strategy: 'apiOnly' });
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        doi: unprefix(openAireDoi),
        name:
          'Trumping the agenda? The continuity and discontinuity in foreign affairs between the U.S. and Colombia',
        datePosted: '2019-12-31T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'ZENODO' }
      });
    });
  });

  describe('PDF urls', () => {
    it('should resolve an arXiv PDF URL', async () => {
      const data = await resolve(arXivPdfUrl, config);
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        arXivId: unprefix(arXivId),
        name: 'Non-algorithmic theory of randomness',
        datePosted: '2019-10-01T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'arXiv' },
        url: 'https://arxiv.org/abs/1910.00585v1',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl: 'https://arxiv.org/pdf/1910.00585'
          }
        ]
      });
    });

    it('should resolve a bioRxiv or medRxiv PDF URL', async () => {
      const data = await resolve(bioRxivPdfUrl, config);
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        doi: unprefix(crossrefDoi),
        name:
          'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
        datePosted: '2019-09-30T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' },
        url: 'https://www.biorxiv.org/content/10.1101/674655v2',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl:
              'https://www.biorxiv.org/content/biorxiv/early/2019/09/30/674655.full.pdf'
          }
        ]
      });
    });
  });

  describe('fallbackUrl', () => {
    it('should use the fallback URL', async () => {
      const data = await resolve(
        crossrefDoi,
        Object.assign({}, config, {
          baseUrlDoi: `http://127.0.0.1:${port}/404/`
        }),
        {
          strategy: 'htmlOnly',
          fallbackUrl: `${config.baseUrlDoi}${unprefix(crossrefDoi)}`
        }
      );
      assert.deepEqual(data, {
        '@type': 'ScholarlyPreprint',
        doi: unprefix(crossrefDoi),
        name:
          'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
        datePosted: '2019-09-30T00:00:00.000Z',
        preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' },
        url: 'https://www.biorxiv.org/content/10.1101/674655v2',
        encoding: [
          {
            '@type': 'MediaObject',
            encodingFormat: 'application/pdf',
            contentUrl:
              'https://www.biorxiv.org/content/biorxiv/early/2019/09/30/674655.full.pdf'
          }
        ]
      });
    });

    it('should 404 if the fallback URL results in a different identifier', async () => {
      await assert.rejects(
        resolve(
          crossrefDoi,
          Object.assign({}, config, {
            baseUrlDoi: `http://127.0.0.1:${port}/404/`
          }),
          {
            strategy: 'htmlOnly',
            fallbackUrl: `${config.baseUrlDoi}${unprefix(openAireDoi)}`
          }
        ),
        {
          statusCode: 404
        }
      );
    });
  });

  after(done => {
    server.close(done);
  });
});
