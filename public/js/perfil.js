
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

// --- Menú Más ---
btnMas.onclick = (e) => {
  e.stopPropagation();
  menuMas.style.display = menuMas.style.display === 'none' ? 'block' : 'none';
};
document.addEventListener('click', (e) => {
  if (!btnMas.contains(e.target) && !menuMas.contains(e.target)) {
    menuMas.style.display = 'none';
  }
});

// --- Salir y cambiar cuenta ---
document.getElementById('salirBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};
document.getElementById('cambiarCuentaBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

// --- Cambiar apariencia ---
document.getElementById('aparienciaBtn').onclick = () => {
  document.body.classList.toggle('dark-mode');
};

// --- Editar perfil ---
btnEditarPerfil.onclick = () => {
  inputDescripcion.value = descripcion;
  modalEditarPerfil.style.display = 'flex';
};
cerrarModalEditarPerfil.onclick = () => {
  modalEditarPerfil.style.display = 'none';
};
guardarDescripcion.onclick = () => {
  descripcion = inputDescripcion.value.trim();
  localStorage.setItem('perfil_descripcion', descripcion);
  cargarPerfil();
  modalEditarPerfil.style.display = 'none';
};

// --- Nueva publicación ---
btnNuevaPublicacion.onclick = () => {
  modalNuevaPublicacion.style.display = 'flex';
};
cerrarModalNuevaPublicacion.onclick = () => {
  modalNuevaPublicacion.style.display = 'none';
  tituloPublicacion.value = '';
  precioPublicacion.value = '';
  descPublicacion.value = '';
  imgPublicacion.value = '';
};

// --- Publicar nueva publicación ---
publicarBtn.onclick = async () => {
  const titulo = tituloPublicacion.value.trim();
  const precio = precioPublicacion.value.replace(/\D/g, '');
  const descripcionPub = descPublicacion.value.trim();
  const id_usuario = String(localStorage.getItem('id_usuario'));
  const files = Array.from(imgPublicacion.files);
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
    id_usuario: id_usuario
  });
  localStorage.setItem('publicaciones_local', JSON.stringify(publicaciones));
  cargarPerfil();
  modalNuevaPublicacion.style.display = 'none';
  tituloPublicacion.value = '';
  precioPublicacion.value = '';
  descPublicacion.value = '';
  imgPublicacion.value = '';
};

// Formatear precio con puntos de miles en tiempo real
precioPublicacion.addEventListener('input', function(e) {
  let val = precioPublicacion.value.replace(/\D/g, '');
  if (!val) { precioPublicacion.value = ''; return; }
  precioPublicacion.value = Number(val).toLocaleString('es-CO');
});

// Renderizar publicaciones y descripción
function cargarPerfil() {
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
    return `<div class=\"publicacion-card\" style=\"background:#fff;border-radius:14px;box-shadow:0 2px 12px #0001;padding:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;\">\n      ${imagenesHtml}\n      <div style=\"font-weight:700;font-size:1.08em;color:#4caf50;\">${pub.nombre_productos||''}</div>\n      <div style=\"color:#222;font-size:.98em;margin-bottom:4px;\">${pub.descripcion||''}</div>\n      <div style=\"color:#388e3c;font-size:1.08em;font-weight:600;\">${pub.precio ? '$'+Number(pub.precio).toLocaleString('es-CO') : ''}</div>\n    </div>`;
  }).join('') : '<div style=\"color:#888;text-align:center;padding:32px;\">No tienes publicaciones aún.</div>';
}

// Inicializar perfil al cargar
window.onload = cargarPerfil;
