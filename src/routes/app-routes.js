import { Router } from 'express';
import getBundlePaths from '../utils/get-bundle-paths';

const router = new Router({ caseSensitive: true });

/**
 * `:p1` and `:p2` can be part of an identifer (e.g.DOI)
 * or `/about/:roleId` or `/settings/profile`
 */
router.get('/:p1?/:p2?', (req, res, next) => {
  getBundlePaths((err, bundles) => {
    if (err) return next(err);

    res.render('index', {
      bundles,
      ssr: false,
      initialState: {
        user: req.user
      }
    });
  });
});

export default router;
