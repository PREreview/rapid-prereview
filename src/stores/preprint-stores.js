import { EventEmitter } from 'events';
import LRU from 'lru-cache';
import omit from 'lodash/omit';
import { createPreprintId } from '../utils/ids';
import { arrayify, getId } from '../utils/jsonld';

export class PreprintsWithActionsStore extends EventEmitter {
  constructor({ max = 100 } = {}) {
    super();
    this.cache = new LRU({ max });
  }

  has(preprintId) {
    try {
      preprintId = createPreprintId(preprintId);
    } catch (err) {
      return false;
    }
    return this.cache.has(preprintId);
  }

  get(preprintId, { actions = true } = {}) {
    try {
      preprintId = createPreprintId(preprintId);
    } catch (err) {
      return;
    }
    return this.cache.get(preprintId);
  }

  getActions(preprintId) {
    const preprint = this.get(preprintId);
    if (!preprint) return [];
    return arrayify(preprint.potentialAction);
  }

  peek(preprintId, { actions = true } = {}) {
    try {
      preprintId = createPreprintId(preprintId);
    } catch (err) {
      return;
    }
    const preprint = this.cache.peek(preprintId);
    if (preprint) {
      return actions ? preprint : omit(preprint, ['potentialAction']);
    }
  }

  set(preprint, { emit = true, onlyIfNotExisting = false } = {}) {
    if (onlyIfNotExisting) {
      if (!this.has(preprint)) {
        this.set(preprint, { emit });
      }
    } else {
      if (emit) {
        this.emit('SET', preprint);
      }
      try {
        this.cache.set(createPreprintId(preprint), preprint);
      } catch (err) {
        // noop
      }
    }
  }

  del(preprintId, { emit = true } = {}) {
    try {
      preprintId = createPreprintId(preprintId);
    } catch (err) {
      return;
    }
    if (emit) {
      this.emit('DEL', this.peek(preprintId));
    }
    return this.cache.del(preprintId);
  }

  upsertAction(action) {
    if (action['@type'] === 'ModerateRapidPREReviewAction') {
      action = action.result;
    }

    if (
      (action['@type'] === 'RapidPREreviewAction' ||
        action['@type'] === 'RequestForRapidPREreviewAction') &&
      getId(action.object)
    ) {
      const preprint = this.peek(createPreprintId(action.object));

      if (preprint) {
        const nextPreprint = Object.assign({}, preprint, {
          potentialAction: arrayify(preprint.potentialAction)
            .filter(_action => getId(_action) !== getId(action))
            .concat(action)
        });
        this.set(nextPreprint);
      }
    }
  }
}

export class PreprintsSearchResultsStore extends EventEmitter {
  constructor() {
    super();
    // only cache the last result
    this.cache = new LRU({ max: 1 });
  }

  has(search) {
    return this.cache.has(search);
  }

  get(search) {
    return this.cache.get(search);
  }

  set(search, payload) {
    this.emit('SET', search, payload);
    this.cache.set(search, payload);
  }

  reset() {
    this.cache.reset();
  }
}
