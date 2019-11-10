import { createError } from '../utils/errors';

/**
 * See https://console.bluemix.net/docs/services/Cloudant/api/search.html#query-parameters for the cloudant params
 */
export default function parseQuery(req, res, next) {
  try {
    req.query = Object.keys(req.query).reduce((query, key) => {
      const value = req.query[key];
      let parsed;

      switch (key) {
        // Boleans
        case 'include_docs':
        case 'descending':
          parsed = String(value) === 'true';
          break;

        // JSON
        case 'sort':
        case 'counts':
        case 'ranges':
        case 'drilldown':
        case 'include_fields':
        case 'hydrate':
        case 'ids':
          if (value) {
            try {
              parsed = JSON.parse(value);
            } catch (e) {
              throw createError(400, `invalid query string ${key} parameter`);
            }
          }
          break;

        case 'limit':
          parsed = parseInt(value, 10);
          break;

        default:
          parsed = value;
          break;
      }

      query[key] = parsed;

      return query;
    }, {});
  } catch (err) {
    return next(err);
  }

  next();
}
