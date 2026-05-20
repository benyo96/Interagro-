const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const uploadPublicacion = require('../config/multerPublicacion');

// ===== PUBLICACIONES =====
router.get('/', publicacionController.getPublicaciones);
router.get('/:id', publicacionController.getPublicacionById);
router.post('/', uploadPublicacion.single('foto'), publicacionController.createPublicacion);
router.patch('/:id', publicacionController.updatePublicacion);
// Eliminar una publicación
router.delete('/:id', publicacionController.deletePublicacion);

module.exports = router;
