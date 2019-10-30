import { Router } from 'express';
import passport from 'passport';
import cors from 'cors';

const router = new Router({ caseSensitive: true });

// start authenticating with ORCID
router.get('/orcid', passport.authenticate('orcid'));

// finish authenticating with ORCID
router.get(
  '/orcid/callback',
  passport.authenticate('orcid', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

/**
 * Used by the web-extension to get the user if the user is logged in
 */
router.get('/user', cors(), (req, res) => {
  res.json(req.user || null);
});

export default router;
