// mocks/db.js
module.exports = {
  query: (sql, params, callback) => {
    // Devuelve un resultado vacío para cualquier query
    callback(null, []);
  }
};
