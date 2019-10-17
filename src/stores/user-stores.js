import { EventEmitter } from 'events';
import LRU from 'lru-cache';
import { getId } from '../utils/jsonld';

// TODO use a store provider so that we can test more easily

class RoleStore extends EventEmitter {
  constructor({ max = 1000 } = {}) {
    super();
    this.cache = new LRU({ max });
  }

  has(roleId) {
    return this.cache.has(getId(roleId));
  }

  get(roleId) {
    return this.cache.get(getId(roleId));
  }

  peek(roleId) {
    return this.cache.peek(getId(roleId));
  }

  set(role, { emit = true, onlyIfNotExisting = false } = {}) {
    if (onlyIfNotExisting) {
      if (!this.has(role)) {
        this.set(role, { emit });
      }
    } else {
      if (emit) {
        this.emit('SET', role);
      }
      this.cache.set(getId(role), role);
    }
  }

  setFromAction(action) {
    switch (action['@type']) {
      case 'UpdateRoleAction': {
        const updatedRole = action.result.hasRole.find(
          role => getId(role) === getId(action.object)
        );
        if (updatedRole) {
          this.set(updatedRole);
        }
        break;
      }

      default:
        break;
    }
  }

  del(roleId, { emit = true } = {}) {
    if (emit) {
      this.emit('DEL', this.peek(getId(roleId)));
    }
    return this.cache.del(getId(roleId));
  }
}

export const roleStore = new RoleStore();
