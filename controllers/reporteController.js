const db = require('../config/db');

// ===== POST: Crear un nuevo reporte =====
exports.createReporte = (req, res) => {
  try {
    const { id_usuario, asunto, descripcion } = req.body;

    // Validaciones
    if (!id_usuario || isNaN(id_usuario) || !asunto?.trim() || !descripcion?.trim()) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO reportes (id_usuario, asunto, descripcion, fecha) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
    db.query(query, [id_usuario, asunto.trim(), descripcion.trim()], (err, result) => {
      if (err) {
        console.error('❌ Error al crear reporte:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
          return res.status(400).json({ error: 'El usuario no existe' });
        }
        return res.status(500).json({ error: 'Error al guardar el reporte' });
      }
      res.status(201).json({ 
        mensaje: 'Reporte guardado',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('❌ Error en createReporte:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== GET: Obtener todos los reportes (admin) =====
exports.getReportes = (req, res) => {
  try {
    const query = `
      SELECT r.*, u.nombre as nombre_usuario, u.correo
      FROM reportes r
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      ORDER BY r.fecha DESC
    `;
    db.query(query, (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener reportes:', err);
        return res.status(500).json({ error: 'Error al obtener reportes' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error en getReportes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== GET: Obtener reportes de un usuario específico =====
exports.getReportesByUsuario = (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const query = 'SELECT * FROM reportes WHERE id_usuario = ? ORDER BY fecha DESC';
    db.query(query, [id_usuario], (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener reportes del usuario:', err);
        return res.status(500).json({ error: 'Error al obtener reportes' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error en getReportesByUsuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }};