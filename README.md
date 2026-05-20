# 🌾 InterAgro - Plataforma de Venta de Productos Agrícolas

Aplicación web moderna para la compra y venta de productos agrícolas con funcionalidades de mensajería, publicaciones y reportes.

## 📋 Requisitos Previos

- Node.js v16 o superior
- MySQL 5.7 o superior  
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto
```bash
cd Interagro-
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=interagro
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Crear la base de datos
```bash
node setup-database.js
```
O importar manualmente:
```bash
mysql -u root -p interagro < config/db-init.sql
```

### 5. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Interagro-/
├── app.js                    # Punto de entrada
├── package.json              # Dependencias
├── .env                      # Variables de entorno
├── config/
│   ├── db.js                 # Configuración de MySQL
│   ├── multerPerfil.js       # Upload de perfiles
│   ├── multerPublicacion.js  # Upload de publicaciones
│   └── db-init.sql           # Estructura de BD
├── controllers/              # Lógica de negocio
│   ├── usuarioController.js
│   ├── publicacionController.js
│   ├── mensajeController.js
│   ├── reporteController.js
│   └── clienteController.js
├── routes/                   # Definición de endpoints
└── public/
    ├── html/                 # Páginas HTML
    ├── js/                   # Scripts del frontend
    ├── css/                  # Estilos
    └── img/                  # Imágenes
```

## 🔌 Endpoints API

### Usuarios
- `POST /api/usuarios/register` - Registrar nuevo usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios/:id` - Obtener perfil
- `POST /api/usuarios/subir-foto-perfil` - Actualizar foto de perfil

### Publicaciones
- `GET /api/publicaciones` - Listar todas las publicaciones
- `GET /api/publicaciones/:id` - Obtener publicación específica
- `POST /api/publicaciones` - Crear nueva publicación
- `PATCH /api/publicaciones/:id` - Actualizar publicación
- `DELETE /api/publicaciones/:id` - Eliminar publicación

### Mensajes
- `GET /api/mensajes/inbox/:id_usuario` - Obtener conversaciones
- `GET /api/mensajes/conversacion` - Obtener mensajes de conversación
- `POST /api/mensajes/enviar` - Enviar mensaje

### Reportes
- `POST /api/reportes` - Crear reporte
- `GET /api/reportes` - Listar todos los reportes
- `GET /api/reportes/usuario/:id_usuario` - Reportes de un usuario

## 🔒 Seguridad

- Credenciales de BD protegidas en `.env`
- Contraseñas encriptadas con bcrypt
- Validación de datos en todos los endpoints
- CORS configurado

## 🛠️ Mejoras Realizadas

✅ Migración de mysql a mysql2  
✅ Variables de entorno con dotenv  
✅ Manejo robusto de errores  
✅ Validaciones en todos los controllers  
✅ Código limpio y consistente  
✅ Documentación mejorada  

## 📝 Notas Importantes

- Las imágenes se guardan en `public/img/perfiles/` y `public/img/publicaciones/`
- Asegúrate de que estas carpetas existan o sean creadas automáticamente
- Para producción, cambiar `NODE_ENV` a `production`

## 📞 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.
Feel free to submit issues or pull requests for improvements or bug fixes.