import { EventEmitter } from 'events';
import LRU from 'lru-cache';
import { getId, arrayify } from '../utils/jsonld';

export class RoleStore extends EventEmitter {
  constructor({ max = 1000 } = {}) {
    super();
    this.setMaxListeners(max);
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

  getUserRoles(user) {
    if (user.hasRole.every(roleId => this.has(roleId))) {
      return user.hasRole.map(roleId => this.get(roleId));
    }
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
      case 'RegisterAction': {
        arrayify(action.resultRole).forEach(role => {
          this.set(role);
        });
        break;
      }

      case 'RevokeModeratorRoleAction':
      case 'GrantModeratorRoleAction':
      case 'ModerateRoleAction':
      case 'UnmoderateRoleAction':
      case 'DeanonymizeRoleAction':
      case 'UpdateRoleAction': {
        this.set(action.result);
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
