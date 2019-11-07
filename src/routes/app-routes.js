import { Router } from 'express';
import getBundlePaths from '../utils/get-bundle-paths';

const router = new Router({ caseSensitive: true });

router.get('/*', (req, res, next) => {
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
