import DB from '../src/db/db';

describe('db', function() {
  this.timeout(40000);

  it('should init', async () => {
    const db = new DB();
    await db.init({ reset: true });
    await db.ddoc();
  });
});
