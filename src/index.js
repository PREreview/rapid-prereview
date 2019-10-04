import path from 'path';
import express from 'express';
import appRoutes from './routes/app-routes';
import addDb from './middlewares/add-db';

export function rapid(config = {}) {
  const app = express();
  app.locals.config = config;
  app.enable('case sensitive routing');
  app.set('views', path.join(path.dirname(__dirname), 'views'));
  app.set('view engine', 'ejs');

  app.use(addDb(config));
  app.use('/', appRoutes);

  return app;
}

export function assets(config = {}) {
  const app = express();
  app.use(express.static(path.join(path.dirname(__dirname), 'public')));

  return app;
}
