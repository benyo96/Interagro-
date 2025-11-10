const connection = require('../config/db');

// Obtener publicaciones
exports.getPublicaciones = (req, res) => {
  const query = `
    SELECT * FROM publicaciones
    ORDER BY fecha DESC
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error SQL:', err);
      return res.status(500).json({ error: 'Error al obtener publicaciones', detalles: err });
    }
    res.json(results);
  });
};

// Crear nueva publicación
exports.createPublicacion = async (req, res) => {
  try {
    console.log('=== Inicio de createPublicacion ===');
    console.log('Headers:', req.headers);
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file);

    if (!req.body.id_usuario) {
      console.error('Error: ID de usuario no proporcionado en el body');
      console.log('Body completo:', req.body);
      return res.status(400).json({
        error: 'ID de usuario requerido',
        detalles: 'No se proporcionó el ID de usuario'
      });
    }

    const { titulo, descripcion, categoria, latitud, longitud } = req.body;
    
    // Convertir id_usuario a número y validar
    const id_usuario = parseInt(req.body.id_usuario, 10);
    if (isNaN(id_usuario) || id_usuario <= 0) {
      return res.status(400).json({ 
        error: 'ID de usuario inválido',
        detalles: 'El ID de usuario debe ser un número válido mayor a 0'
      });
    }

    // Convertir precio a número y eliminar caracteres no numéricos
    const precio = parseFloat(req.body.precio.toString().replace(/[^\d.]/g, ''));
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ 
        error: 'Precio inválido',
        detalles: 'El precio debe ser un número válido mayor a 0'
      });
    }

    // Validar campos obligatorios
    if (!titulo || !precio || !categoria || !id_usuario) {
      console.log('Error: Campos faltantes');
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        camposFaltantes: {
          titulo: !titulo,
          precio: !precio,
          categoria: !categoria,
          id_usuario: !id_usuario
        }
      });
    }

    // Validar y procesar la imagen
    if (!req.file) {
      console.log('No se recibió archivo de imagen');
      console.log('Files recibidos:', req.files);
      console.log('Content-Type:', req.headers['content-type']);
      return res.status(400).json({
        error: 'Imagen requerida',
        detalles: 'Debe proporcionar una imagen para la publicación',
        debug: {
          files: req.files,
          contentType: req.headers['content-type']
        }
      });
    }

    // Procesar la imagen y generar la ruta
    const fotoPath = `/img/publicaciones/${req.file.filename}`;
    console.log('Foto procesada:', {
      path: fotoPath,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Log de validación de campos
    console.log('Campos validados:', {
      titulo,
      descripcion,
      precio,
      categoria,
      id_usuario,
      fotoPath,
      latitud,
      longitud
    });

    const query = `
      INSERT INTO publicaciones 
      (id_usuario, titulo, descripcion, precio, categoria, foto, latitud, longitud, mostrar_ubicacion, fecha) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const params = [
      id_usuario,
      titulo,
      descripcion || null,
      precio,
      categoria,
      fotoPath,
      latitud || null,
      longitud || null,
      req.body.mostrar_ubicacion === '1' ? 1 : 0
    ];

    console.log('Query SQL a ejecutar:', query);
    console.log('Valores a insertar:', params);

    const result = await new Promise((resolve, reject) => {
      connection.query(query, params, (err, result) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log('Publicación creada exitosamente:', result);
    return res.status(201).json({ 
      id: result.insertId,
      mensaje: 'Publicación creada exitosamente',
      publicacion: {
        id_publicacion: result.insertId,
        titulo,
        descripcion,
        precio,
        categoria,
        foto: fotoPath,
        mostrar_ubicacion: req.body.mostrar_ubicacion === '1'
      }
    });

  } catch (error) {
    console.error('Error en createPublicacion:', error);
    return res.status(500).json({
      error: 'Error al crear la publicación',
      detalles: error.message,
      codigo: error.code
    });
  }
};

// Obtener publicación por ID
exports.getPublicacionById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, u.nombre as nombre_usuario 
    FROM publicaciones p 
    JOIN usuarios u ON p.id_usuario = u.id 
    WHERE p.id_publicacion = ?
  `;
  
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la publicación' });
    if (results.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(results[0]);
  });
};
