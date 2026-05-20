const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio si no existe
const uploadDir = path.join(__dirname, '../public/img/perfiles');
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
    cb(null, 'perfil_' + uniqueSuffix + path.extname(file.originalname));
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
  fileSize: 2 * 1024 * 1024 // 2MB máximo
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;
