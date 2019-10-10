import slug from 'slug';
import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import { getId, unprefix } from '../utils/jsonld';
import { createError } from './errors';

export function createPreprintId(
  identifier // doi or arXiv (prefixed or not)
) {
  identifier = getId(identifier);

  if (!identifier) {
    throw createError(500, `invalid identifier for create preprint id`);
  }

  if (identifier.startsWith('preprint:')) {
    return identifier;
  }

  let vendor;
  if (identifier.startsWith('doi:')) {
    vendor = 'doi';
  } else if (identifier.startsWith('arXiv:')) {
    vendor = 'arxiv';
  } else if (doiRegex().test(identifier)) {
    vendor = 'doi';
  } else if (identifiersArxiv.extract(identifier)[0]) {
    vendor = 'arxiv';
  }

  if (!vendor) {
    throw createError(
      500,
      `invalid identifier for create preprint id (could not extract vendor)`
    );
  }

  return `preprint:${vendor}-${slug(unprefix(identifier).replace('/', '-'))}`;
}
