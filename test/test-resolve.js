import assert from 'assert';
import http from 'http';
import path from 'path';
import express from 'express';
import resolve from '../src/utils/resolve';

describe.only('resolve', function() {
  this.timeout(40000);

  let server;
  const port = 3333;
  const config = {
    baseUrlArxiv: `http://127.0.0.1:${port}/arxiv/`,
    baseUrlCrossref: `http://127.0.0.1:${port}/crossref/`,
    baseUrlOpenAire: `http://127.0.0.1:${port}/openaire/`
  };

  before(done => {
    const app = express();
    app.get('/arxiv/:id', (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/arxiv.xml'));
    });
    app.get('/crossref/:prefix/:suffix', (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/crossref.json'));
    });
    app.get('/openaire/:prefix/:suffix', (req, res, next) => {
      res.sendFile(path.resolve(__dirname, 'fixtures/openaire.xml'));
    });
    server = http.createServer(app);
    server.listen(port, done);
  });

  it('should resolve an arXiv ID', async () => {
    const data = await resolve('arXiv:1910.00585', config);
    assert.deepEqual(data, {
      arXivId: 'arXiv:1910.00585',
      name: 'Non-algorithmic theory of randomness',
      datePosted: '2019-10-01T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'arXiv' }
    });
  });

  it('should resolve a crossref DOI', async () => {
    const data = await resolve('doi:10.1101/674655', config);
    assert.deepEqual(data, {
      doi: '10.1101/674655',
      name:
        'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
      datePosted: '2019-09-30T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' }
    });
  });

  it.only('should resove an openAIRE DOI', async () => {
    const data = await resolve('10.5281/zenodo.3356153', config);
    console.log(data);
  });

  after(done => {
    server.close(done);
  });
});
