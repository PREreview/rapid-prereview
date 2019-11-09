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
    }
  }
};

export default ddoc;
