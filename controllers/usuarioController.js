const db = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');

const usuarioController = {
  // Registro de usuario
  register: async (req, res) => {
    const { nombre, correo, telefono, direccion, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    db.query(
      'INSERT INTO usuarios (nombre, correo, telefono, direccion, contrasena) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, telefono, direccion, hash],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario registrado correctamente' });
      }
    );
  },

  // Login de usuario
  login: (req, res) => {
    const { correo, contrasena } = req.body;
    db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
        const usuario = results[0];
        const match = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
        res.json({ message: 'Login exitoso', usuario });
      }
    );
  }
};

// Subir foto de perfil
usuarioController.subirFotoPerfil = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  const usuarioId = req.body.usuarioId;
  const rutaFoto = `/img/perfiles/${req.file.filename}`;
  db.query(
    'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
    [rutaFoto, usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Foto de perfil actualizada', rutaFoto });
    }
  );
};

module.exports = usuarioController;
