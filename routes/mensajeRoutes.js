const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
// const connection = require('../config/db'); // comentar esta línea
const connection = require('../mocks/db'); // usar mock

// Inbox: lista de conversaciones
router.get('/inbox/:id_usuario', mensajeController.getInbox);
// Mensajes de una conversación
router.get('/conversacion', mensajeController.getMessages);
// Enviar mensaje
router.post('/enviar', mensajeController.sendMessage);
// Endpoint temporal para pruebas de seguridad
router.get('/', (req, res) => {
  res.json({ message: "Prueba de seguridad OK" });
});
connection.query('SELECT * FROM usuarios', [], (err, results) => {
  if(err) return res.status(500).json({ error: 'Error de prueba' });
  res.json(results);
});

module.exports = router;
