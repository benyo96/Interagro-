const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const uploadPublicacion = require('../config/multerPublicacion');
// const connection = require('../config/db'); // comentar esta línea
const connection = require('../mocks/db'); // usar mock

// Obtener todas las publicaciones
router.get('/', publicacionController.getPublicaciones);

// Obtener una publicación específica
router.get('/:id', publicacionController.getPublicacionById);

// Crear nueva publicación
router.post('/', uploadPublicacion, publicacionController.createPublicacion);

// Endpoint temporal para pruebas de seguridad
router.get('/', (req, res) => {
  res.json({ message: "Prueba de seguridad OK" });
});
connection.query('SELECT * FROM usuarios', [], (err, results) => {
  if(err) return res.status(500).json({ error: 'Error de prueba' });
  res.json(results);
});

module.exports = router;
