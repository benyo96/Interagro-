const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
// const connection = require('../config/db'); // comentar esta línea
const connection = require('../mocks/db'); // usar mock

// Crear un nuevo reporte
router.post('/', reporteController.createReporte);

// Obtener todos los reportes (opcional, para administración)
router.get('/', reporteController.getReportes);

// Endpoint temporal para pruebas de seguridad
router.get('/', (req, res) => {
  res.json({ message: "Prueba de seguridad OK" });
});
connection.query('SELECT * FROM usuarios', [], (err, results) => {
  if(err) return res.status(500).json({ error: 'Error de prueba' });
  res.json(results);
});

module.exports = router;
