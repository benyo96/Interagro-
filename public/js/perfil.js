
// --- Estado y elementos ---
let descripcion = localStorage.getItem('perfil_descripcion') || '';
const btnMas = document.getElementById('btnMas');
const menuMas = document.getElementById('menuMas');
const perfilFoto = document.getElementById('perfilFoto');
const btnEditarPerfil = document.getElementById('btnEditarPerfil');
const perfilDescripcion = document.getElementById('perfilDescripcion');
const perfilPublicaciones = document.getElementById('perfilPublicaciones');
const publicacionesGrid = document.getElementById('publicacionesGrid');
const btnNuevaPublicacion = document.getElementById('btnNuevaPublicacion');
const modalEditarPerfil = document.getElementById('modalEditarPerfil');
const cerrarModalEditarPerfil = document.getElementById('cerrarModalEditarPerfil');
const inputDescripcion = document.getElementById('inputDescripcion');
const guardarDescripcion = document.getElementById('guardarDescripcion');
const modalNuevaPublicacion = document.getElementById('modalNuevaPublicacion');
const cerrarModalNuevaPublicacion = document.getElementById('cerrarModalNuevaPublicacion');
const tituloPublicacion = document.getElementById('tituloPublicacion');
const precioPublicacion = document.getElementById('precioPublicacion');
const descPublicacion = document.getElementById('descPublicacion');
const imgPublicacion = document.getElementById('imgPublicacion');
const publicarBtn = document.getElementById('publicarBtn');

const inputFotoPerfil = document.getElementById('inputFotoPerfil');
const categoriaPublicacion = document.getElementById('categoriaPublicacion');
const otraCategoriaPublicacion = document.getElementById('otraCategoriaPublicacion');
// --- Menú Más ---
if (btnMas) {
  btnMas.addEventListener('click', (e) => {
    e.stopPropagation();
    // menuMas may be injected later, get it dynamically
    const m = document.getElementById('menuMas') || menuMas;
    if (!m) return;
    const currentlyHidden = !m.style.display || m.style.display === 'none';
    m.style.display = currentlyHidden ? 'block' : 'none';
  });
}
document.addEventListener('click', (e) => {
  const m = document.getElementById('menuMas') || menuMas;
  if (!m || !btnMas) return;
  if (!btnMas.contains(e.target) && !m.contains(e.target)) {
    m.style.display = 'none';
  }
});

// --- Salir y cambiar cuenta ---
const salirBtn = document.getElementById('salirBtn');
if (salirBtn) {
  salirBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}
const cambiarCuentaBtn = document.getElementById('cambiarCuentaBtn');
if (cambiarCuentaBtn) {
  cambiarCuentaBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

// --- Cambiar apariencia ---
const aparienciaBtn = document.getElementById('aparienciaBtn');
if (aparienciaBtn) {
  aparienciaBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

// --- Editar perfil ---
btnEditarPerfil.onclick = () => {
  inputDescripcion.value = descripcion;
  modalEditarPerfil.style.display = 'flex';
  // Mostrar foto actual en input
  if (localStorage.getItem('perfil_foto')) {
    perfilFoto.src = localStorage.getItem('perfil_foto');
  }
  if (document.getElementById('inputFotoPerfil')) {
    document.getElementById('inputFotoPerfil').value = '';
  }
};
if (cerrarModalEditarPerfil) {
  cerrarModalEditarPerfil.addEventListener('click', () => {
    modalEditarPerfil.style.display = 'none';
  });
}
if (guardarDescripcion) {
  guardarDescripcion.addEventListener('click', () => {
    try {
      console.log('Guardar perfil: click');
      descripcion = inputDescripcion.value.trim();
      localStorage.setItem('perfil_descripcion', descripcion);
      // Guardar foto de perfil si se seleccionó
      const fotoInput = document.getElementById('inputFotoPerfil');
      if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        const file = fotoInput.files[0];
        console.log('Foto seleccionada:', file.name, file.type, file.size);
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            // Reducir tamaño de la imagen antes de guardar para evitar exceder localStorage
            const originalDataUrl = e.target.result;
            const img = new Image();
            img.onload = function() {
              const MAX_DIM = 800;
              let w = img.width;
              let h = img.height;
              if (w > MAX_DIM || h > MAX_DIM) {
                const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
              }
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              // Comprimir a JPEG para ahorrar espacio
              const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              try {
                localStorage.setItem('perfil_foto', resizedDataUrl);
                // Actualizar UI inmediatamente
                if (perfilFoto) perfilFoto.src = resizedDataUrl;
                const modalFoto = document.getElementById('modalPerfilFoto');
                if (modalFoto) modalFoto.src = resizedDataUrl;
                console.log('Foto redimensionada y guardada en localStorage (perfil_foto)');
                cargarPerfil();
                modalEditarPerfil.style.display = 'none';
              } catch (err2) {
                console.error('Error guardando foto en localStorage (posible cuota):', err2);
                alert('No se pudo guardar la foto: es demasiado grande para localStorage. Intenta con una imagen más pequeña.');
              }
            };
            img.onerror = function() {
              console.error('No se pudo cargar la imagen para redimensionar. Se guardará la original.');
              try {
                localStorage.setItem('perfil_foto', originalDataUrl);
                if (perfilFoto) perfilFoto.src = originalDataUrl;
                const modalFoto = document.getElementById('modalPerfilFoto');
                if (modalFoto) modalFoto.src = originalDataUrl;
                cargarPerfil();
                modalEditarPerfil.style.display = 'none';
              } catch (err3) {
                console.error('Error guardando la imagen original en localStorage:', err3);
                alert('No se pudo guardar la foto. Revisa la consola.');
              }
            };
            img.src = originalDataUrl;
          } catch (err) {
            console.error('Error procesando la imagen:', err);
            alert('Error al procesar la imagen. Revisa la consola.');
          }
        };
        reader.onerror = function(err) {
          console.error('FileReader error:', err);
          alert('No se pudo leer la imagen. Revisa la consola.');
        };
        reader.readAsDataURL(file);
      } else {
        console.log('No se seleccionó foto, solo se guardará la descripción');
        cargarPerfil();
        modalEditarPerfil.style.display = 'none';
      }
    } catch (e) {
      console.error('Error en guardarDescripcion handler:', e);
      alert('Ocurrió un error. Revisa la consola para más detalles.');
    }
  });
}

// --- Nueva publicación ---
if (btnNuevaPublicacion) {
  btnNuevaPublicacion.addEventListener('click', () => {
    // Mostrar modal
    modalNuevaPublicacion.style.display = 'flex';
    // Llenar foto/nombre en modal si existen
    const modalPerfilFoto = document.getElementById('modalPerfilFoto');
    const modalPerfilNombre = document.getElementById('modalPerfilNombre');
    const foto = localStorage.getItem('perfil_foto');
    if (modalPerfilFoto) modalPerfilFoto.src = foto ? foto : '../img/agricultor.png';
    if (modalPerfilNombre) modalPerfilNombre.textContent = localStorage.getItem('perfil_nombre') || 'Usuario';
  });
}
if (cerrarModalNuevaPublicacion) {
  cerrarModalNuevaPublicacion.addEventListener('click', () => {
    modalNuevaPublicacion.style.display = 'none';
    if (tituloPublicacion) tituloPublicacion.value = '';
    if (precioPublicacion) precioPublicacion.value = '';
    if (descPublicacion) descPublicacion.value = '';
    if (imgPublicacion) imgPublicacion.value = '';
    if (categoriaPublicacion) categoriaPublicacion.value = '';
    const otra = document.getElementById('otraCategoriaPublicacion');
    if (otra) { otra.value = ''; otra.style.display = 'none'; }
  });
}

// --- Publicar nueva publicación ---
publicarBtn.onclick = async () => {
  const titulo = tituloPublicacion.value.trim();
  const precio = precioPublicacion.value.replace(/\D/g, '');
  const descripcionPub = descPublicacion.value.trim();
  const id_usuario = String(localStorage.getItem('id_usuario'));
  const files = Array.from(imgPublicacion.files);
  let categoria = categoriaPublicacion.value;
  if (categoria === 'Otra') {
    categoria = document.getElementById('otraCategoriaPublicacion').value.trim();
    if (!categoria) {
      alert('Especifique la categoría');
      return;
    }
  }
  if (!titulo) {
    alert('El nombre del producto es obligatorio');
    return;
  }
  if (!precio) {
    alert('El precio es obligatorio');
    return;
  }
  if (!files.length) {
    alert('Agrega al menos una imagen');
    return;
  }
  // Leer imágenes como base64
  const imagenesBase64 = await Promise.all(files.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  })));
  let publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');
  publicaciones.unshift({
    nombre_productos: titulo,
    precio,
    descripcion: descripcionPub,
    imagenes: imagenesBase64,
    fecha: new Date(),
    id_usuario: id_usuario,
    categoria: categoria
  });
  localStorage.setItem('publicaciones_local', JSON.stringify(publicaciones));
  cargarPerfil();
  modalNuevaPublicacion.style.display = 'none';
  tituloPublicacion.value = '';
  precioPublicacion.value = '';
  descPublicacion.value = '';
  imgPublicacion.value = '';
  categoriaPublicacion.value = '';
  document.getElementById('otraCategoriaPublicacion').value = '';
};

// Formatear precio con puntos de miles en tiempo real
precioPublicacion.addEventListener('input', function(e) {
  let val = precioPublicacion.value.replace(/\D/g, '');
  if (!val) { precioPublicacion.value = ''; return; }
  precioPublicacion.value = Number(val).toLocaleString('es-CO');
});

// Renderizar publicaciones y descripción
function cargarPerfil() {
  // Mostrar foto de perfil
  if (localStorage.getItem('perfil_foto')) {
    perfilFoto.src = localStorage.getItem('perfil_foto');
  } else {
    perfilFoto.src = '../img/agricultor.png';
  }
  perfilDescripcion.textContent = descripcion || 'Sin descripción';
  const id_usuario = localStorage.getItem('id_usuario');
  let publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');
  publicaciones = publicaciones.filter(pub => String(pub.id_usuario) === String(id_usuario));
  perfilPublicaciones.textContent = publicaciones.length;
  publicacionesGrid.innerHTML = publicaciones.length ? publicaciones.map(pub => {
    let imgs = [];
    if (pub.imagenes) {
      try { imgs = typeof pub.imagenes === 'string' ? JSON.parse(pub.imagenes) : pub.imagenes; } catch {}
    }
    let imagenesHtml = '';
    if (Array.isArray(imgs) && imgs.length > 0) {
      imagenesHtml = `<div style='display:flex;gap:8px;margin-bottom:8px;'>` + imgs.map(img => `<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;box-shadow:0 2px 8px #0002;">`).join('') + `</div>`;
    }
    return `<div class=\"publicacion-card\" style=\"background:#fff;border-radius:14px;box-shadow:0 2px 12px #0001;padding:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;\">\n      ${imagenesHtml}\n      <div style=\"font-weight:700;font-size:1.08em;color:#4caf50;\">${pub.nombre_productos||''}</div>\n      <div style=\"color:#222;font-size:.98em;margin-bottom:4px;\">${pub.descripcion||''}</div>\n      <div style=\"color:#388e3c;font-size:1.08em;font-weight:600;\">${pub.precio ? '$'+Number(pub.precio).toLocaleString('es-CO') : ''}</div>\n      <div style=\"color:#222;font-size:.95em;\">${pub.categoria ? 'Categoría: '+pub.categoria : ''}</div>\n    </div>`;
  }).join('') : '<div style=\"color:#888;text-align:center;padding:32px;\">No tienes publicaciones aún.</div>';
}

// Inicializar perfil al cargar
window.onload = cargarPerfil;
// Mostrar/ocultar input de otra categoría
const categoriaSelect = document.getElementById('categoriaPublicacion');
const otraCategoriaInput = document.getElementById('otraCategoriaPublicacion');
if (categoriaSelect && otraCategoriaInput) {
  categoriaSelect.addEventListener('change', function() {
    if (this.value === 'Otra') {
      otraCategoriaInput.style.display = 'block';
    } else {
      otraCategoriaInput.style.display = 'none';
      otraCategoriaInput.value = '';
    }
  });
}
