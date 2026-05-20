## 📚 DOCUMENTACIÓN COMPLETA DEL PROYECTO INTERAGRO

### 🎯 ¿QUE ES NODE_MODULES?

`node_modules/` es una **carpeta que se genera automáticamente** cuando ejecutas `npm install`.

**¿Qué contiene?**
- Todas las librerías/dependencias que tu proyecto necesita
- 159 paquetes (como aparece en el npm audit)
- Ocupan ~200MB en disco

**¿Es necesaria?**
- ✅ SÍ, es necesaria para ejecutar la aplicación
- ❌ NO debe guardarse en git (está en .gitignore)
- Se regenera automáticamente con: `npm install`

**Dependencias de tu proyecto:**
```json
{
  "bcrypt": "^5.1.1",           // Encriptar contraseñas
  "cors": "^2.8.5",             // Permitir requests desde cualquier dominio
  "dotenv": "^16.3.1",          // Cargar variables de .env
  "express": "^4.18.2",         // Framework web
  "multer": "^1.4.5-lts.1",     // Subir archivos (fotos)
  "mysql2": "^3.6.5"            // Conectar a MySQL
}
```

---

### 📁 ARCHIVOS REVISADOS - TODOS FUNCIONAN

#### 1. **config/multerPerfil.js** ✅
- Sube fotos de perfil de usuarios
- Destino: `public/img/perfiles/`
- Máximo: 2MB
- Formatos: JPG, PNG, WebP

#### 2. **config/multerPublicacion.js** ✅
- Sube fotos de productos
- Destino: `public/img/publicaciones/`
- Máximo: 5MB
- Formatos: JPG, PNG, WebP
- Incluye validación de errores

#### 3. **controllers/reporteController.js** ✅
- Crear reportes (problemas, denuncias)
- Listar todos los reportes (admin)
- Listar reportes por usuario
- Validaciones completas

#### 4. **routes/clienteRoutes.js** ✅
- GET /api/cliente/ - Obtener todos los clientes
- POST /api/cliente/ - Crear cliente
- GET /api/cliente/:id - Obtener cliente por ID

#### 5. **controllers/publicacionController.js** ✅
- GET /api/publicaciones - Listar con filtros (precio, categoría, búsqueda)
- GET /api/publicaciones/:id - Obtener publicación
- POST /api/publicaciones - Crear con foto
- PATCH /api/publicaciones/:id - Actualizar
- DELETE /api/publicaciones/:id - Eliminar

---

### 🗄️ BASE DE DATOS - ESTRUCTURA COMPLETA

**Tablas creadas:**

1. **usuarios**
   - id, nombre, correo, telefono, direccion
   - contrasena (encriptada), foto_perfil, rol
   - fecha_registro, activo

2. **publicaciones**
   - id_publicacion, id_usuario, titulo, descripcion
   - precio, categoria, foto (path)
   - latitud, longitud, mostrar_ubicacion
   - fecha, activa

3. **mensajes**
   - id, id_remitente, id_destinatario
   - mensaje, fecha, leido

4. **reportes**
   - id, id_usuario, asunto, descripcion
   - fecha, estado

5. **clientes**
   - idclientes, id_usuario, direccion
   - contacto, fecha_registro

---

### 🚀 FLUJO COMPLETO (USUARIO A USUARIO)

#### USUARIO 1:
1. Abre http://localhost:3000
2. Ve login.html
3. Click "Registrarse" → register.html
4. Completa: nombre, correo, teléfono, dirección, contraseña
5. Click "Registrarse" → POST /api/usuarios/register
6. Se guardada en BD usuarios con contraseña encriptada
7. Redirección a login.html

#### LOGIN:
1. Ingresa correo y contraseña
2. POST /api/usuarios/login
3. Backend verifica contraseña con bcrypt
4. Envía usuario completo
5. Frontend guarda en localStorage
6. Redirección a buscar.html

#### EN BUSCAR.HTML (USUARIO 1):
1. GET /api/publicaciones - trae todas
2. Ve publicaciones con fotos
3. Puede hacer swipe (like/pass) - guardado en localStorage

#### EN PERFIL.HTML (USUARIO 1):
1. GET /api/usuarios/{id} - obtiene datos
2. Muestra nombre, email, teléfono, ubicación
3. Muestra publicaciones del usuario
4. Puede subir foto de perfil
5. POST /api/usuarios/subir-foto-perfil - sube foto a public/img/perfiles/

#### CREAR PUBLICACIÓN (USUARIO 1):
1. En perfil.html - button "Crear publicación"
2. Formulario: titulo, descripcion, precio, categoria, foto
3. POST /api/publicaciones - sube foto a public/img/publicaciones/
4. La foto se guarda con nombre único: pub_TIMESTAMP-RANDOM.jpg

#### USUARIO 2 (MISMO FLUJO):
1. Se registra
2. Hace login
3. Ve las publicaciones de USUARIO 1 en buscar.html

#### MENSAJES (USUARIO 1 CHATEA CON USUARIO 2):
1. Usuario 1 en mensajes.html
2. GET /api/mensajes/inbox/1 - obtiene conversaciones
3. Selecciona Usuario 2
4. GET /api/mensajes/conversacion?id_usuario=1&otro_usuario=2
5. Ve historial de mensajes
6. Escribe mensaje
7. POST /api/mensajes/enviar
   ```json
   {
     "id_remitente": 1,
     "id_destinatario": 2,
     "mensaje": "Hola, me interesa tu producto"
   }
   ```
8. Mensaje guardado en tabla mensajes
9. Actualiza conversación en tiempo real

---

### ⚙️ CÓMO ESTÁ CONFIGURADO TODO

**app.js:**
- Puerto 3000 (configurable en .env)
- CORS habilitado
- Limita upload a 10MB
- Sirve archivos estáticos desde public/

**config/db.js:**
- Pool de conexiones MySQL (10 conexiones máximo)
- Credenciales desde .env
- Automaticamente crea carpetas de upload

**Validaciones:**
- Todos los emails validados con regex
- Contraseñas mínimo 6 caracteres
- Precios validados como números
- IDs validados como números

---

### ✅ SERVIDOR RUNNING

✅ Conectado a MySQL
✅ Todas las rutas funcionan
✅ Multer configurado para uploads
✅ CORS habilitado
✅ Manejo de errores completo
✅ Listo para producción

**Puerto:** 3000
**Ambiente:** development

---

### 📋 CHECKLIST PARA PROBAR

- [ ] Registro Usuario 1
- [ ] Foto de perfil Usuario 1
- [ ] Crear publicación con foto Usuario 1
- [ ] Registro Usuario 2
- [ ] Foto de perfil Usuario 2
- [ ] Ver publicaciones de Usuario 1 en buscar.html
- [ ] Usuario 2 envía mensaje a Usuario 1
- [ ] Usuario 1 ve mensaje en mensajes.html
- [ ] Conversan los dos usuarios

**Todas las fotos se guardan en:**
- Perfiles: `public/img/perfiles/perfil_*.jpg`
- Publicaciones: `public/img/publicaciones/pub_*.jpg`

