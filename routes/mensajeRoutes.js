const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

// ===== MENSAJES =====
router.get('/inbox/:id_usuario', mensajeController.getInbox);
router.get('/conversacion', mensajeController.getMessages);
router.patch('/leer', mensajeController.markAsRead);
// Enviar mensaje
router.post('/enviar', mensajeController.sendMessage);
// Eliminar mensaje
router.delete('/:id', mensajeController.deleteMessage);

module.exports = router;
