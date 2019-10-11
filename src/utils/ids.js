import slug from 'slug';
import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import { getId, unprefix } from '../utils/jsonld';
import { createError } from './errors';

export function createPreprintId(
  value // doi or arXiv (prefixed or not) or preprint
) {
  let id = getId(value);

  if (!id) {
    // value may be a preprint
    if (value) {
      id = value.doi || value.arXivId;
    }
    if (!id) {
      throw createError(500, `invalid identifier for create preprint id`);
    }
  }

  if (id.startsWith('preprint:')) {
    return id;
  }

  let vendor;
  if (id.startsWith('doi:')) {
    vendor = 'doi';
  } else if (id.startsWith('arXiv:')) {
    vendor = 'arxiv';
  } else if (doiRegex().test(id)) {
    vendor = 'doi';
  } else if (identifiersArxiv.extract(id)[0]) {
    vendor = 'arxiv';
  }

  if (!vendor) {
    throw createError(
      500,
      `invalid identifier for create preprint id (could not extract vendor)`
    );
  }

  return `preprint:${vendor}-${slug(unprefix(id).replace('/', '-'))}`;
}
