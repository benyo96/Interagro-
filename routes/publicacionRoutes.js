const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const uploadPublicacion = require('../config/multerPublicacion');

router.get('/', publicacionController.getPublicaciones);
// Permitir múltiples imágenes
router.post('/', uploadPublicacion.array('imagenes', 10), publicacionController.createPublicacion);

module.exports = router;
