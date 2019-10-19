import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';

export function createPreprintQs(
  {
    // full text search
    text,
    // facets
    hasReviews,
    hasRequests,
    hasData,
    hasCode,
    subjects,
    // sort
    sort = `score`, // `new` or `date`
    bookmark
  } = {},
  uiQs = ''
) {
  const ui = new URLSearchParams(uiQs);

  if (text != null && text != '') {
    ui.set('q', text);
  } else if (text === null) {
    ui.delete('q');
  }

  // With and without reviews
  if (hasReviews != null) {
    ui.set('reviews', hasReviews);
  } else if (hasReviews === null) {
    ui.delete('reviews');
  }

  // With and without requests
  if (hasRequests != null) {
    ui.set('requests', hasRequests);
  } else if (hasRequests === null) {
    ui.delete('requests');
  }

  // With data
  if (hasData != null) {
    ui.set('data', hasData);
  } else if (hasData === null) {
    ui.delete('data');
  }

  // With code
  if (hasCode != null) {
    ui.set('code', hasCode);
  } else if (hasCode === null) {
    ui.delete('code');
  }

  if (sort === null || sort === 'score') {
    ui.delete('sort');
  } else if (sort != null) {
    ui.set('sort', sort);
  }

  if (subjects != null && subjects.length) {
    ui.set('subject', subjects);
  } else if (subjects === null || (subjects && !subjects.length)) {
    ui.delete('subject');
  }

  const sui = ui.toString();

  return sui ? `?${sui}` : undefined;
}

export function apifyPreprintQs(uiQs = '', bookmark) {
  const ui = new URLSearchParams(uiQs);

  const api = new URLSearchParams();

  if (bookmark) {
    api.set('bookmark', bookmark);
  }

  const anded = [];
  if (ui.has('q')) {
    const q = ui.get('q');
    const splt = q.split(/(\s+)/);
    let term;
    if (splt.length > 1) {
      term = JSON.stringify(q);
    } else {
      term = escapeLucene(q);
    }
    const ored = [`name:${term}`];

    const doiMatched = q.match(doiRegex());
    if (doiMatched) {
      ored.push(...doiMatched.map(doi => `doi:"${doi}"`));
    }

    const arXivIds = identifiersArxiv.extract(q);
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

    anded.push(
      subjects.length === 1
        ? `subjectName:"${subjects[0]}"`
        : `(${subjects.map(s => `subjectName:"${s}"`).join(' OR ')})`
    );
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

  api.set('limit', 10);

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

export function createActivityQs({ roleId, bookmark }) {
  const api = new URLSearchParams();

  if (roleId) {
    api.set('q', `agentId:"${roleId}"`);
  }
  if (bookmark) {
    api.set('bookmark', bookmark);
  } else {
    api.delete('bookmark');
  }

  api.set('sort', JSON.stringify(['-startTime<number>']));
  api.set('include_docs', true);
  api.set('counts', JSON.stringify(['@type']));
  api.set('limit', 10);

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

function escapeLucene(term) {
  return term.replace(/([+&|!(){}[\]^"~*?:\\\/-])/g, '\\$1');
}
