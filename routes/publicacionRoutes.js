const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const uploadPublicacion = require('../config/multerPublicacion');

// Obtener todas las publicaciones
router.get('/', publicacionController.getPublicaciones);

// Obtener una publicación específica
router.get('/:id', publicacionController.getPublicacionById);

// Crear nueva publicación
router.post('/', uploadPublicacion, publicacionController.createPublicacion);

module.exports = router;
