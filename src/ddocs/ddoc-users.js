/* global emit */

const ddoc = {
  _id: '_design/ddoc-users',
  views: {
    usersByRoleId: {
      map: function(doc) {
        if (doc['@type'] === 'Person') {
          (doc.hasRole || []).forEach(function(role) {
            var roleId = role['@id'] || role;
            if (typeof roleId === 'string') {
              emit(roleId, null);
            }
          });
        }
      },
      reduce: '_count'
    },

    usersByContactPointVerificationToken: {
      map: function(doc) {
        if (
          doc['@type'] === 'Person' &&
          doc.contactPoint &&
          doc.contactPoint.token &&
          doc.contactPoint.token['@type'] === 'ContactPointVerificationToken' &&
          typeof doc.contactPoint.token.value === 'string'
        ) {
          emit(doc.contactPoint.token.value, null);
        }
      },
      reduce: '_count'
    },

    usersByApiKeyValue: {
      map: function(doc) {
        if (doc['@type'] === 'Person' && doc.apiKey) {
          var apiKey = doc.apiKey;
          if (typeof apiKey.value === 'string') {
            emit(apiKey.value, null);
          }
        }
      },
      reduce: '_count'
    },

    conflictingByType: {
      map: function(doc) {
        if (doc._conflicts) {
          if (typeof doc['@type'] === 'string') {
            emit(doc['@type'], [doc._rev].concat(doc._conflicts));
          }
        }
      },
      reduce: '_count'
    }
  },

  indexes: {
    index: function(doc) {
      return doc;
    }
  }
};

export default ddoc;
