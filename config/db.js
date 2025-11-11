const mysql = require('mysql2');

// Crear conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'interagro'
});

// Conectar
connection.connect((error) => {
  if (error) {
    console.error('Error de conexión:', error);
    return;
  }
  console.log('Conectado a MySQL');
});

module.exports = connection;