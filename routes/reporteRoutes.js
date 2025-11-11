const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Crear un nuevo reporte
router.post('/', reporteController.createReporte);

// Obtener todos los reportes (opcional, para administración)
router.get('/', reporteController.getReportes);

module.exports = router;
