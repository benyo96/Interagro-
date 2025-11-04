const connection = require('../config/db');

// Obtener publicaciones
exports.getPublicaciones = (req, res) => {
  connection.query('SELECT * FROM publicaciones ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener publicaciones' });
    res.json(results);
  });
};

// Crear nueva publicación con imágenes
exports.createPublicacion = (req, res) => {
  const { nombre_productos, descripcion, precio, categoria, id_usuario } = req.body;
  if (!nombre_productos || !descripcion || !precio || !categoria || !id_usuario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  // Guardar rutas de imágenes
  let imagenes = [];
  if (req.files && req.files.length > 0) {
    imagenes = req.files.map(f => `/img/publicaciones/${f.filename}`);
  }
  connection.query(
    'INSERT INTO publicaciones (nombre_productos, descripcion, precio, categoria, id_usuario, imagenes, fecha) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [nombre_productos, descripcion, precio, categoria, id_usuario, JSON.stringify(imagenes)],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al guardar publicación' });
      res.json({ id: result.insertId, nombre_productos, descripcion, precio, categoria, id_usuario, imagenes, fecha: new Date() });
    }
  );
};
