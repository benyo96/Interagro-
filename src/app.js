// -----------------------------
// 📦 Dependencias
// -----------------------------
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// -----------------------------
// 📂 Rutas
// -----------------------------
const clientesRoutes = require('../routes/clienteRoutes');
const usuarioRoutes = require('../routes/usuarioRoutes');
const mensajeRoutes = require('../routes/mensajeRoutes');
const publicacionRoutes = require('../routes/publicacionRoutes');
const reporteRoutes = require('../routes/reporteRoutes');

// -----------------------------
// 🚀 Inicialización del servidor Express
// -----------------------------
const app = express();

// -----------------------------
// 🧩 Middlewares
// -----------------------------
app.use(cors());
app.use(express.json()); // Parsear JSON en las requests
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Servir archivos estáticos desde /public
// ⚠️ Para Vercel: usar ruta absoluta desde src
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------
// 🖼️ Crear directorio para imágenes si no existe
// -----------------------------
const uploadDir = path.join(__dirname, '../public/img/publicaciones');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -----------------------------
// 🧭 Rutas principales de la API
// -----------------------------
app.use('/api/cliente', clientesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/reportes', reporteRoutes);

// -----------------------------
// 🏠 Ruta de inicio
// -----------------------------
app.get('/', (req, res) => {
  // ⚠️ Redirige correctamente a tu HTML en public/html
  res.sendFile(path.join(__dirname, '../public/html/loader.html'));
});

// -----------------------------
// ⚠️ Rutas no encontradas
// -----------------------------
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// -----------------------------
// 💡 Exportar app (no iniciar servidor aquí)
// -----------------------------
module.exports = app;
