const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

router.get('/', controllers.getAllClientes);
router.post('/', controllers.createCliente);

module.exports = router;