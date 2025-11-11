const db = require('../config/db');

// Crear un nuevo reporte
exports.createReporte = (req, res) => {
  const { id_usuario, asunto, descripcion } = req.body;
  if (!id_usuario || !asunto || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  db.query(
    'INSERT INTO reportes (id_usuario, asunto, descripcion) VALUES (?, ?, ?)',
    [id_usuario, asunto, descripcion],
    (err, result) => {
      if (err) {
        // Error de clave foránea: usuario no existe
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
          return res.status(400).json({ error: 'El usuario no existe en la base de datos.' });
        }
        return res.status(500).json({ error: 'Error al guardar el reporte', details: err });
      }
      res.status(201).json({ message: 'Reporte guardado', id: result.insertId });
    }
  );
};

// Obtener todos los reportes (opcional, para administración)
exports.getReportes = (req, res) => {
  db.query('SELECT * FROM reportes', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener reportes', details: err });
    res.json(rows);
  });
};
