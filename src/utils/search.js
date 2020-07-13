import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';

export function createPreprintQs(
  {
    // full text search
    text,
    // facets
    hasReviews,
    nReviews,
    nRequests,
    hasRequests,
    hasData,
    hasCode,
    subjects,
    hasOthersRec,
    hasPeerRec,
    // sort
    sort // `score`, `new` or `date`
  } = {},
  uiQs = ''
) {
  const ui = new URLSearchParams(uiQs);

  if (text != null && text != '') {
    ui.set('q', text);
  } else {
    ui.delete('q');
  }

  // With and without reviews
  if (hasReviews != null) {
    ui.set('reviews', hasReviews);
  } else if (hasReviews === null) {
    ui.delete('reviews');
  }

  if (nReviews != null) {
    ui.set('minimumReviews', nReviews);
  } else if (nReviews === null) {
    ui.delete('minimumReviews');
  }

  if (nRequests != null) {
    ui.set('minimumRequests', nRequests);
  } else if (nRequests === null) {
    ui.delete('minimumRequests');
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

  // recommended for others
  if (hasOthersRec != null) {
    ui.set('others', hasOthersRec);
  } else if (hasOthersRec === null) {
    ui.delete('others');
  }
  
  // recommended for peer review
  if (hasPeerRec != null) {
    ui.set('peer', hasPeerRec);
  } else if (hasPeerRec === null) {
    ui.delete('peer');
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
  const drilldown = [];

  if (ui.has('q')) {
    const q = ui.get('q');
    const splt = q.split(/(\s+)/);

    const ored = [
      `name:${splt.length > 1 && escapeLucene(q) === q ? JSON.stringify(q) : q}` // we auto quote multiple terms if they do not contain lucene operators
    ];

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

  if (ui.has('minimumReviews')) {
    const nReviews = ui.get('minimumReviews');
    if (nReviews === 'false' && !ui.has('reviews')) {
      //drilldown.push(['nReviews', '[0 TO 1}']);
      anded.push(`hasReviews:false`);
    } else {
      //drilldown.push([
      //  'nReviews',
      //  `[${ui.get('minimumReviews')} TO Infinity]`
      //]);
      anded.push(`nReviews:[${ui.get('minimumReviews')} TO Infinity]`);
    }
  }

  if (ui.has('requests')) {
    anded.push(`hasRequests:${ui.get('requests')}`);
  }

  if (ui.has('minimumRequests')) {
    const nRequests = ui.get('minimumRequests');
    if (nRequests === 'false' && !ui.has('requests')) {
      //drilldown.push(['nRequests', '[0 TO 1}']);
      anded.push(`hasRequests:false`);
    } else {
      //drilldown.push([
      //  'nRequests',
      //  `[${ui.get('minimumRequests')} TO Infinity]`
      //]);
      anded.push(`nRequests:[${ui.get('minimumRequests')} TO Infinity]`);
    }
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

  if (drilldown.length) {
    api.set(
      'drilldown',
      JSON.stringify(drilldown.length === 1 ? drilldown[0] : drilldown)
    );
  }

  api.set('q', anded.length ? anded.join(' AND ') : '*:*');

  if (ui.has('sort')) {
    if (ui.get('sort') === 'new') {
      // dateLastActivity
      api.set(
        'sort',
        JSON.stringify([
          '-dateLastActivity<number>',
          '-score<number>',
          '-datePosted<number>'
        ])
      );
    } else if (ui.get('sort') === 'reviewed') {
      // dateLastReview
      api.set(
        'sort',
        JSON.stringify([
          '-dateLastReview<number>',
          '-score<number>',
          '-datePosted<number>'
        ])
      );
    } else if (ui.get('sort') === 'requested') {
      // dateLastReview
      api.set(
        'sort',
        JSON.stringify([
          '-dateLastRequest<number>',
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
          '-dateLastActivity<number>'
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
        '-dateLastActivity<number>'
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

  api.set(
    'ranges',
    JSON.stringify({
      nReviews: {
        '0': '[0 TO 1}',
        '1+': '[1 TO Infinity]',
        '2+': '[2 TO Infinity]',
        '3+': '[3 TO Infinity]',
        '4+': '[4 TO Infinity]',
        '5+': '[5 TO Infinity]'
      },
      nRequests: {
        '0': '[0 TO 1}',
        '1+': '[1 TO Infinity]',
        '2+': '[2 TO Infinity]',
        '3+': '[3 TO Infinity]',
        '4+': '[4 TO Infinity]',
        '5+': '[5 TO Infinity]'
      }
    })
  );

  api.set('limit', 10);

  // cache key
  if (api.get('q') === '*:*' && !bookmark && !api.has('drilldown')) {
    api.set('key', `home:${ui.get('sort') || 'score'}`);
  }

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

  // cache key
  if (!bookmark) {
    api.set('key', `activity:${roleId}`);
  }

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

export function createModerationQs({ bookmark }) {
  const api = new URLSearchParams();

  api.set('q', `@type:"RapidPREreviewAction" AND isReported:true`);

  if (bookmark) {
    api.set('bookmark', bookmark);
  } else {
    api.delete('bookmark');
  }

  api.set(
    'sort',
    JSON.stringify(['-dateLastReport<number>', '-startTime<number>'])
  );
  api.set('include_docs', true);
  api.set('limit', 10);

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

export function createModeratorQs({ bookmark }) {
  const api = new URLSearchParams();

  api.set('q', `isModerator:true`);

  if (bookmark) {
    api.set('bookmark', bookmark);
  } else {
    api.delete('bookmark');
  }

  api.set('sort', JSON.stringify(['-startDate<number>']));
  api.set('include_docs', true);
  api.set('limit', 10);

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

export function createBlockedRolesQs({ bookmark }) {
  const api = new URLSearchParams();

  api.set('q', `isModerated:true`);

  if (bookmark) {
    api.set('bookmark', bookmark);
  } else {
    api.delete('bookmark');
  }

  api.set('sort', JSON.stringify(['-moderationDate<number>']));
  api.set('include_docs', true);
  api.set('limit', 10);

  const sapi = api.toString();

  return sapi ? `?${sapi}` : undefined;
}

function escapeLucene(term) {
  return term.replace(/([+&|!(){}[\]^"~*?:\\\/-])/g, '\\$1');
}
