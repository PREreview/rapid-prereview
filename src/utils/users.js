import { arrayify, getId } from '../utils/jsonld';

export function getDefaultRole(user = {}) {
  const roles = arrayify(user.hasRole);

  if (!user.defaultRole) {
    return roles[0];
  }

  return arrayify(user.hasRole).find(
    role => getId(role) === getId(user.defaultRole)
  );
}
