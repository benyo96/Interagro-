-- ===== CREAR BASE DE DATOS =====
CREATE DATABASE IF NOT EXISTS interagro;
USE interagro;

-- ===== TABLA USUARIOS =====
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(255),
  contrasena VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'cliente',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  INDEX idx_correo (correo),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA PUBLICACIONES =====
CREATE TABLE IF NOT EXISTS publicaciones (
  id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  foto VARCHAR(255) NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  mostrar_ubicacion BOOLEAN DEFAULT FALSE,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  activa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario),
  INDEX idx_categoria (categoria),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA MENSAJES =====
CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_remitente INT NOT NULL,
  id_destinatario INT NOT NULL,
  mensaje TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_remitente) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_destinatario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_remitente (id_remitente),
  INDEX idx_destinatario (id_destinatario),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA REPORTES =====
CREATE TABLE IF NOT EXISTS reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'abierto',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA CLIENTES =====
CREATE TABLE IF NOT EXISTS clientes (
  idclientes INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  contacto VARCHAR(20) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
