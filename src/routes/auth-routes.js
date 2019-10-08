import { Router } from 'express';
import passport from 'passport';

const router = new Router({ caseSensitive: true });

// start authenticating with ORCID
router.get(
  '/orcid',
  passport.authenticate(
    'orcid',
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          successRedirect: '/auth/orcid/callback',
          failureRedirect: '/login?error=true'
        }
  )
);

// finish authenticating with ORCID
router.get(
  '/orcid/callback',
  passport.authenticate('orcid', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
  })
);

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

export default router;
