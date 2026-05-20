## 🧪 GUÍA PARA PROBAR EL SISTEMA COMPLETO

### 1️⃣ ESTADO ACTUAL
✅ Servidor running en http://localhost:3000
✅ MySQL conectado
✅ Base de datos: interagro
✅ Todas las carpetas creadas

### 2️⃣ ABRIR DOS NAVEGADORES

**Navegador 1 (Usuario 1):**
- http://localhost:3000

**Navegador 2 (Usuario 2):**
- http://localhost:3000 (incógnito o navegador diferente)

### 3️⃣ PASO A PASO

#### PASO 1: REGISTRO USUARIO 1
1. Navegador 1 → Registrarse
2. Datos:
   - Nombre: Juan Pérez
   - Correo: juan@gmail.com
   - Teléfono: 3001234567
   - Dirección: Calle 5 #123
   - Contraseña: password123
3. Click "Registrarse"
4. ✅ Debería redirigir a login.html

#### PASO 2: LOGIN USUARIO 1
1. Correo: juan@gmail.com
2. Contraseña: password123
3. Click "Iniciar Sesión"
4. ✅ Debería ir a buscar.html

#### PASO 3: FOTO DE PERFIL USUARIO 1
1. Click "Mi Perfil"
2. Click "Editar Perfil"
3. Selecciona una foto (.jpg o .png)
4. Click "Guardar"
5. ✅ La foto debe aparecer en la esquina
6. ✅ Se guarda en: public/img/perfiles/perfil_TIMESTAMP.jpg

#### PASO 4: CREAR PUBLICACIÓN USUARIO 1
1. En Mi Perfil, scroll hasta abajo
2. Debería haber un botón para crear publicación
3. Si no existe, agregar en perfil.html
4. Datos:
   - Título: Tomates Frescos
   - Descripción: Tomates de la mejor calidad
   - Precio: 5000
   - Categoría: Verduras
   - Foto: selecciona imagen
5. Click "Crear"
6. ✅ Se guarda en: public/img/publicaciones/pub_TIMESTAMP.jpg
7. ✅ La publicación aparece en su perfil

#### PASO 5: BUSCAR PUBLICACIONES USUARIO 1
1. Click "Buscar"
2. ✅ Debe ver su propia publicación
3. Puede hacer swipe o pasar (se guarda en localStorage)

#### PASO 6: REGISTRO USUARIO 2
1. Navegador 2 → Registrarse
2. Datos:
   - Nombre: María García
   - Correo: maria@gmail.com
   - Teléfono: 3109876543
   - Dirección: Carrera 10 #456
   - Contraseña: password456
3. Click "Registrarse"
4. ✅ Redirige a login

#### PASO 7: LOGIN USUARIO 2
1. Correo: maria@gmail.com
2. Contraseña: password456
3. ✅ Debería ir a buscar.html

#### PASO 8: USUARIO 2 VE PUBLICACIÓN DE USUARIO 1
1. En Buscar
2. ✅ Debe ver la publicación "Tomates Frescos"
3. Imagen debe cargarse correctamente
4. Precio: $5.000

#### PASO 9: USUARIO 2 ENVÍA MENSAJE A USUARIO 1
1. Click "Mensajes"
2. Debería ver una opción para enviar mensaje
3. O hacer click en una publicación para ver contacto
4. Enviar mensaje: "¡Hola! Me interesan los tomates"
5. POST /api/mensajes/enviar
   ```json
   {
     "id_remitente": 2,
     "id_destinatario": 1,
     "mensaje": "¡Hola! Me interesan los tomates"
   }
   ```
6. ✅ Mensaje guardado en tabla mensajes

#### PASO 10: USUARIO 1 RECIBE MENSAJE
1. Navegador 1 → Click "Mensajes"
2. GET /api/mensajes/inbox/1
3. ✅ Debe ver a María García en la lista
4. Click en María
5. GET /api/mensajes/conversacion?id_usuario=1&otro_usuario=2
6. ✅ Ve el mensaje: "¡Hola! Me interesan los tomates"

#### PASO 11: USUARIO 1 RESPONDE
1. Escribe: "Claro, tengo más disponibles"
2. Click enviar
3. ✅ POST /api/mensajes/enviar
4. ✅ Mensaje guardado

#### PASO 12: USUARIO 2 VE RESPUESTA
1. Navegador 2 → Mensajes
2. Click en Juan
3. ✅ Ve el nuevo mensaje: "Claro, tengo más disponibles"

---

### 🎯 QUÉ PRUEBA ESTO

✅ Registro y encriptación de contraseñas
✅ Login y sesiones en localStorage
✅ Upload de fotos (perfiles y publicaciones)
✅ Guardado en BD
✅ Lectura de datos de múltiples usuarios
✅ Chat en tiempo real (pseudo-real)
✅ Endpoints del backend funcionando
✅ Frontend comunicando correctamente con backend

---

### 🐛 SI ALGO NO FUNCIONA

1. **Foto no sube:**
   - Revisar console (F12) en navegador
   - Revisar tamaño (máx 2MB perfil, 5MB publicación)
   - Revisar formato (JPG, PNG, WebP)

2. **Mensaje no envía:**
   - Revisar que ambos usuarios estén logged in
   - Revisar IDs correctos (1, 2)
   - Revisar console del servidor

3. **Publicación no se ve:**
   - Revisar que usuario 2 esté logged in
   - Refresh página
   - Revisar console

---

### 📊 DATOS EN BD

**Tabla usuarios:**
```sql
SELECT * FROM usuarios;
```

**Tabla publicaciones:**
```sql
SELECT * FROM publicaciones;
```

**Tabla mensajes:**
```sql
SELECT * FROM mensajes;
```

---

### 🔍 VER FOTOS

**Perfil de Usuario 1:**
http://localhost:3000/img/perfiles/perfil_1234567890-123456.jpg

**Publicación:**
http://localhost:3000/img/publicaciones/pub_1234567890-123456.jpg

