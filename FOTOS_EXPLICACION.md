## 🖼️ CÓMO VER LAS FOTOS GUARDADAS

### Carpetas de almacenamiento

Las fotos se guardan en dos lugares dentro del servidor:

```
public/
├── img/
│   ├── perfiles/              ← Fotos de perfiles de usuarios
│   └── publicaciones/         ← Fotos de productos
```

### Acceso mediante navegador

**Foto de perfil de Usuario 1:**
```
http://localhost:3000/img/perfiles/perfil_1234567890-123456789.jpg
```

**Foto de publicación:**
```
http://localhost:3000/img/publicaciones/pub_1234567890-123456789.jpg
```

### Ver archivos físicos

**Windows - Abre el explorador:**
```
c:\Users\pcana\Downloads\app web\Interagro-\public\img\perfiles\
c:\Users\pcana\Downloads\app web\Interagro-\public\img\publicaciones\
```

**Ver lista en terminal:**
```powershell
cd "c:\Users\pcana\Downloads\app web\Interagro-"
dir public\img\perfiles
dir public\img\publicaciones
```

### Formato de nombres

**Fotos de perfil:**
- Patrón: `perfil_TIMESTAMP-RANDOM.jpg`
- Ejemplo: `perfil_1684567890-987654321.jpg`
- Máximo: 2MB
- Formatos: JPG, PNG, WebP

**Fotos de publicaciones:**
- Patrón: `pub_TIMESTAMP-RANDOM.jpg`
- Ejemplo: `pub_1684567890-987654321.png`
- Máximo: 5MB
- Formatos: JPG, PNG, WebP

### En la aplicación

Cuando creas una publicación:
1. Frontend captura la foto del input
2. Envía con POST /api/publicaciones
3. Backend (multer) guarda en public/img/publicaciones/
4. Devuelve la ruta: `/img/publicaciones/pub_1684567890-987654321.jpg`
5. BD guarda la ruta
6. Frontend muestra la imagen con: `<img src="/img/publicaciones/pub_1684567890-987654321.jpg">`

### Ver en navegador mientras desarrollas

**En perfil.html:**
```html
<img src="/img/perfiles/perfil_1684567890-987654321.jpg" alt="Perfil">
```

**En buscar.html:**
```html
<img src="/img/publicaciones/pub_1684567890-987654321.jpg" alt="Producto">
```

El servidor sirve estas carpetas automáticamente porque en app.js tenemos:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

Esto significa que:
- `/img/perfiles/` → `public/img/perfiles/`
- `/img/publicaciones/` → `public/img/publicaciones/`

### Base de datos

Para ver qué fotos guardó la BD:

```sql
-- Ver todas las publicaciones con sus fotos
SELECT id_publicacion, titulo, precio, foto 
FROM publicaciones;

-- Ejemplo de resultado:
-- id_publicacion | titulo      | precio | foto
-- 1              | Tomates     | 5000   | /img/publicaciones/pub_1684567890-123456.jpg
-- 2              | Lechuga     | 3000   | /img/publicaciones/pub_1684567890-654321.jpg
```

```sql
-- Ver fotos de perfil
SELECT id, nombre, foto_perfil 
FROM usuarios;

-- Ejemplo de resultado:
-- id | nombre | foto_perfil
-- 1  | Juan   | /img/perfiles/perfil_1684567890-123456.jpg
-- 2  | María  | /img/perfiles/perfil_1684567890-654321.jpg
```

### Troubleshooting

**La foto no se ve en el navegador:**
1. Revisa que el archivo existe en public/img/
2. Revisa la ruta en la BD
3. Revisa permisos de lectura
4. Limpia caché del navegador (Ctrl+F5)

**La foto no sube:**
1. Revisa tamaño (máx 2MB perfil, 5MB publicación)
2. Revisa formato (JPG, PNG, WebP)
3. Revisa console del navegador (F12)
4. Revisa que la carpeta exista y tenga permisos

**Ver logs del servidor:**
```powershell
# El servidor muestra logs cuando sube foto:
❌ Error al subir foto: ...
✅ Foto actualizada en perfil
```

