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
    actions: {
      analyzer: {
        name: 'perfield',
        default: 'english',
        fields: {
          '@type': 'keyword',
          agentId: 'keyword'
        }
      },
      // This is used to display the activity feed of the profile page
      index: function(doc) {
        if (
          doc['@type'] === 'RapidPREreviewAction' ||
          doc['@type'] === 'RequestForRapidPREreviewAction'
        ) {
          index('@type', doc['@type'], { facet: true });

          var agentId = doc.agent['@id'] || doc.agent;
          if (typeof agentId === 'string') {
            index('agentId', agentId);
          }

          var startTime = doc.startTime
            ? new Date(doc.startTime).getTime()
            : new Date('0000').getTime();
          index('startTime', startTime, { facet: true });
        }
      }
    }
  }
};

export default ddoc;
