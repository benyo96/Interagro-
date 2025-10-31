const express = require('express');
const cors = require('cors');
const clientesRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en las requests
app.use(express.static('public')); // Servir archivos estáticos

// Routes
app.use('/api/cliente', clientesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/publicaciones', publicacionRoutes);

// Ruta de inicio profesional: redirige a /html/loader.html
app.get('/', (req, res) => {
  res.redirect('/html/loader.html');
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;