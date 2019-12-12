import { createError } from '../utils/errors';
import { getId } from '../utils/jsonld';

export default async function parseApiKey(req, res, next) {
  if (!req.headers.authorization || req.user) {
    return next();
  }

  const auth = Buffer.from(
    req.headers.authorization.split(' ')[1],
    'base64'
  ).toString();

  const [unprefixedRoleId, apiKeyValue] = auth.split(':');
  const roleId = `role:${unprefixedRoleId}`;

  let user;
  try {
    user = await req.db.getUserByApiKeyValue(apiKeyValue);
  } catch (err) {
    if (err.statusCode !== 404) {
      return next(err);
    }
  }

  if (!user) {
    return next(createError(403, 'Forbidden (no user)'));
  } else if (!user.hasRole.some(role => getId(role) === roleId)) {
    return next(createError(403, `Forbidden (could not find ${roleId})`));
  }

  // overwrite passport
  req.user = user;
  req.authType = 'ApiKey';
  req.isAuthenticated = () => {
    return true;
  };

  next();
}
