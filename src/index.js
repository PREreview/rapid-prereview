import path from 'path';
import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth-routes';
import appRoutes from './routes/app-routes';
import apiRoutes from './routes/api-routes';
import addDb from './middlewares/add-db';
import { createPassport } from './utils/orcid';

export function rapid(config = {}) {
  const passport = createPassport(config);

  const app = express();
  app.locals.config = config;

  app.enable('case sensitive routing');
  app.set('views', path.join(path.dirname(__dirname), 'views'));
  app.set('view engine', 'ejs');

  app.use(
    session({
      name: 'rapid.sid',
      secret:
        config.sessionSecret || process.env.SESSION_SECRET || 'rapid-prereview',
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(addDb(config));
  app.use('/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use('/', appRoutes);

  return app;
}

export function assets(config = {}) {
  const app = express();
  app.use(express.static(path.join(path.dirname(__dirname), 'public')));

  return app;
}
