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

export const id2paths = filenames.reduce((map, filename) => {
  const id = filename
    .replace(/^arxiv-/, 'arXiv:')
    .replace(/^crossref-/, 'doi:')
    .replace(/^openaire-/, 'doi:')
    .replace(/\.xml$/, '')
    .replace(/\.json$/, '')
    .replace(/\.html$/, '')
    .replace(/-/g, '.')
    .replace(/_/g, '/');

  if (!(id in map)) {
    map[id] = [];
  }
  map[id].push(path.resolve(__dirname, '../fixtures/', filename));

  return map;
}, {});

// convenience exports
export const arXivId = 'arXiv:1910.00585';
export const errorDoesNotExistArXivId = 'arXiv:1910.06444';
export const crossrefDoi = 'doi:10.1101/674655';
export const openAireDoi = 'doi:10.5281/zenodo.3356153';

export function createPreprintServer(config) {
  const app = express();

  Object.keys(id2paths).forEach(id => {
    const filepaths = id2paths[id];
    const basename = path.basename(filepaths[0]);
    const [vendor] = basename.split('-');

    app.get(`/${vendor}/${unprefix(id)}`, (req, res, next) => {
      const filepathHtml = filepaths.find(filepath =>
        filepath.endsWith('.html')
      );
      const filepathOther = filepaths.find(
        filepath => !filepath.endsWith('.html')
      );

      if (req.accepts('html')) {
        res.sendFile(filepathHtml);
      } else {
        res.sendFile(filepathOther);
      }
    });
  });

  app.use(rapid(config));

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
  identifier, // doi:10.1101/791038 or arXiv:1910.00274
  root = path.resolve(__dirname, '../fixtures')
) {
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

export async function harvestHTML(
  identifier, // doi:10.1101/791038 or arXiv:1910.00274
  root = path.resolve(__dirname, '../fixtures')
) {
  if (identifier.startsWith('arXiv:')) {
    const r = await fetch(`https://arxiv.org/abs/${unprefix(identifier)}`);
    const text = await r.text();
    await writeFile(
      path.join(root, `arxiv-${unprefix(identifier).replace(/\./g, '-')}.html`),
      text,
      'utf8'
    );
  } else {
    const r = await fetch(`https://doi.org/${unprefix(identifier)}`);
    const text = await r.text();
    await writeFile(
      path.join(
        root,
        `${identifier.includes('zenodo') ? 'openaire' : 'crossref'}-${unprefix(
          identifier
        )
          .replace(/\./g, '-')
          .replace(/\//g, '_')}.html`
      ),
      text,
      'utf8'
    );
  }
}
