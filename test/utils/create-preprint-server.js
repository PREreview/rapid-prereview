import http from 'http';
import path from 'path';
import express from 'express';
import { unprefix } from '../../src/utils/jsonld';
import { rapid } from '../../src/';

export const arXivId = 'arXiv:1910.00585';
export const crossrefDoi = 'doi:10.1101/674655';
export const openAireDoi = 'doi:10.5281/zenodo.3356153';

export function createPreprintServer(config) {
  const app = express();

  app.use(rapid(config));

  app.get(`/arxiv/${unprefix(arXivId)}`, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../fixtures/arxiv.xml'));
  });
  app.get(`/crossref/${unprefix(crossrefDoi)}`, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../fixtures/crossref.json'));
  });
  app.get(`/openaire/${unprefix(openAireDoi)}`, (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../fixtures/openaire.xml'));
  });

  return http.createServer(app);
}

export function createConfig(port) {
  return {
    baseUrlArxiv: `http://127.0.0.1:${port}/arxiv/`,
    baseUrlCrossref: `http://127.0.0.1:${port}/crossref/`,
    baseUrlOpenAire: `http://127.0.0.1:${port}/openaire/`
  };
}
