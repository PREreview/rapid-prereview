import DB from '../src/db/db';

(async function() {
  const db = new DB();

  try {
    const result = await db.getSecurity();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();
