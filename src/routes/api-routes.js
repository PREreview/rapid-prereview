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
router.get('/preprint/:preprintId', (req, res, next) => {
  next();
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
router.get('/review/:reviewId', (req, res, next) => {
  next();
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
router.get('/request/:requestId', (req, res, next) => {
  next();
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
router.get('/user/:userId', (req, res, next) => {
  next();
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
router.get('/role/:roleId', (req, res, next) => {
  next();
});

/**
 * Post and action (side effects)
 */
router.post('/action', (req, res, next) => {
  next();
});

export default router;
