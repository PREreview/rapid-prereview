import DB from '../db/db';

export default function addDb(config) {
  return function(req, res, next) {
    if (req.app.locals.db) {
      req.db = req.app.locals.db;
      next();
    } else {
      const db = new DB(config);
      req.app.locals.db = db;
      req.db = db;
      next();
    }
  };
}
