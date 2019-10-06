import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { promisify } from 'util';
import fetch from 'node-fetch';
import { unprefix } from '../../src/utils/jsonld';
import { rapid } from '../../src/';

const writeFile = promisify(fs.writeFile);

const filenames = fs
  .readdirSync(path.resolve(__dirname, '../fixtures'))
  .filter(
    filename =>
      filename.startsWith('arxiv-') ||
      filename.startsWith('crossref-') ||
      filename.startsWith('openaire-')
  );

export const id2path = filenames.reduce((map, filename) => {
  const id = filename
    .replace(/^arxiv-/, 'arXiv:')
    .replace(/^crossref-/, 'doi:')
    .replace(/^openaire-/, 'doi:')
    .replace(/\.xml$/, '')
    .replace(/\.json$/, '')
    .replace(/-/g, '.')
    .replace(/_/g, '/');

  map[id] = path.resolve(__dirname, '../fixtures/', filename);
  return map;
}, {});

// convenience exports
export const arXivId = 'arXiv:1910.00585';
export const crossrefDoi = 'doi:10.1101/674655';
export const openAireDoi = 'doi:10.5281/zenodo.3356153';

export function createPreprintServer(config) {
  const app = express();

  app.use(rapid(config));

  Object.keys(id2path).forEach(id => {
    const filepath = id2path[id];
    const basename = path.basename(filepath);
    const [server] = basename.split('-');

    app.get(`/${server}/${unprefix(id)}`, (req, res, next) => {
      res.sendFile(filepath);
    });
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

/**
 * Used to populate the test/fixtures directory
 */
export async function harvest(
  identifier // doi:10.1101/791038 or arXiv:1910.00274
) {
  const root = path.resolve(__dirname, '../fixtures');

  if (identifier.startsWith('arXiv:')) {
    const r = await fetch(
      `http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:arXiv.org:${unprefix(
        identifier
      )}`
    );
    const text = await r.text();
    await writeFile(
      path.join(root, `arxiv-${unprefix(identifier).replace(/\./g, '-')}.xml`),
      text,
      'utf8'
    );
  } else if (identifier.includes('zenodo')) {
    const r = await fetch(
      `http://api.openaire.eu/search/publications?doi=${unprefix(identifier)}`
    );
    const text = await r.text();
    await writeFile(
      path.join(
        root,
        `openaire-${unprefix(identifier).replace(/\./g, '-')}.xml`
      ),
      text,
      'utf8'
    );
  } else {
    const r = await fetch(
      `https://api.crossref.org/works/${unprefix(identifier)}`
    );
    const text = await r.text();
    await writeFile(
      path.join(
        root,
        `crossref-${unprefix(identifier)
          .replace(/\./g, '-')
          .replace(/\//g, '_')}.json`
      ),
      text,
      'utf8'
    );
  }
}
