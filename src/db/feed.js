import EventEmitter from 'events';
import { createError } from '../utils/errors';

export default class Feed extends EventEmitter {
  constructor(
    db // an instance of DB
  ) {
    super();

    this.feed = null;
    this.db = db;
    this.seq = null;
  }

  start({ since = 0 } = {}) {
    if (this.feed) {
      throw createError(400, 'feed is already started');
    }

    this.seq = since;

    this.feed = this.db.docs.follow({ since, include_docs: true });
    this.feed.on('change', async change => {
      this.seq = change.seq;
      const { doc } = change;
      if (
        doc['@type'] === 'RequestForRapidPREreviewAction' ||
        doc['@type'] === 'RapidPREreviewAction'
      ) {
        let preprint;
        try {
          preprint = await this.db.syncIndex(doc);
        } catch (err) {
          this.emit('error', err);
        }
        this.emit('sync', change.seq, preprint);
      }
    });
    this.feed.on('error', function(err) {
      throw err;
    });
    this.feed.follow();
  }

  stop() {
    if (!this.feed) return;

    this.feed.stop();
    this.feed = null;
    const seq = this.seq;
    this.seq = null;
    return seq;
  }
}
