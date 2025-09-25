const express = require('express');
const router = express.Router();
const { clienteController } = require('../controllers');

router.get('/', clienteController.getAllClientes);
router.post('/', clienteController.createCliente);

module.exports = router;