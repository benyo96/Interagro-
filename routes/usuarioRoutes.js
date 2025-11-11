
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const upload = require('../config/multerPerfil');

router.post('/login', usuarioController.login);
router.post('/register', usuarioController.register);

// Ruta para subir foto de perfil
router.post('/subir-foto-perfil', upload.single('foto_perfil'), usuarioController.subirFotoPerfil);

module.exports = router;
