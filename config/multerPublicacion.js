const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio si no existe
const uploadDir = path.join(__dirname, '../public/img/publicaciones');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pub_' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Validar tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP)'), false);
  }
};

// Configuración de límites
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB máximo
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware para manejar errores de Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Error de Multer:', err);
    return res.status(400).json({
      error: 'Error al subir el archivo',
      detalles: err.message
    });
  } else if (err) {
    console.error('❌ Error al subir archivo:', err);
    return res.status(400).json({
      error: 'Error al subir el archivo',
      detalles: err.message
    });
  }
  next();
};

module.exports = upload;
