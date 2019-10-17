import DB from '../src/db/db';

(async function() {
  const db = new DB();
  await db.init({ reset: false });
  await db.ddoc();
})();
