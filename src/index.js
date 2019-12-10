import path from 'path';
import LRU from 'lru-cache';
import { STATUS_CODES } from 'http';
import socketIo from 'socket.io';
import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import favicon from 'serve-favicon';
import pino from 'express-pino-logger';
import authRoutes from './routes/auth-routes';
import appRoutes from './routes/app-routes';
import apiRoutes from './routes/api-routes';
import addDb from './middlewares/add-db';
import { createPassport } from './utils/orcid';
import { createRedisClient } from './utils/redis';

export function rapid(config = {}, redisClient) {
  const RedisStore = connectRedis(session);

  const passport = createPassport(config);

  const app = express();
  app.locals.config = config;
  app.set('redisClient', redisClient || createRedisClient(config));

  app.enable('case sensitive routing');
  app.set('views', path.join(path.dirname(__dirname), 'views'));
  app.set('view engine', 'ejs');

  app.use(favicon(path.join(path.dirname(__dirname), 'public', 'favicon.ico')));

  app.use(
    session({
      name: 'rapid.sid',
      secret:
        config.sessionSecret || process.env.SESSION_SECRET || 'rapid-prereview',
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: app.get('redisClient'),
        prefix: 'sess:'
      })
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(addDb(config));

  app.use(
    pino(
      config.pino
        ? { logger: config.pino }
        : { level: config.logLevel || 'info' }
    )
  );

  app.use('/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use('/', appRoutes);

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const statusCode = err.statusCode || 500;
    res.status(err.statusCode || 500).json({
      '@type': 'Error',
      statusCode,
      name: STATUS_CODES[statusCode],
      description: err.message
    });
  });

  return app;
}

export function assets(config = {}) {
  const app = express();
  app.use(express.static(path.join(path.dirname(__dirname), 'public')));

  return app;
}

export function ws(config, server) {
  const io = socketIo(server);
  const cache = new LRU({ max: 100 });

  io.on('connection', socket => {
    socket.emit('locked', cache.values());
    const roleIds = new Set();

    socket.on('lock', ({ reviewActionId, roleId }, respond) => {
      roleIds.add(roleId);

      // unlock preview value owned by `roleId`
      cache.forEach((value, key, cache) => {
        if (
          value.reviewActionId !== reviewActionId &&
          value.roleId === roleId
        ) {
          cache.del(key);
        }
      });

      // lock new value
      const value = cache.get(reviewActionId);
      const isLocked = !!(value && value.roleId !== roleId);
      if (!isLocked) {
        cache.set(reviewActionId, { reviewActionId, roleId });
      }
      respond(isLocked);

      io.emit('locked', cache.values());
    });

    socket.on('unlock', ({ reviewActionId, roleId }) => {
      roleIds.add(roleId);
      const value = cache.get(reviewActionId);
      if (value && value.roleId === roleId) {
        cache.del(reviewActionId);
      }

      io.emit('locked', cache.values());
    });

    socket.on('exclude', ({ reviewActionId, roleId }) => {
      socket.broadcast.emit('excluded', reviewActionId);
    });

    socket.on('disconnect', function() {
      cache.forEach((value, key, cache) => {
        if (roleIds.has(value.roleId)) {
          cache.del(key);
        }
      });

      io.emit('locked', cache.values());
    });
  });
}
