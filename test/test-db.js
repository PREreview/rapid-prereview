import assert from 'assert';
import DB from '../src/db/db';

describe('db', function() {
  this.timeout(40000);

  const db = new DB();

  it('should init', async () => {
    const resps = await db.init({ reset: true });
    assert.equal(resps.length, 3);
  });

  it('should push ddocs', async () => {
    const resps = await db.ddoc();
    assert.equal(resps.length, 3);
  });
});
