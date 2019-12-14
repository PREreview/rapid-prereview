import { getId, unprefix } from '../utils/jsonld';

export function checkIfRoleLacksMininmalData(role) {
  return (
    role &&
    (!role.name ||
      role.name === unprefix(getId(role)) ||
      !role.avatar ||
      !role.avatar.contentUrl)
  );
}
