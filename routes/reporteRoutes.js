const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// ===== REPORTES =====
router.post('/', reporteController.createReporte);
router.get('/', reporteController.getReportes);
router.get('/usuario/:id_usuario', reporteController.getReportesByUsuario);

module.exports = router;
