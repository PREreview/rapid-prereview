import assert from 'assert';
import DB from '../src/db/db';

describe('resolve conflicts', function() {
  this.timeout(40000);

  const db = new DB();

  before(async () => {
    await db.init({ reset: true });
    await db.ddoc();
  });

  describe('resolveIndexConflicts', () => {
    it('should resolve conflicts in index DB', async () => {
      const resolved = await db.resolveIndexConflicts();
      assert.deepEqual(resolved, []);
    });
  });

  describe('resolveDocsConflicts', () => {
    it('should resolve conflicts in docs DB', async () => {
      const resolved = await db.resolveDocsConflicts();
      assert.deepEqual(resolved, []);
    });
  });

  describe('resolveUsersConflicts', () => {
    it('should resolve conflicts in users DB', async () => {
      const resolved = await db.resolveUsersConflicts();
      assert.deepEqual(resolved, []);
    });
  });
});
