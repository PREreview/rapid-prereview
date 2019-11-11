import { Router } from 'express';
import passport from 'passport';
import cors from 'cors';
import { getId, unprefix } from '../utils/jsonld';

const router = new Router({ caseSensitive: true });

// start authenticating with ORCID
router.get('/orcid', passport.authenticate('orcid'));

// finish authenticating with ORCID
router.get(
  '/orcid/callback',
  passport.authenticate('orcid'),
  async (req, res, next) => {
    let roles;
    try {
      roles = await req.db.getRoles(req.user.hasRole);
    } catch (err) {
      req.log.error(
        { err, user: req.user },
        'ORCID callback: Error getting roles'
      );
    }

    if (
      roles &&
      (!roles.every(
        role => role.name && role.name && role.name !== unprefix(getId(role))
      ) ||
        !roles.every(role => role.avatar && role.avatar.contentUrl))
    ) {
      res.redirect('/settings');
    } else {
      res.redirect('/');
    }
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy(err => {
    res.clearCookie('rapid.sid');
    res.redirect('/');
  });
});

/**
 * Used by the web-extension to get the user if the user is logged in
 */
router.get('/user', cors(), (req, res) => {
  res.json(req.user || null);
});

export default router;
