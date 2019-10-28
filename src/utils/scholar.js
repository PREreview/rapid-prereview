import doiRegex from 'doi-regex';
import url from 'url';
import identifiersArxiv from 'identifiers-arxiv';
import { cleanup } from './jsonld';

/**
 * Note: this is also used from the web extension code
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
