import http from 'http';
import path from 'path';
import fs from 'fs';
import noop from 'lodash/noop';
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
    map[id] = {};
  }

  const format = path.extname(filename).substring(1);
  map[id][format] = path.resolve(__dirname, '../fixtures/', filename);

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
    const formats = id2paths[id];
    Object.keys(formats).forEach(format => {
      const filepath = formats[format];
      const basename = path.basename(filepath);
      const [vendor] = basename.split('-');

      let expressPath;
      if (format === 'html') {
        if (vendor === 'arxiv') {
          expressPath = `/arxivhtml/${unprefix(id)}`;
        } else {
          expressPath = `/doi/${unprefix(id)}`;
        }
      } else {
        expressPath = `/${vendor}/${unprefix(id)}`;
      }

      app.get(expressPath, (req, res, next) => {
        if (req.accepts(format)) {
          res.sendFile(filepath);
        } else {
          res.status(406).end();
        }
      });
    });
  });

  const rapidApp = rapid(config);
  app.use(rapidApp);

  const server = http.createServer(app);

  const close = server.close.bind(server);

  // patch close method to also close redis
  server.close = function(cb = noop) {
    close(() => {
      rapidApp.get('redisClient').quit(cb);
    });
  };

  return server;
}

export function createConfig(port, extra) {
  return Object.assign(
    {
      baseUrlDoi: `http://127.0.0.1:${port}/doi/`,
      baseUrlArxivHtml: `http://127.0.0.1:${port}/arxivhtml/`,
      baseUrlArxiv: `http://127.0.0.1:${port}/arxiv/`,
      baseUrlCrossref: `http://127.0.0.1:${port}/crossref/`,
      baseUrlOpenAire: `http://127.0.0.1:${port}/openaire/`
    },
    extra
  );
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
