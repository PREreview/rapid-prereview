import pickBy from 'lodash/pickBy';

export function getId(doc) {
  if (!doc) return doc;
  return typeof doc === 'string' || doc === 'number' ? doc : doc['@id'];
}

export function unprefix(uri = '') {
  return uri.replace(/^.*:/, '');
}

export function cleanup(doc, { removeEmptyArray = false } = {}) {
  return pickBy(doc, value => {
    let optsOk = true;
    if (removeEmptyArray) {
      if (Array.isArray(value) && value.length === 0) {
        optsOk = false;
      }
    }

    return value !== undefined && optsOk;
  });
}

export function arrayify(value) {
  if (value === undefined) return [];
  if (value) {
    value = value['@list'] || value['@set'] || value;
  }
  return Array.isArray(value) ? value : [value];
}

export function nodeify(value) {
  if (typeof value === 'string') {
    return { '@id': value };
  }
  return value;
}
