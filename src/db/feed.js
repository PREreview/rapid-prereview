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

    this.emit('start', this.seq);

    this.feed = this.db.docs.follow({ since, include_docs: true });
    this.feed.on('change', async change => {
      const { doc } = change;
      if (
        doc['@type'] === 'RequestForRapidPREreviewAction' ||
        doc['@type'] === 'RapidPREreviewAction'
      ) {
        let preprint;
        try {
          preprint = await this.db.syncIndex(doc, {
            triggeringSeq: change.seq
          });
        } catch (err) {
          err.seq = change.seq;
          err.source = 'syncIndex';
          this.emit('error', err);
        }
        this.seq = change.seq;
        this.emit('sync', this.seq, preprint);
      } else {
        this.seq = change.seq;
      }
    });
    this.feed.on('error', function(err) {
      err.source = 'follow';
      err.seq = this.seq;
      this.emit('error', err);
    });
    this.feed.follow();

    return since;
  }

  async resume() {
    const seq = await this.db.getLatestTriggeringSeq();

    return this.start({ since: seq });
  }

  stop() {
    if (!this.feed) return this.seq;

    this.feed.stop();
    this.feed = null;
    const seq = this.seq;
    this.seq = null;
    return seq;
  }
}
