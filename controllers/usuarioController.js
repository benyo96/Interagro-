const db = require('../config/db');
const bcrypt = require('bcrypt');

const usuarioController = {
  // Registro de usuario
  register: async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hash],
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

module.exports = usuarioController;
