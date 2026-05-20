/**
 * Script INTERACTIVO para crear la base de datos
 * Este script es más fácil de usar - pregunta por las credenciales
 */

const readline = require('readline');
const mysql = require('mysql2/promise');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const rawArgs = process.argv.slice(2);
function parseArg(name) {
  const prefix = `--${name}=`;
  const arg = rawArgs.find(value => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const DATABASE_SQL = `
CREATE DATABASE IF NOT EXISTS interagro;
USE interagro;

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

CREATE TABLE IF NOT EXISTS clientes (
  idclientes INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  contacto VARCHAR(20) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function setupDatabase() {
  try {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     SETUP DE BASE DE DATOS - INTERAGRO             ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');

    const envHost = process.env.DB_HOST || 'localhost';
    const envUser = process.env.DB_USER || 'root';
    const envPassword = process.env.DB_PASSWORD || '';
    const envPort = process.env.DB_PORT || 3306;

    const host = parseArg('host') || envHost || await question('📍 Host MySQL (default: localhost): ') || 'localhost';
    const user = parseArg('user') || envUser || await question('👤 Usuario (default: root): ') || 'root';
    const password = parseArg('password') || parseArg('pass') || envPassword || await question('🔐 Contraseña (vacío si no tiene): ');
    const port = parseArg('port') || envPort || await question('🔌 Puerto (default: 3306): ') || 3306;

    console.log('');
    console.log('🔄 Conectando a MySQL...');

    const connection = await mysql.createConnection({
      host,
      user,
      password: password || undefined,
      port: parseInt(port),
      multipleStatements: true
    });

    console.log('✅ Conectado exitosamente');
    console.log('📊 Creando base de datos y tablas...');

    await connection.query(DATABASE_SQL);

    console.log('✅ Base de datos creada correctamente');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('  ✓ usuarios');
    console.log('  ✓ publicaciones');
    console.log('  ✓ mensajes');
    console.log('  ✓ reportes');
    console.log('  ✓ clientes');
    console.log('');

    // Guardar credenciales en .env
    const dotenv = require('dotenv');
    const fs = require('fs');
    
    const envContent = `# Base de datos MySQL
DB_HOST=${host}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=interagro
DB_PORT=${port}

# MODO MOCK - Para testing SIN MySQL instalado
# Cambiar a false cuando tengas MySQL local disponible
MOCK_DB=false

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_key_change_this_in_production
`;

    fs.writeFileSync('.env', envContent);
    console.log('💾 Credenciales guardadas en .env');

    await connection.end();

    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  🎉 ¡SETUP COMPLETADO EXITOSAMENTE! 🎉            ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Próximo paso: npm start');
    console.log('');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Soluciones:');
    console.error('1. Verifica que MySQL esté corriendo');
    console.error('2. Verifica usuario y contraseña');
    console.error('3. Verifica el puerto de MySQL');
    console.error('');

    rl.close();
    process.exit(1);
  }
}

setupDatabase();
