/* global index, emit */

const ddoc = {
  _id: '_design/ddoc-docs',
  views: {
    actionsByPreprintId: {
      map: function(doc) {
        if (
          doc.object &&
          (doc['@type'] === 'RapidPREreviewAction' ||
            doc['@type'] === 'RequestForRapidPREreviewAction')
        ) {
          var preprintId = doc.object['@id'] || doc.object;
          if (typeof preprintId === 'string') {
            emit(preprintId, null);
          }
        }
      },
      reduce: '_count'
    }
  },
  indexes: {
    action: {
      index: function(doc) {
        index('name', doc.name);
      }
    }
  }
};

export default ddoc;
