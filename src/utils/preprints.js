import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { format } from 'date-fns';
import { getId, cleanup, arrayify, unprefix } from '../utils/jsonld';
import { createPreprintId } from '../utils/ids';

/**
 * Make embedded action (`RapidPREreviewAction` or
 * `RequestForRapidPREreviewAction`) as small as possible (remove all the
 * unecessary data)
 */
export function dehydrateAction(action) {
  return Object.keys(action).reduce((compacted, key) => {
    switch (key) {
      case 'agent':
        compacted[key] = getId(action[key]);
        break;

      case '_id':
      case '_rev':
      case 'object':
        break;

      case 'resultReview':
        compacted[key] = cleanup(
          Object.assign({}, action[key], {
            about: arrayify(action[key].about)
              .filter(about => about.name)
              .map(about => pick(about, ['name'])),
            reviewAnswer: arrayify(action[key].reviewAnswer).map(answer =>
              Object.assign({}, omit(answer, ['@type']), {
                parentItem: getId(answer.parentItem)
              })
            )
          }),
          { removeEmptyArray: true }
        );
        break;

      default:
        compacted[key] = action[key];
        break;
    }

    return compacted;
  }, {});
}

export function getPdfUrl(preprint = {}) {
  if (!preprint) return preprint;

  const encoding = arrayify(preprint.encoding).find(
    encoding =>
      encoding.contentUrl && encoding.encodingFormat === 'application/pdf'
  );

  return encoding && encoding.contentUrl;
}

export function getCanonicalUrl(preprint = {}) {
  if (!preprint) return preprint;

  if (preprint.url) {
    return preprint.url;
  } else if (preprint.doi) {
    return `https://doi.org/${unprefix(preprint.doi)}`;
  } else if (preprint.arXivId) {
    return `https://arxiv.org/abs/${unprefix(preprint.arXivId)}`;
  }
}

/**
 * Used to avoid converting date posted to user locale
 */
export function getFormattedDatePosted(isoString) {
  const [year, month, day] = isoString.substr(0, 10).split('-');
  return format(new Date(year, month - 1, day), 'MMM. d, yyyy');
}

/**
 * Used to convert a `preprint` obtained with the resolve API endpoint
 * into one that is stored in the index DB once the first `action` is
 * POSTed
 */
export function preprintify(preprint, action) {
  return Object.assign(
    {
      '@id': createPreprintId(preprint),
      potentialAction: [action]
    },
    preprint
  );
}
