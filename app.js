// Dependencias principales
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Rutas
const clientesRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();

// -------------------------
// 🔒 Seguridad básica
// -------------------------
app.disable('x-powered-by'); // Oculta cabecera X-Powered-By
app.use(helmet()); // Configura headers de seguridad

// CORS: restringe a dominios conocidos (ajusta según tu dominio de Vercel)
const corsOptions = {
  origin: [
    'https://interagro.vercel.app', // dominio de producción
    'http://localhost:3000'         // para pruebas locales
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// -------------------------
// ⚙️ Middlewares
// -------------------------
app.use(express.json()); // Parsear JSON
app.use(express.static('public')); // Servir archivos estáticos

// -------------------------
// 📡 Rutas
// -------------------------
app.use('/api/cliente', clientesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de inicio: redirige al loader
app.get('/', (req, res) => {
  res.redirect('/html/loader.html');
});

// Manejo de rutas inexistentes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// -------------------------
// 🚀 Exportar app (para Vercel o tests)
// -------------------------
module.exports = app;
