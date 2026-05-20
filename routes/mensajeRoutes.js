const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

// ===== MENSAJES =====
router.get('/inbox/:id_usuario', mensajeController.getInbox);
router.get('/conversacion', mensajeController.getMessages);
// Enviar mensaje
router.post('/enviar', mensajeController.sendMessage);

module.exports = router;
