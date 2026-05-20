/**
 * Script de prueba para verificar que el servidor inicia correctamente
 */
require('dotenv').config();
const http = require('http');
const app = require('./app.js');

// El servidor se inicia automáticamente al importar app.js
console.log('\n✅ Servidor iniciado correctamente');
console.log('📍 URL: http://localhost:' + (process.env.PORT || 3000));
console.log('🗄️ Base de datos: ' + process.env.DB_HOST);
console.log('📊 Database: ' + process.env.DB_NAME);
