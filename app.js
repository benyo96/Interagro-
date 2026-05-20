require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const clientesRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com'] 
    : ['*'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));

// Permitir acceso directo a archivos HTML como /login.html
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (!page.endsWith('.html')) {
    return next();
  }
  const targetFile = path.join(__dirname, 'public/html', page);
  if (fs.existsSync(targetFile)) {
    return res.sendFile(targetFile);
  }
  next();
});

// ===== RUTAS API =====
app.use('/api/cliente', clientesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/reportes', reporteRoutes);

// ===== RUTAS PRINCIPALES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/loader.html'));
});

// Health check para monitoreo
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ===== MANEJO DE ERRORES =====
// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de error global
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});
