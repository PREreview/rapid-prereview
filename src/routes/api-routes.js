import { Router } from 'express';

const router = new Router({ caseSensitive: true });

/**
 * Search for preprints with reviews or requests for reviews
 */
router.get('/preprint', (req, res, next) => {
  next();
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
router.get('/review', (req, res, next) => {
  next();
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
router.get('/request', (req, res, next) => {
  next();
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
router.get('/user', (req, res, next) => {
  next();
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
router.get('/role', (req, res, next) => {
  next();
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
  next();
});

export default router;
