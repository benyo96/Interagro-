// Configuración de multer para subir imágenes de publicaciones
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/publicaciones'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB máximo
  files: 1 // Solo un archivo a la vez
};

const uploadPublicacion = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
}).single('foto');

// Wrapper para manejar errores de Multer
module.exports = function(req, res, next) {
  uploadPublicacion(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Error de Multer
      console.error('Error de Multer:', err);
      return res.status(400).json({
        error: 'Error al subir el archivo',
        detalles: err.message,
        code: err.code
      });
    } else if (err) {
      // Otro tipo de error
      console.error('Error al subir archivo:', err);
      return res.status(400).json({
        error: 'Error al subir el archivo',
        detalles: err.message
      });
    }
    next();
  });
};
