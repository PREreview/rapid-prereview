import slug from 'slug';
import { getId, unprefix } from '../utils/jsonld';

export function createPreprintId(
  identifier // doi: or arXiv:
) {
  identifier = getId(identifier);
  return `preprint:${identifier.startsWith('arXiv:') ? 'arxiv' : 'doi'}-${slug(
    unprefix(identifier).replace('/', '-')
  )}`;
}
