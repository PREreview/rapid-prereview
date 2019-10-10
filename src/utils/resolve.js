import doiRegex from 'doi-regex';
import url from 'url';
import identifiersArxiv from 'identifiers-arxiv';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { JSDOM } from 'jsdom';
import { unprefix, cleanup, arrayify } from './jsonld';
import { createError } from './errors';

/**
 * Get metadata for `identifier`
 */
export default async function resolve(
  id, // DOI or arXiv id
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

  const isDoi = doiRegex().test(id);
  const isArxivId = !!identifiersArxiv.extract(id)[0];
  const data = {
    '@type': 'ScholarlyPreprint'
  };
  if (isDoi) {
    data.doi = id;
  } else if (isArxivId) {
    data.arXivId = id;
  }

  // `name` (title)
  // citation_title or DC.title
  // og:title
  const $title =
    head.querySelector('meta[name="citation_title"][content]') ||
    head.querySelector('meta[property="citation_title"][content]') ||
    head.querySelector('meta[name="DC.title"][content]') ||
    head.querySelector('meta[property="DC.title"][content]') ||
    head.querySelector('meta[name="og:title"][content]') ||
    head.querySelector('meta[property="og:title"][content]');
  if ($title) {
    data.name = $title.getAttribute('content');
  }

  // `datePosted` (date posted and made avaiable on the preprint server)
  // citation_publication_date or DC.issued,
  // citation_date citation_online_date
  // format is supposedely "2019/12/31" but it can have '-' and the month and
  // day can be 1 or 01 so we take a flexible approach

  const $datePosted =
    head.querySelector('meta[name="citation_publication_date"][content]') ||
    head.querySelector('meta[property="citation_publication_date"][content]') ||
    head.querySelector('meta[name="DC.issued"][content]') ||
    head.querySelector('meta[property="DC.issued"][content]') ||
    head.querySelector('meta[name="citation_date"][content]') ||
    head.querySelector('meta[property="citation_date"][content]') ||
    head.querySelector('meta[name="DC.date"][content]') ||
    head.querySelector('meta[property="DC.date"][content]') ||
    head.querySelector('meta[name="citation_online_date"][content]') ||
    head.querySelector('meta[property="citation_online_date"][content]');
  if ($datePosted) {
    const content = $datePosted.getAttribute('content');
    if (content) {
      let [y, m, d] = content.split(/\/|-/);
      if (y != null && m != null && d != null) {
        y = parseInt(y, 10);
        m = parseInt(m, 10);
        d = parseInt(d, 10);

        let stamp;
        try {
          stamp = Date.UTC(y, m - 1, d);
        } catch (err) {
          // noop
        }
        if (stamp != null) {
          data.datePosted = new Date(stamp).toISOString();
        }
      }
    }
  }

  // `preprintServer.name`
  // citation_journal_title or DC.relation.ispartof
  // og:site_name
  // or: citation_dissertation_institution, citation_technical_report_institution or DC.publisher
  if (isArxivId) {
    data.preprintServer = {
      '@type': 'PreprintServer',
      name: 'arXiv'
    };
  } else {
    const $preprintServerName =
      head.querySelector('meta[name="citation_journal_title"][content]') ||
      head.querySelector('meta[property="citation_journal_title"][content]') ||
      head.querySelector('meta[name="DC.relation.ispartof"][content]') ||
      head.querySelector('meta[property="DC.relation.ispartof"][content]') ||
      head.querySelector(
        'meta[name="citation_dissertation_institution"][content]'
      ) ||
      head.querySelector(
        'meta[property="citation_dissertation_institution"][content]'
      ) ||
      head.querySelector(
        'meta[name="citation_technical_report_institution"][content]'
      ) ||
      head.querySelector(
        'meta[property="citation_technical_report_institution"][content]'
      ) ||
      head.querySelector('meta[name="DC.publisher"][content]') ||
      head.querySelector('meta[property="DC.publisher"][content]') ||
      head.querySelector('meta[name="og:site_name"][content]') ||
      head.querySelector('meta[property="og:site_name"][content]');
    if ($preprintServerName) {
      const name = $preprintServerName.getAttribute('content');
      if (name) {
        data.preprintServer = { '@type': 'PreprintServer', name };
      }
    }
  }

  // `url`
  // og:url
  // <link rel="canonical" href="https://www.medrxiv.org/content/10.1101/19007971v1">
  // !! we make sure to only keep full HTTP or HTTPS URL (not relative ones)
  let urlFromLink, urlFromMeta;
  const $urlLink = head.querySelector('link[rel="canonical"]');
  if ($urlLink && $urlLink.href) {
    urlFromLink = $urlLink.href;
  }
  const $urlMeta =
    head.querySelector('meta[name="og:url"][content]') ||
    head.querySelector('meta[property="og:url"][content]');
  if ($urlMeta) {
    urlFromMeta = $urlMeta.getAttribute('content');
  }

  if (
    urlFromMeta &&
    (urlFromMeta.startsWith('http://') || urlFromMeta.startsWith('https://'))
  ) {
    data.url = urlFromMeta;
  } else if (
    urlFromLink &&
    (urlFromLink.startsWith('http://') || urlFromLink.startsWith('https://'))
  ) {
    data.url = urlFromLink;
  } else if (urlFromLink && r.url) {
    data.url = url.resolve(r.url, urlFromLink);
  }

  // `encoding.contentUrl` (link to PDF)
  // PDF link citation_pdf_url
  // <link rel="alternate" type="application/pdf" href="/content/10.1101/19007971v1.full.pdf">
  // !! we make sure to only keep full HTTP or HTTPS URL (not relative ones)
  let pdfUrl, pdfUrlFromLink, pdfUrlFromMeta;
  const $pdfLink = head.querySelector(
    'link[rel="alternate"][type="application/pdf"]'
  );
  if ($pdfLink && $pdfLink.href) {
    pdfUrlFromLink = $pdfLink.href;
  }

  const $pdfUrlMeta =
    head.querySelector('meta[name="citation_pdf_url"][content]') ||
    head.querySelector('meta[property="citation_pdf_url"][content]');
  if ($pdfUrlMeta) {
    pdfUrlFromMeta = $pdfUrlMeta.getAttribute('content');
  }

  if (
    pdfUrlFromMeta &&
    (pdfUrlFromMeta.startsWith('http://') ||
      pdfUrlFromMeta.startsWith('https://'))
  ) {
    pdfUrl = pdfUrlFromMeta;
  } else if (
    pdfUrlFromLink &&
    (pdfUrlFromLink.startsWith('http://') ||
      pdfUrlFromLink.startsWith('https://'))
  ) {
    pdfUrl = pdfUrlFromLink;
  } else if (pdfUrlFromLink && r.url) {
    pdfUrl = url.resolve(r.url, pdfUrlFromLink);
  }

  if (pdfUrl) {
    data.encoding = [
      {
        '@type': 'MediaObject',
        encodingFormat: 'application/pdf',
        contentUrl: pdfUrl
      }
    ];
  } else if (isArxivId) {
    data.encoding = [
      {
        '@type': 'MediaObject',
        encodingFormat: 'application/pdf',
        contentUrl: `https://arxiv.org/pdf/${id}`
      }
    ];
  }

  // we don't need those but they exists
  // `doi` or `arXivId`
  // citation_arxiv_id
  // citation_doi
  // DC.identifier

  return cleanup(data);
}
