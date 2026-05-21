require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const clientesRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const mensajeController = require('./controllers/mensajeController');

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
app.use(express.static(path.join(__dirname, 'public/html')));

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

// ===== SOCKET.IO =====
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://tudominio.com']
      : ['*'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map();
const socketUserMap = new Map();

function getSocketId(userId) {
  return onlineUsers.get(Number(userId));
}

io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado', socket.id);

  socket.on('registerUser', (userId) => {
    const normalizedId = Number(userId);
    if (isNaN(normalizedId)) return;
    onlineUsers.set(normalizedId, socket.id);
    socketUserMap.set(socket.id, normalizedId);
    socket.emit('registered', { userId: normalizedId });
  });

  socket.on('sendMessage', async (payload, callback) => {
    try {
      const { id_remitente, id_destinatario, mensaje } = payload || {};
      if (!id_remitente || !id_destinatario || !mensaje?.trim()) {
        return callback?.({ success: false, error: 'Datos de mensaje incompletos' });
      }

      const savedMessage = await mensajeController.saveMessageData({
        id_remitente: Number(id_remitente),
        id_destinatario: Number(id_destinatario),
        mensaje: mensaje.trim()
      });

      callback?.({ success: true, message: savedMessage });

      const recipientSocketId = getSocketId(id_destinatario);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', savedMessage);
        socket.emit('messageDelivered', { messageId: savedMessage.id });
      }
    } catch (error) {
      console.error('❌ Error en socket sendMessage:', error);
      callback?.({ success: false, error: 'Error al enviar mensaje por socket' });
    }
  });

  socket.on('typing', ({ toUserId, isTyping }) => {
    const recipientSocketId = getSocketId(toUserId);
    const senderUserId = socketUserMap.get(socket.id);
    if (!recipientSocketId || !senderUserId) return;
    io.to(recipientSocketId).emit('userTyping', {
      fromUserId: senderUserId,
      isTyping: Boolean(isTyping)
    });
  });

  socket.on('markAsRead', async ({ conversationWith }) => {
    const userId = socketUserMap.get(socket.id);
    if (!userId || !conversationWith) return;
    try {
      const rowsUpdated = await mensajeController.markConversationAsRead(userId, Number(conversationWith));
      if (rowsUpdated > 0) {
        const senderSocketId = getSocketId(conversationWith);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', {
            readerId: userId,
            conversationWith: Number(conversationWith)
          });
        }
      }
    } catch (error) {
      console.error('❌ Error en socket markAsRead:', error);
    }
  });

  socket.on('disconnect', () => {
    const userId = socketUserMap.get(socket.id);
    socketUserMap.delete(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
    }
    console.log('⚡ Cliente desconectado', socket.id);
  });
});

// ===== INICIAR SERVIDOR =====
server.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});
