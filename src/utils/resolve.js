import doiRegex from 'doi-regex';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { unprefix, cleanup, arrayify } from './jsonld';

// TODO https://europepmc.org/OaiService
// e.g http://europepmc.org/oai.cgi?verb=GetRecord&metadataPrefix=pmc&identifier=oai:europepmc.org:2654146

/**
 * Get metadata for `identifier`
 */
export default async function resolve(
  id, // DOI or arXiv id
  { baseUrlArxiv, baseUrlCrossref, baseUrlOpenAire } = {}
) {
  const doiMatch = id.match(doiRegex());
  let doi;
  if (doiMatch) {
    doi = doiMatch[0];
  }

  if (doi) {
    // try crossref and openAIRE
    //const crossrefData = await resolveCrossRefDoi(doi, baseUrlCrossref);
    //return crossrefData;

    const openAireData = await resolveOpenAireDoi(doi, baseUrlOpenAire);
    return openAireData;
  } else {
    // try arXiv
    return resolveArxivId(id, baseUrlArxiv);
  }
}

async function resolveArxivId(
  id, // arXiv:1910.00585
  baseUrl = 'http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:arXiv.org:'
) {
  id = unprefix(id).trim();

  const r = await fetch(`${baseUrl}${id}`);
  const text = await r.text();
  const doc = new DOMParser().parseFromString(text);

  const data = {
    arXivId: `arXiv:${id}`,
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
  baseUrl = 'https://api.crossref.org/works/'
) {
  id = unprefix(id).trim();
  const r = await fetch(`${baseUrl}${id}`);
  const body = await r.json();
  const data = { doi: id };
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
  baseUrl = 'http://api.openaire.eu/search/publications?doi='
) {
  const r = await fetch(`${baseUrl}${id}`);
  const text = await r.text();
  const doc = new DOMParser().parseFromString(text);

  console.log(text);
}
