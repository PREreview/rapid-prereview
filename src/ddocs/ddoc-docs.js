/* global index */

const ddoc = {
  _id: '_design/ddoc-index',
  indexes: {
    action: {
      index: function(doc) {
        index('name', doc.name);
      }
    }
  }
};

export default ddoc;
