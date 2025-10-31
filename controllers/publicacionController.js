const connection = require('../config/db');

// Obtener publicaciones
exports.getPublicaciones = (req, res) => {
  connection.query('SELECT * FROM publicaciones ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener publicaciones' });
    res.json(results);
  });
};

// Crear nueva publicación
exports.createPublicacion = (req, res) => {
  const { foto, descripcion } = req.body;
  if (!foto) return res.status(400).json({ error: 'Foto requerida' });
  connection.query('INSERT INTO publicaciones (foto, descripcion, fecha) VALUES (?, ?, NOW())', [foto, descripcion || ''], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar publicación' });
    res.json({ id: result.insertId, foto, descripcion, fecha: new Date() });
  });
};
