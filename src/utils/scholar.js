import doiRegex from 'doi-regex';
import url from 'url';
import identifiersArxiv from 'identifiers-arxiv';
import { cleanup } from './jsonld';
import isUrl from 'is-url';
import { unversionDoi } from './ids';

/**
 * Note: this is also used from the web extension code
 * See https://www.google.com/intl/en/scholar/inclusion.html#indexing
 */
export function parseGoogleScholar(head, { id, sourceUrl } = {}) {
  if (id == null) {
    const $id =
      head.querySelector('meta[name="citation_arxiv_id"][content]') ||
      head.querySelector('meta[property="citation_arxiv_id"][content]') ||
      head.querySelector('meta[name="citation_doi"][content]') ||
      head.querySelector('meta[property="citation_doi"][content]') ||
      head.querySelector('meta[name="DC.identifier"][content]') ||
      head.querySelector('meta[property="DC.identifier"][content]');

    if ($id) {
      id = $id.getAttribute('content');
    }
  }

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
    head.querySelector('meta[property="og:title"][content]') ||
    head.querySelector('meta[name="DC.Title"][content]') ||
    head.querySelector('meta[property="DC.Title"][content]');
  if ($title) {
    data.name = $title.getAttribute('content');
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

  // `datePosted` (date posted and made avaiable on the preprint server)
  // citation_publication_date or DC.issued,
  // citation_date citation_online_date
  // format is supposedely "2019/12/31" but it can have '-' and the month and
  // day can be 1 or 01 so we take a flexible approach...

  let $datePosted;
  if (
    data.preprintServer &&
    data.preprintServer.name &&
    (data.preprintServer.name.toLowerCase().includes('biorxiv') ||
      data.preprintServer.name.toLowerCase().includes('medrxiv'))
  ) {
    // handle biorXiv and medrXiv (as of Dec. 2019 `citation_publication_date` is off in bioRxiv)
    $datePosted =
      head.querySelector('meta[name="DC.Date"][content]') ||
      head.querySelector('meta[property="DC.Date"][content]') ||
      head.querySelector('meta[name="article:published_time"][content]') ||
      head.querySelector('meta[property="article:published_time"][content]');
  }

  if (!$datePosted) {
    // "nornal" cases
    $datePosted =
      head.querySelector('meta[name="citation_publication_date"][content]') ||
      head.querySelector(
        'meta[property="citation_publication_date"][content]'
      ) ||
      head.querySelector('meta[name="DC.issued"][content]') ||
      head.querySelector('meta[property="DC.issued"][content]') ||
      head.querySelector('meta[name="citation_date"][content]') ||
      head.querySelector('meta[property="citation_date"][content]') ||
      head.querySelector('meta[name="DC.date"][content]') ||
      head.querySelector('meta[property="DC.date"][content]') ||
      head.querySelector('meta[name="citation_online_date"][content]') ||
      head.querySelector('meta[property="citation_online_date"][content]') ||
      head.querySelector('meta[name="DC.Date"][content]') ||
      head.querySelector('meta[property="DC.Date"][content]');
  }

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
  } else if (urlFromLink && sourceUrl) {
    data.url = url.resolve(sourceUrl, urlFromLink);
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
  } else if (pdfUrlFromLink && sourceUrl) {
    pdfUrl = url.resolve(sourceUrl, pdfUrlFromLink);
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

  return cleanup(data);
}

/**
 * This is brittle but is used to get an identifer from a PDF URL
 * This is also used in the web extension code so needs to run in the browser
 */
export function getIdentifierFromPdfUrl(value) {
  if (!isUrl(value)) {
    return null;
  }

  let identifier = null;

  const url = new URL(value);

  if (url.pathname.endsWith('.pdf')) {
    if (url.hostname.endsWith('arxiv.org')) {
      // arxiv.org: https://arxiv.org/abs/1912.02180 -> https://arxiv.org/pdf/1912.02180.pdf
      [identifier] = identifiersArxiv.extract(
        identifiersArxiv.extract(url.pathname.replace(/\.pdf$/, ''))
      );
    } else if (
      url.hostname.endsWith('biorxiv.org') ||
      url.hostname.endsWith('medrxiv.org')
    ) {
      // biorxiv.org: https://www.biorxiv.org/content/10.1101/867085v1 -> https://www.biorxiv.org/content/biorxiv/early/2019/12/06/867085.full.pdf
      // medrxiv.org: https://www.medrxiv.org/content/10.1101/19003087v1 -> https://www.medrxiv.org/content/medrxiv/early/2019/08/09/19003087.full.pdf
      const splt = url.pathname.replace(/\.full\.pdf$/, '').split('/');
      const suffix = splt[splt.length - 1];
      identifier = unversionDoi(`${10.1101}/${suffix}`);
    }
  }

  return identifier;
}
