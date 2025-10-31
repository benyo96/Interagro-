const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

// Inbox: lista de conversaciones
router.get('/inbox/:id_usuario', mensajeController.getInbox);
// Mensajes de una conversación
router.get('/conversacion', mensajeController.getMessages);
// Enviar mensaje
router.post('/enviar', mensajeController.sendMessage);

module.exports = router;
