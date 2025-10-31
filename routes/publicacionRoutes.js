const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');

router.get('/', publicacionController.getPublicaciones);
router.post('/', publicacionController.createPublicacion);

module.exports = router;
