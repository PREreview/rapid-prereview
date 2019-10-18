import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';

export function createPreprintQs(
  {
    // full text search
    text = null,
    // facets
    hasReviews = null,
    hasRequests = null,
    hasData = null,
    hasCode = null,
    subjects = null,
    // sort
    sort = `score`, // `new` or `date`
    bookmark = null
  } = {},
  uiQs = ''
) {
  if (bookmark) {
    return `?bookmark=${bookmark}`;
  }

  const ui = new URLSearchParams(uiQs);

  if (text !== null) {
    if (text) {
      ui.set('q', text);
    } else {
      ui.delete('q');
    }
  }

  // With and without reviews
  if (hasReviews !== null) {
    ui.set('reviews', hasReviews);
  }

  // With and without requests
  if (hasRequests !== null) {
    ui.set('requests', hasRequests);
  }

  // With data
  if (hasData !== null) {
    if (hasData) {
      ui.set('data', hasData);
    } else {
      ui.delete('data');
    }
  }

  // With code
  if (hasCode !== null) {
    if (hasCode) {
      ui.set('code', hasCode);
    } else {
      ui.delete('code');
    }
  }

  if (sort !== null) {
    if (sort === 'score') {
      ui.delete('sort');
    } else {
      ui.set('sort', sort);
    }
  }

  if (subjects !== null) {
    if (subjects.length) {
      ui.set('subject', subjects);
    } else {
      ui.delete('subject');
    }
  }

  const sui = ui.toString();

  return sui ? `?${sui}` : undefined;
}

export function apifyPreprintQs(uiQs = '') {
  const ui = new URLSearchParams(uiQs);

  if (ui.has('bookmark')) {
    return `?bookmark=${ui.get('bookmark')}`;
  }

  const api = new URLSearchParams();
  const anded = [];
  if (ui.has('q')) {
    const term = ui.get('q');
    const ored = [`name:${escapeLucene(term)}`];

    const doiMatched = term.match(doiRegex());
    if (doiMatched) {
      ored.push(...doiMatched.map(doi => `doi:"${doi}"`));
    }

    const arXivIds = identifiersArxiv.extract(term);
    if (arXivIds && arXivIds.length) {
      ored.push(...arXivIds.map(arXivId => `arXivId:"${arXivId}"`));
    }

    anded.push(ored.length == 1 ? ored[0] : `(${ored.join(' OR ')})`);
  }

  if (ui.has('reviews')) {
    anded.push(`hasReviews:${ui.get('reviews')}`);
  }
  if (ui.has('requests')) {
    anded.push(`hasRequests:${ui.get('requests')}`);
  }
  if (ui.has('data')) {
    anded.push(`hasData:${ui.get('data')}`);
  }
  if (ui.has('code')) {
    anded.push(`hasCode:${ui.get('code')}`);
  }
  if (ui.has('subject')) {
    const subjects = ui.get('subject').split(',');
    anded.push(`(${subjects.map(s => `subjectName:"${s}"`).join(' OR ')})`);
  }

  api.set('q', anded.length ? anded.join(' AND ') : '*:*');

  if (ui.has('sort')) {
    if (ui.get('sort') === 'new') {
      // dateFirstActivity
      api.set(
        'sort',
        JSON.stringify([
          '-dateFirstActivity<number>',
          '-score<number>',
          '-datePosted<number>'
        ])
      );
    } else {
      // datePosted
      api.set(
        'sort',
        JSON.stringify([
          '-datePosted<number>',
          '-score<number>',
          '-dateFirstActivity<number>'
        ])
      );
    }
  } else {
    // score
    api.set(
      'sort',
      JSON.stringify([
        '-score<number>',
        '-datePosted<number>',
        '-dateFirstActivity<number>'
      ])
    );
  }

  api.set('include_docs', true);
  api.set(
    'counts',
    JSON.stringify([
      'hasData',
      'hasCode',
      'hasReviews',
      'hasRequests',
      'subjectName'
    ])
  );

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

function escapeLucene(term) {
  return term.replace(/([+&|!(){}[\]^"~*?:\\\/-])/g, '\\$1');
}
