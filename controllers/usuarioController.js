const db = require('../config/db');
const bcrypt = require('bcrypt');

const usuarioController = {
  // ===== POST: Registro de usuario =====
  register: async (req, res) => {
    try {
      const { nombre, correo, telefono, direccion, contrasena } = req.body;

      // Validaciones
      if (!nombre?.trim() || !correo?.trim() || !telefono?.trim() || !contrasena?.trim()) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      // Validar longitud de contraseña
      if (contrasena.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Verificar si el correo ya existe
      const checkQuery = 'SELECT id FROM usuarios WHERE correo = ?';
      db.query(checkQuery, [correo], async (err, results) => {
        if (err) {
          console.error('❌ Error al verificar email:', err);
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const hash = await bcrypt.hash(contrasena, 10);

        const insertQuery = 'INSERT INTO usuarios (nombre, correo, telefono, direccion, contrasena) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [nombre.trim(), correo.trim(), telefono.trim(), direccion?.trim() || null, hash], (err, results) => {
          if (err) {
            console.error('❌ Error al registrar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
          }
          res.status(201).json({ 
            mensaje: 'Usuario registrado correctamente',
            id: results.insertId
          });
        });
      });
    } catch (error) {
      console.error('❌ Error en register:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== POST: Login de usuario =====
  login: async (req, res) => {
    try {
      const { correo, contrasena } = req.body;

      if (!correo?.trim() || !contrasena?.trim()) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      db.query('SELECT * FROM usuarios WHERE correo = ?', [correo.trim()], async (err, results) => {
        if (err) {
          console.error('❌ Error en query de login:', err);
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];
        const match = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!match) {
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // No enviar contraseña al cliente
        delete usuario.contrasena;

        res.json({ 
          mensaje: 'Login exitoso',
          usuario
        });
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== POST: Subir foto de perfil =====
  subirFotoPerfil: (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
      }

      const usuarioId = req.body.usuarioId;
      if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
      }

      const rutaFoto = `/img/perfiles/${req.file.filename}`;
      const query = 'UPDATE usuarios SET foto_perfil = ? WHERE id = ?';

      db.query(query, [rutaFoto, usuarioId], (err, results) => {
        if (err) {
          console.error('❌ Error al subir foto:', err);
          return res.status(500).json({ error: 'Error al actualizar foto de perfil' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ 
          mensaje: 'Foto de perfil actualizada',
          rutaFoto
        });
      });
    } catch (error) {
      console.error('❌ Error en subirFotoPerfil:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== GET: Obtener perfil de usuario =====
  getPerfil: (req, res) => {
    try {
      const usuarioId = req.params.id;
      if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const query = 'SELECT id, nombre, correo, telefono, direccion, foto_perfil FROM usuarios WHERE id = ?';
      db.query(query, [usuarioId], (err, results) => {
        if (err) {
          console.error('❌ Error al obtener perfil:', err);
          return res.status(500).json({ error: 'Error al obtener perfil' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results[0]);
      });
    } catch (error) {
      console.error('❌ Error en getPerfil:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== PATCH: Actualizar biografía/perfil =====
  updatePerfil: (req, res) => {
    try {
      const usuarioId = req.params.id;
      const { bio } = req.body;

      if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (typeof bio !== 'string') {
        return res.status(400).json({ error: 'Contenido inválido' });
      }

      const query = 'UPDATE usuarios SET direccion = ? WHERE id = ?';
      db.query(query, [bio.trim() || null, usuarioId], (err, result) => {
        if (err) {
          console.error('❌ Error al actualizar perfil:', err);
          return res.status(500).json({ error: 'Error al actualizar perfil' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Perfil actualizado' });
      });
    } catch (error) {
      console.error('❌ Error en updatePerfil:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
};

module.exports = usuarioController;
