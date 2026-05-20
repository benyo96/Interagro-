const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// ===== CLIENTES =====
router.get('/', clienteController.getAllClientes);
router.post('/', clienteController.createCliente);
router.get('/:id', clienteController.getClienteById);

module.exports = router;