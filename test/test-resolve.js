import assert from 'assert';
import http from 'http';
import path from 'path';
import express from 'express';
import resolve from '../src/utils/resolve';
import { unprefix } from '../src/utils/jsonld';

describe('resolve', function() {
  this.timeout(40000);

  let server;
  const port = 3333;
  const config = {
    baseUrlArxiv: `http://127.0.0.1:${port}/arxiv/`,
    baseUrlCrossref: `http://127.0.0.1:${port}/crossref/`,
    baseUrlOpenAire: `http://127.0.0.1:${port}/openaire/`
  };
  const arXivId = 'arXiv:1910.00585';
  const crossrefDoi = 'doi:10.1101/674655';
  const openAireDoi = 'doi:10.5281/zenodo.3356153';

  before(done => {
    const app = express();
    app.get(`/arxiv/${unprefix(arXivId)}`, (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/arxiv.xml'));
    });
    app.get(`/crossref/${unprefix(crossrefDoi)}`, (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/crossref.json'));
    });
    app.get(`/openaire/${unprefix(openAireDoi)}`, (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/openaire.xml'));
    });
    server = http.createServer(app);
    server.listen(port, done);
  });

  it('should resolve an arXiv ID', async () => {
    const data = await resolve(arXivId, config);
    assert.deepEqual(data, {
      arXivId: arXivId,
      name: 'Non-algorithmic theory of randomness',
      datePosted: '2019-10-01T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'arXiv' }
    });
  });

  it('should resolve a crossref DOI', async () => {
    const data = await resolve(crossrefDoi, config);
    assert.deepEqual(data, {
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
