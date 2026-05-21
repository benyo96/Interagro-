require('dotenv').config();
const mysql = require('mysql2');

// Configuración de la conexión real
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'interagro',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    console.log('Asegúrate de que la base de datos y credenciales en .env sean correctas.');
    process.exit(1);
  }
  console.log('✅ Conectado exitosamente a MySQL');
  connection.release();
});

module.exports = pool;
