/* global index, emit */

const ddoc = {
  _id: '_design/ddoc-index',
  views: {
    preprintsByIdentifier: {
      map: function(doc) {
        if (doc['@type'] === 'ScholarlyPreprint') {
          if (doc.doi) {
            emit(doc.doi, null);
          }
          if (doc.arXivId) {
            emit(doc.arXivId, null);
          }
        }
      },
      reduce: '_count'
    },
    preprintsByScoreAndDatePosted: {
      map: function(doc) {
        if (doc['@type'] === 'ScholarlyPreprint') {
          emit([doc.score, new Date(doc.datePosted).getTime()], null);
        }
      },
      reduce: '_count'
    }
  },
  indexes: {
    preprints: {
      index: function(doc) {
        index('name', doc.name);
      }
    }
  }
};

export default ddoc;
