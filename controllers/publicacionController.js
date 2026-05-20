const connection = require('../config/db');

// ===== VALIDACIONES =====
const validatePublicacion = (data) => {
  const errors = [];
  if (!data.titulo?.trim()) errors.push('Título requerido');
  if (!data.precio || isNaN(data.precio) || data.precio <= 0) errors.push('Precio inválido');
  if (!data.categoria?.trim()) errors.push('Categoría requerida');
  if (!data.id_usuario || isNaN(data.id_usuario) || data.id_usuario <= 0) errors.push('Usuario inválido');
  return errors;
};

// ===== GET: Obtener publicaciones con búsqueda y filtros =====
exports.getPublicaciones = (req, res) => {
  try {
    const q = req.query.q?.trim() || '';
    const categories = req.query.categories?.split(',').map(c => c.trim()).filter(Boolean) || [];
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const usuario = req.query.usuario ? parseInt(req.query.usuario, 10) : null;
    const sort = req.query.sort || 'Más recientes';

    let sql = 'SELECT * FROM publicaciones WHERE 1=1';
    const params = [];

    if (usuario && !isNaN(usuario)) {
      sql += ' AND id_usuario = ?';
      params.push(usuario);
    }

    // Búsqueda por texto
    if (q) {
      sql += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like);
    }

    // Filtro por categorías
    if (categories.length) {
      const ph = categories.map(() => '?').join(',');
      sql += ` AND categoria IN (${ph})`;
      params.push(...categories);
    }

    // Filtro por rango de precios
    if (!isNaN(minPrice) && minPrice !== null) {
      sql += ' AND precio >= ?';
      params.push(minPrice);
    }
    if (!isNaN(maxPrice) && maxPrice !== null) {
      sql += ' AND precio <= ?';
      params.push(maxPrice);
    }

    // Ordenamiento
    switch (sort) {
      case 'Menor precio':
        sql += ' ORDER BY precio ASC';
        break;
      case 'Mayor precio':
        sql += ' ORDER BY precio DESC';
        break;
      case 'Más recientes':
      default:
        sql += ' ORDER BY fecha DESC';
    }

    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('❌ Error en getPublicaciones:', err);
        return res.status(500).json({ error: 'Error al obtener publicaciones' });
      }
      res.json(results || []);
    });
  } catch (error) {
    console.error('❌ Error en getPublicaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== POST: Crear nueva publicación =====
exports.createPublicacion = (req, res) => {
  try {
    const { id_usuario, titulo, descripcion, precio, categoria, latitud, longitud, mostrar_ubicacion } = req.body;

    // Validaciones
    const errors = validatePublicacion({ titulo, precio, categoria, id_usuario });
    if (errors.length) {
      return res.status(400).json({ error: 'Validación fallida', detalles: errors });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere una imagen para la publicación' });
    }

    const fotoPath = `/img/publicaciones/${req.file.filename}`;
    const query = `
      INSERT INTO publicaciones (id_usuario, titulo, descripcion, precio, categoria, foto, latitud, longitud, mostrar_ubicacion, fecha) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const params = [
      id_usuario,
      titulo.trim(),
      descripcion?.trim() || null,
      parseFloat(precio),
      categoria.trim(),
      fotoPath,
      latitud || null,
      longitud || null,
      mostrar_ubicacion === '1' ? 1 : 0
    ];

    connection.query(query, params, (err, result) => {
      if (err) {
        console.error('❌ Error al crear publicación:', err);
        return res.status(500).json({ error: 'Error al crear la publicación' });
      }
      res.status(201).json({ 
        id: result.insertId,
        mensaje: 'Publicación creada exitosamente'
      });
    });
  } catch (error) {
    console.error('❌ Error en createPublicacion:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== GET: Obtener publicación por ID =====
exports.getPublicacionById = (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const query = `
      SELECT p.*, u.nombre as nombre_usuario, u.correo, u.foto_perfil
      FROM publicaciones p 
      LEFT JOIN usuarios u ON p.id_usuario = u.id 
      WHERE p.id_publicacion = ?
    `;
    
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ Error al obtener publicación:', err);
        return res.status(500).json({ error: 'Error al obtener la publicación' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error('❌ Error en getPublicacionById:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== PATCH: Actualizar publicación =====
exports.updatePublicacion = (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, categoria } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Validar al menos un campo para actualizar
    if (!titulo && !descripcion && !precio && !categoria) {
      return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
    }

    let query = 'UPDATE publicaciones SET ';
    const params = [];
    const updates = [];

    if (titulo) {
      updates.push('titulo = ?');
      params.push(titulo.trim());
    }
    if (descripcion) {
      updates.push('descripcion = ?');
      params.push(descripcion.trim());
    }
    if (precio) {
      updates.push('precio = ?');
      params.push(parseFloat(precio));
    }
    if (categoria) {
      updates.push('categoria = ?');
      params.push(categoria.trim());
    }

    query += updates.join(', ') + ' WHERE id_publicacion = ?';
    params.push(id);

    connection.query(query, params, (err, result) => {
      if (err) {
        console.error('❌ Error al actualizar:', err);
        return res.status(500).json({ error: 'Error al actualizar la publicación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      res.json({ mensaje: 'Publicación actualizada' });
    });
  } catch (error) {
    console.error('❌ Error en updatePublicacion:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== DELETE: Eliminar publicación =====
exports.deletePublicacion = (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const query = 'DELETE FROM publicaciones WHERE id_publicacion = ?';
    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ Error al eliminar:', err);
        return res.status(500).json({ error: 'Error al eliminar la publicación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      res.json({ mensaje: 'Publicación eliminada' });
    });
  } catch (error) {
    console.error('❌ Error en deletePublicacion:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
