export default function parseApiKey(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }

  const value = Buffer.from(
    req.headers.authorization.split(' ')[1],
    'base64'
  ).toString();

  const [roleId, apiKey] = value.split(':');

  next();
}
