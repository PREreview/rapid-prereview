import { Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';
import concatStream from 'concat-stream';
import omit from 'lodash/omit';
import { QUESTIONS } from '../constants';
import { createError } from '../utils/errors';
import parseQuery from '../middlewares/parse-query';
import { getId } from '../utils/jsonld';
import resolve from '../utils/resolve';
import { cache, invalidate } from '../middlewares/cache';
import parseApiKey from '../middlewares/parse-api-key';
import { createEmailMessages } from '../utils/email';
import { createContactPointId } from '../utils/ids';
import { omitPrivate } from '../utils/actions';

const jsonParser = bodyParser.json({ limit: '2mb' });

const router = new Router({ caseSensitive: true });

/**
 * Search for preprints with reviews or requests for reviews
 */
router.get(
  '/preprint',
  cors(),
  parseQuery,
  cache(req => req.query.key),
  (req, res, next) => {
    res.setHeader('content-type', 'application/json');

    let hasErrored = false;

    const s = req.db.streamPreprints(omit(req.query, ['key']));

    let statusCode;

    s.on('response', response => {
      statusCode = response.statusCode;
      res.status(statusCode);
    });
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

    s.pipe(
      concatStream(buffer => {
        if (statusCode === 200) {
          req.cache(JSON.parse(buffer));
        }
      })
    );

    s.pipe(res);
  }
);

/**
 * Get a preprint
 */
router.get(
  '/preprint/:preprintId',
  cors(),
  cache(req => `preprint:${req.params.preprintId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`preprint:${req.params.preprintId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get a review
 */
router.get(
  '/review/:reviewId',
  cache(req => `review:${req.params.reviewId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`review:${req.params.reviewId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get a request
 */
router.get(
  '/request/:requestId',
  cache(req => `request:${req.params.requestId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`request:${req.params.requestId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get a (public) user (without the anonymous roles)
 */
router.get(
  '/user/:userId',
  cache(req => `user:${req.params.userId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`user:${req.params.userId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get a role
 */
router.get(
  '/role/:roleId',
  cors(),
  cache(req => `role:${req.params.roleId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`role:${req.params.roleId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Search for roles
 */
router.get(
  '/role',
  cors(),
  parseQuery,
  cache(req => req.query.key),
  (req, res, next) => {
    res.setHeader('content-type', 'application/json');

    let hasErrored = false;

    const s = req.db.streamRoles(omit(req.query, ['key']));

    let statusCode;

    s.on('response', response => {
      statusCode = response.statusCode;
      res.status(statusCode);
    });
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

    s.pipe(
      concatStream(buffer => {
        if (statusCode === 200) {
          req.cache(JSON.parse(buffer));
        }
      })
    );

    s.pipe(res);
  }
);

// TODO? /avatar/:roleId
// Get the avatar associated with the `roleId`

/**
 * Post an action (side effects)
 */
router.post(
  '/action',
  cors(),
  jsonParser,
  parseApiKey,
  invalidate(),
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next(createError(401, 'Login required'));
    }

    if (
      req.authType === 'ApiKey' &&
      req.body &&
      req.body['@type'] !== 'RequestForRapidPREreviewAction'
    ) {
      return next(
        createError(
          403,
          'Only RequestForRapidPREreviewAction can be POSTed using an API key'
        )
      );
    }

    let body;

    try {
      body = await req.db.post(req.body, { user: req.user, sync: true });
    } catch (err) {
      return next(err);
    }

    req.invalidate(body);

    res.json(omitPrivate(body));

    // email
    const emailClient = req.app.get('emailClient');
    if (emailClient) {
      let messages;
      try {
        messages = await createEmailMessages({ db: req.db }, body);
      } catch (err) {
        req.log.error({ err }, 'error creating emails');
      }

      for (const message of messages) {
        try {
          await emailClient.send(message);
        } catch (err) {
          req.log.error({ err, message }, 'error sending email message');
        }
      }
    }
  }
);

/**
 * Used to handle the link present in the email sent to user when a user
 * update his/her contact info
 */
router.get('/verify', parseQuery, invalidate(), async (req, res, next) => {
  if (!req.query.token) {
    return next(createError(400, 'Missing querystring parameter token'));
  }

  let user;
  try {
    user = await req.db.getUserByContactPointVerificationToken(req.query.token);
  } catch (err) {
    if (err.statusCode === 404) {
      throw createError(400, 'invalid token');
    }
  }

  const action = {
    '@type': 'VerifyContactPointAction',
    agent: getId(user),
    actionStatus: 'CompletedActionStatus',
    object: createContactPointId(getId(user)),
    token: {
      '@type': 'ContactPointVerificationToken',
      value: req.query.token
    }
  };

  let body;

  try {
    body = await req.db.post(action, { user });
  } catch (err) {
    return next(err);
  }

  req.invalidate(body);

  res.redirect('/settings?verified=true');
});

/**
 * Search for actions
 */
router.get(
  '/action',
  cors(),
  parseQuery,
  cache(req => req.query.key),
  (req, res, next) => {
    res.setHeader('content-type', 'application/json');

    let hasErrored = false;

    const s = req.db.streamActions(omit(req.query, ['key']));
    s.on('response', response => {
      res.status(response.statusCode);
    });
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

    s.pipe(
      concatStream(buffer => {
        req.cache(JSON.parse(buffer));
      })
    );

    s.pipe(res);
  }
);

/**
 * Resolve (get metadata) for an identifier passed as query string paramenter
 * `identifier` (wrapped in `encodeURIComponent)
 */
router.get(
  '/resolve',
  cors(),
  cache(req => req.query.identifier),
  async (req, res, next) => {
    const { identifier } = req.query;
    if (!identifier) {
      return next(
        createError(400, 'missing identifier query string parameter')
      );
    }

    const { config } = req.app.locals;

    try {
      const data = await resolve(identifier, config);
      req.cache(data);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * On mobile <object /> doesn't work so we use react-pdf to render the PDF =>
 * due to cross origin restriction we need to proxy the PDF
 */
router.get('/pdf', async (req, res, next) => {
  const pdfUrl = req.query.url;
  if (!pdfUrl) {
    return next(createError(400, 'missing url query string parameter'));
  }

  let r;
  try {
    r = await fetch(pdfUrl, {
      method: 'GET'
    });
  } catch (err) {
    return next(err);
  }

  if (r.ok) {
    r.body.pipe(res);
  } else {
    next(createError(r.status));
  }
});

/**
 * Get a question by id
 */
router.get(
  '/question/:questionId',
  cors(),
  cache(req => `question:${req.params.questionId}`),
  async (req, res, next) => {
    try {
      const body = await req.db.get(`question:${req.params.questionId}`);
      req.cache(body);
      res.json(body);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * This is used for the API documentation to provide examples of the response
 * payloads
 */
router.get(
  '/demo',
  parseQuery,
  cache(req => req.query.key),
  async (req, res, next) => {
    switch (req.query.key) {
      case 'demo:get-review': {
        try {
          const body = await req.db.docs.view('ddoc-docs', 'byType', {
            key: 'RapidPREreviewAction',
            include_docs: true,
            limit: 1,
            reduce: false
          });
          const row = body.rows[0];
          if (!row) {
            return next(createError(404));
          }

          const payload = row.doc;
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:post-request':
      case 'demo:get-request': {
        try {
          const body = await req.db.docs.view('ddoc-docs', 'byType', {
            key: 'RequestForRapidPREreviewAction',
            include_docs: true,
            limit: 1,
            reduce: false
          });

          const row = body.rows[0];
          if (!row) {
            return next(createError(404));
          }

          const payload = row.doc;
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:get-user': {
        try {
          const body = await req.db.users.list({
            start_key: 'user:', // skip the ddocs
            include_docs: false,
            limit: 1,
            reduce: false
          });
          const row = body.rows[0];
          if (!row) {
            return next(createError(404));
          }
          const userId = row.id;
          const payload = await req.db.get(userId);
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:get-role': {
        try {
          const body = await req.db.docs.view('ddoc-docs', 'byType', {
            key: 'PublicReviewerRole',
            include_docs: true,
            limit: 1,
            reduce: false
          });

          const row = body.rows[0];
          if (!row) {
            return next(createError(404));
          }

          const payload = row.doc;
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:search-action': {
        try {
          const payload = await req.db.searchActions({
            limit: 2,
            include_docs: true,
            q: '*:*'
          });
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:search-role': {
        try {
          const payload = await req.db.searchRoles({
            limit: 2,
            include_docs: true,
            q: '*:*'
          });
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      case 'demo:get-question': {
        try {
          const payload = await req.db.get(
            `question:${QUESTIONS[0].identifier}`
          );
          req.cache(payload);
          res.json(payload);
        } catch (err) {
          return next(err);
        }
        break;
      }

      default:
        return next(createError(400, 'invalid key parameter'));
    }
  }
);

export default router;
