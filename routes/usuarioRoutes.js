
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const upload = require('../config/multerPerfil');
// const connection = require('../config/db'); // comentar esta línea
const connection = require('../mocks/db'); // usar mock

router.post('/login', usuarioController.login);
router.post('/register', usuarioController.register);

// Ruta para subir foto de perfil
router.post('/subir-foto-perfil', upload.single('foto_perfil'), usuarioController.subirFotoPerfil);

// Endpoint temporal para pruebas de seguridad
router.get('/', (req, res) => {
  res.json({ message: "Prueba de seguridad OK" });
});
connection.query('SELECT * FROM usuarios', [], (err, results) => {
  if(err) return res.status(500).json({ error: 'Error de prueba' });
  res.json(results);
});

module.exports = router;
