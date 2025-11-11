const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const clientesRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en las requests

app.use(express.static('public')); // Servir archivos estáticos

// Routes
app.use('/api/cliente', clientesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de inicio profesional: redirige a /html/loader.html
app.get('/', (req, res) => {
  res.redirect('/html/loader.html');
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado:', socket.id);

  // El usuario entra a su sala personal
  socket.on('joinChat', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Cuando un usuario envía un mensaje
  socket.on('enviarMensaje', (data) => {
    const { id_remitente, id_destinatario, mensaje } = data;
    // Emitir al receptor en tiempo real
    io.to(`user_${id_destinatario}`).emit('recibirMensaje', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});