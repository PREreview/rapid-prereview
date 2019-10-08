import { Router } from 'express';
import { createError } from '../utils/errors';
import parseQuery from '../middlewares/parse-query';
import resolve from '../utils/resolve';

const router = new Router({ caseSensitive: true });

/**
 * Search for preprints with reviews or requests for reviews
 */
router.get('/preprint', parseQuery, (req, res, next) => {
  res.setHeader('content-type', 'application/json');

  let hasErrored = false;

  const s = req.db.streamPreprints(req.query);
  s.on('error', err => {
    if (!hasErrored) {
      hasErrored = true;
      next(err);
    }

    try {
      s.destroy();
    } catch (err) {
      // noop
    }
  });

  s.pipe(res);
});

/**
 * Get a preprint
 */
router.get('/preprint/:preprintId', async (req, res, next) => {
  try {
    const body = await req.db.get(`preprint:${req.params.preprintId}`);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * Search for reviews
 */
router.get('/review', parseQuery, (req, res, next) => {
  next(createError(500, 'Not implemented yet'));
});

/**
 * Get a review
 */
router.get('/review/:reviewId', async (req, res, next) => {
  try {
    const body = await req.db.get(`review:${req.params.reviewId}`);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * Search for requests
 */
router.get('/request', parseQuery, (req, res, next) => {
  next(createError(500, 'Not implemented yet'));
});

/**
 * Get a request
 */
router.get('/request/:requestId', async (req, res, next) => {
  try {
    const body = await req.db.get(`request:${req.params.requestId}`);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * Search for users
 */
router.get('/user', parseQuery, (req, res, next) => {
  next(createError(500, 'Not implemented yet'));
});

/**
 * Get a user
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const body = await req.db.get(`user:${req.params.userId}`);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * Search for roles
 */
router.get('/role', parseQuery, (req, res, next) => {
  next(createError(500, 'Not implemented yet'));
});

/**
 * Get a role
 */
router.get('/role/:roleId', async (req, res, next) => {
  try {
    const body = await req.db.get(`role:${req.params.roleId}`);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * Post an action (side effects)
 */
router.post('/action', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(createError(401, 'Login required'));
  }

  next(createError(500, 'Not implemented yet'));
});

/**
 * Resolve (get metadata) for an identifier passed as query string paramenter
 * `identifier` (wrapped in `encodeURIComponent)
 */
router.get('/resolve', async (req, res, next) => {
  const { identifier } = req.query;
  if (!identifier) {
    return next(createError(400, 'missing identifier query string parameter'));
  }

  const { config } = req.app.locals;

  try {
    const data = await resolve(identifier, config);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
