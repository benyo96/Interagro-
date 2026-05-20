const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const upload = require('../config/multerPerfil');

// ===== AUTENTICACIÓN =====
router.post('/login', usuarioController.login);
router.post('/register', usuarioController.register);

// ===== PERFIL =====
router.get('/:id', usuarioController.getPerfil);
router.patch('/:id', usuarioController.updatePerfil);
router.post('/subir-foto-perfil', upload.single('foto_perfil'), usuarioController.subirFotoPerfil);

module.exports = router;