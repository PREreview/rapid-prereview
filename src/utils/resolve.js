import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { JSDOM } from 'jsdom';
import { unprefix, cleanup, arrayify } from './jsonld';
import { createError } from './errors';
import { parseGoogleScholar, getIdentifierFromPdfUrl } from './scholar';

/**
 * Get metadata for `identifier`
 */
export default async function resolve(
  id, // DOI, arXiv id or URL (typically URL of a PDF)
  {
    baseUrlArxiv = 'http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:arXiv.org:',
    baseUrlCrossref = 'https://api.crossref.org/works/',
    baseUrlOpenAire = 'http://api.openaire.eu/search/publications?doi=',
    baseUrlArxivHtml = 'https://arxiv.org/abs/',
    baseUrlDoi = 'https://doi.org/'
  } = {},
  {
    strategy = 'all' // `htmlOnly`, `apiOnly`
  } = {}
) {
  id = getIdentifierFromPdfUrl(id) || id;

  const doiMatch = id.match(doiRegex());
  let doi;
  if (doiMatch) {
    doi = doiMatch[0];
  }
  const [arxivId] = identifiersArxiv.extract(id);

  let htmlData, apiData;
  if (doi) {
    if (strategy === 'all' || strategy === 'htmlOnly') {
      try {
        htmlData = await resolveFromHTML(`${baseUrlDoi}${doi}`, doi);
      } catch (err) {
        if (strategy === 'htmlOnly') {
          throw err;
        }
      }
      if (
        strategy === 'htmlOnly' ||
        (htmlData &&
          htmlData.name &&
          htmlData.datePosted &&
          htmlData.preprintServer) // early return as the API won't have more
      ) {
        return htmlData;
      }
    }

    if (strategy === 'all' || strategy === 'apiOnly') {
      // try crossref and openAIRE
      const results = await Promise.all([
        resolveCrossRefDoi(doi, baseUrlCrossref).catch(err => null),
        resolveOpenAireDoi(doi, baseUrlOpenAire).catch(err => null)
      ]);

      // keep the one with the most metadata
      apiData = results.filter(Boolean).sort((a, b) => {
        return Object.keys(b).length - Object.keys(a).length;
      })[0];
    }
  } else if (arxivId) {
    if (strategy === 'all' || strategy === 'htmlOnly') {
      try {
        htmlData = await resolveFromHTML(
          `${baseUrlArxivHtml}${unprefix(arxivId)}`,
          unprefix(arxivId)
        );
      } catch (err) {
        if (strategy === 'htmlOnly') {
          throw err;
        }
      }
      if (
        strategy === 'htmlOnly' ||
        (htmlData &&
          htmlData.name &&
          htmlData.datePosted &&
          htmlData.preprintServer) // early return as the API won't have more
      ) {
        return htmlData;
      }
    }

    if (strategy === 'all' || strategy === 'apiOnly') {
      try {
        apiData = resolveArxivId(id, baseUrlArxiv);
      } catch (err) {
        if (strategy === 'apiOnly') {
          throw err;
        }
      }
      if (strategy === 'apiOnly') {
        return apiData;
      }
    }
  } else {
    throw createError(400, `Invalid identifier ${id}`);
  }

  const collected = [htmlData, apiData].filter(Boolean);
  if (!collected.length) {
    throw createError(404);
  }

  // return the one with the most metadata
  return collected.sort((a, b) => {
    return Object.keys(b).length - Object.keys(a).length;
  })[0];
}

async function resolveArxivId(
  id, // arXiv:1910.00585
  baseUrl
) {
  id = unprefix(id).trim();

  const r = await fetch(`${baseUrl}${id}`, {
    headers: {
      Accept: 'application/xml, text/xml'
    }
  });
  if (!r.ok) {
    throw createError(r.status);
  }
  const text = await r.text();

  const doc = new DOMParser().parseFromString(text);

  const $error = doc.getElementsByTagName('error')[0];
  if ($error) {
    const code = $error.getAttribute('code');
    if (code === 'idDoesNotExist') {
      throw createError(404, $error.textContent);
    }
  }

  const data = {
    '@type': 'ScholarlyPreprint',
    arXivId: id,
    preprintServer: {
      '@type': 'PreprintServer',
      name: 'arXiv'
    }
  };
  const $metadata = doc.getElementsByTagName('metadata')[0];
  if ($metadata) {
    const $title = $metadata.getElementsByTagName('dc:title')[0];
    if ($title) {
      data.name = $title.textContent.trim();
    }

    const $date = $metadata.getElementsByTagName('dc:date')[0];
    if ($date) {
      data.datePosted = new Date($date.textContent.trim()).toISOString();
    }
  }

  return cleanup(data);
}

async function resolveCrossRefDoi(
  id, // 10.1101/674655
  baseUrl
) {
  id = unprefix(id).trim();
  const r = await fetch(`${baseUrl}${id}`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!r.ok) {
    throw createError(r.status);
  }
  const body = await r.json();
  const data = { '@type': 'ScholarlyPreprint', doi: id };
  const { message } = body;
  const title = arrayify(message.title)[0];
  if (title) {
    data.name = title.trim();
  }

  const date = message.accepted || message.posted;
  if (date) {
    if (date['date-time']) {
      data.datePosted = new Date(date['date-time']).toISOString();
    } else if (date.timestamp) {
      data.datePosted = new Date(date.timestamp).toISOString();
    } else if (date['date-parts']) {
      const [
        [
          year,
          month = 1,
          day = 1,
          hours = 0,
          minutes = 0,
          seconds = 0,
          milliseconds = 0
        ]
      ] = date['date-parts'];
      data.datePosted = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds)
      ).toISOString();
    }
  }

  if (message.institution && message.institution.name) {
    data.preprintServer = {
      '@type': 'PreprintServer',
      name: message.institution.name.trim()
    };
  }

  return data;
}

async function resolveOpenAireDoi(
  id, // 10.5281/zenodo.3356153
  baseUrl
) {
  const r = await fetch(`${baseUrl}${id}`, {
    headers: {
      Accept: 'application/xml, text/xml'
    }
  });
  if (!r.ok) {
    throw createError(r.status);
  }

  const text = await r.text();
  const doc = new DOMParser().parseFromString(text);

  const data = { '@type': 'ScholarlyPreprint', doi: id };

  const $metadata = doc.getElementsByTagName('metadata')[0];
  if ($metadata) {
    const $title = $metadata.getElementsByTagName('title')[0];
    if ($title) {
      data.name = $title.textContent.trim();
    }

    const $date = $metadata.getElementsByTagName('dateofacceptance')[0];
    if ($date) {
      data.datePosted = new Date($date.textContent.trim()).toISOString();
    }

    for (const localName of ['hostedby', 'collectedfrom']) {
      const $el = $metadata.getElementsByTagName(localName)[0];
      if ($el) {
        const name = $el.getAttribute('name');
        if (name) {
          data.preprintServer = {
            '@type': 'PreprintServer',
            name: name.trim()
          };
          break;
        }
      }
    }
  } else {
    throw createError(404);
  }

  return cleanup(data);
}

/**
 * Get metadata from the google scholar meta tag in the head of the HTML
 * See https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
 * we also fallback on some open graph properties and <link> tags
 */
async function resolveFromHTML(htmlUrl, id) {
  const r = await fetch(htmlUrl, {
    headers: {
      Accept: 'text/html, application/xhtml+xml'
    }
  });
  if (!r.ok) {
    throw createError(r.status);
  }

  const text = await r.text();

  const { document } = new JSDOM(text).window;
  const head = document.head;

  return parseGoogleScholar(head, { id, sourceUrl: r.url });
}
