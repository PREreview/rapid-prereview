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
    preprintId = createPreprintId(preprintId);
    return this.cache.has(preprintId);
  }

  get(preprintId, { actions = true } = {}) {
    preprintId = createPreprintId(preprintId);
    return this.cache.get(preprintId);
  }

  getActions(preprintId) {
    const preprint = this.get(preprintId);
    if (!preprint) return [];
    return arrayify(preprint.potentialAction);
  }

  peek(preprintId, { actions = true } = {}) {
    preprintId = createPreprintId(preprintId);
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
      this.cache.set(createPreprintId(preprint), preprint);
    }
  }

  del(preprintId, { emit = true } = {}) {
    preprintId = createPreprintId(preprintId);
    if (emit) {
      this.emit('DEL', this.peek(preprintId));
    }
    return this.cache.del(preprintId);
  }

  upsertAction(action) {
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
