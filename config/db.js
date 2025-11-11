const mysql = require('mysql2');

// Crear conexión
const connection = mysql.createConnection({
  host: 'caboose.proxy.rlwy.net',
  user: 'root',
  password: 'onHfBuXBWVkQtphusGGFnQyQLWqCWumI',
  database: 'interagro',
  port: 52489
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