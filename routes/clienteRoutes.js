const express = require('express');
const router = express.Router();
const controllers = require('../controllers');
// const connection = require('../config/db'); // comentar esta línea
const connection = require('../mocks/db'); // usar mock

// Endpoint temporal para pruebas de seguridad
router.get('/', (req, res) => {
  res.json({ message: "Prueba de seguridad OK" });
});
router.get('/', controllers.getAllClientes);
router.post('/', controllers.createCliente);
connection.query('SELECT * FROM usuarios', [], (err, results) => {
  if(err) return res.status(500).json({ error: 'Error de prueba' });
  res.json(results);
});

module.exports = router;