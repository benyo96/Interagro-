// Menú Más
const btnMas = document.getElementById('btnMas');
const menuMas = document.getElementById('menuMas');
btnMas.onclick = () => {
  menuMas.style.display = menuMas.style.display === 'none' ? 'block' : 'none';
};
document.addEventListener('click', (e) => {
  if (!btnMas.contains(e.target) && !menuMas.contains(e.target)) menuMas.style.display = 'none';
});

// Salir y cambiar cuenta
document.getElementById('salirBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};
document.getElementById('cambiarCuentaBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

// Cambiar apariencia (modo oscuro/claro)
document.getElementById('aparienciaBtn').onclick = () => {
  document.body.classList.toggle('dark-mode');
};

// Tu actividad (compras/ventas)
document.getElementById('actividadBtn').onclick = async () => {
  hidePanels();
  const id_usuario = localStorage.getItem('id_usuario');
  const panel = document.getElementById('actividadPanel');
  panel.style.display = 'block';
  panel.innerHTML = '<b>Cargando actividad...</b>';
  // Consulta compras y ventas
  const compras = await fetch(`/api/compras/${id_usuario}`).then(r=>r.json());
  const ventas = await fetch(`/api/ventas/${id_usuario}`).then(r=>r.json());
  let html = '<h4>Mis compras</h4>';
  if (compras.length) {
    html += '<ul>' + compras.map(c => `<li>Compra #${c.idcompra} - ${c.fecha}</li>`).join('') + '</ul>';
  } else {
    html += '<p>No tienes compras registradas.</p>';
  }
  html += '<h4>Mis ventas</h4>';
  if (ventas.length) {
    html += '<ul>' + ventas.map(v => `<li>Venta producto: ${v.nombre_productos} - Cantidad: ${v.cantidad}</li>`).join('') + '</ul>';
  } else {
    html += '<p>No tienes ventas registradas.</p>';
  }
  panel.innerHTML = html;
};

// Guardado (favoritos)
document.getElementById('guardadoBtn').onclick = async () => {
  hidePanels();
  const id_usuario = localStorage.getItem('id_usuario');
  const panel = document.getElementById('guardadoPanel');
  panel.style.display = 'block';
  panel.innerHTML = '<b>Cargando guardados...</b>';
  const favoritos = await fetch(`/api/favoritos/${id_usuario}`).then(r=>r.json());
  if (favoritos.length) {
    panel.innerHTML = '<h4>Mis productos guardados</h4><ul>' + favoritos.map(f => `<li>${f.nombre_productos} - $${f.precio}</li>`).join('') + '</ul>';
  } else {
    panel.innerHTML = '<p>No tienes productos guardados.</p>';
  }
};

// Reportar un problema
document.getElementById('reporteBtn').onclick = () => {
  hidePanels();
  document.getElementById('reportePanel').style.display = 'block';
};
document.getElementById('formReporte').onsubmit = async (e) => {
  e.preventDefault();
  const id_usuario = localStorage.getItem('id_usuario');
  const asunto = document.getElementById('asuntoReporte').value;
  const descripcion = document.getElementById('descReporte').value;
  const res = await fetch('/api/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, asunto, descripcion })
  });
  if (res.ok) {
    document.getElementById('reporteMsg').innerText = 'Reporte enviado correctamente.';
    document.getElementById('formReporte').reset();
  } else {
    document.getElementById('reporteMsg').innerText = 'Error al enviar el reporte.';
  }
};

function hidePanels() {
  document.getElementById('actividadPanel').style.display = 'none';
  document.getElementById('guardadoPanel').style.display = 'none';
  document.getElementById('reportePanel').style.display = 'none';
}

// --- Perfil: cargar datos y publicaciones ---
async function cargarPerfil() {
  const id_usuario = localStorage.getItem('id_usuario');
  if (!id_usuario) return;
  // Cargar datos usuario
  const usuario = await fetch(`/api/usuarios/${id_usuario}`).then(r=>r.json());
  document.getElementById('perfilNombre').innerText = usuario.nombre || 'Usuario';
  document.getElementById('perfilBio').innerText = usuario.biografia || '';
  document.getElementById('perfilExtra').innerText = usuario.ubicacion || '';
  document.getElementById('perfilFoto').src = usuario.foto || 'img/agricultor.png';
  document.getElementById('perfilSeguidores').innerText = usuario.seguidores || 0;
  document.getElementById('perfilSeguidos').innerText = usuario.seguidos || 0;
  // Cargar publicaciones
  const publicaciones = await fetch(`/api/publicaciones/${id_usuario}`).then(r=>r.json());
  document.getElementById('perfilPublicaciones').innerText = publicaciones.length;
  const grid = document.getElementById('publicacionesGrid');
  if (!publicaciones.length) {
    grid.innerHTML = '<div style="color:#888;text-align:center;padding:32px;">No tienes publicaciones aún.</div>';
  } else {
    grid.innerHTML = publicaciones.map(pub => `
      <div class="pub-card" style="background:#222;border-radius:14px;box-shadow:0 2px 12px #0003;padding:18px;color:#fff;">
        <div style="font-weight:700;font-size:1.08em;color:#4caf50;">${pub.titulo}</div>
        <div style="color:#bbb;font-size:.98em;margin-bottom:8px;">${pub.descripcion}</div>
        ${pub.precio ? `<div style='color:#fff;font-weight:600;'>$${pub.precio}</div>` : ''}
        <div style="font-size:.92em;color:#888;margin-top:8px;">${new Date(pub.fecha).toLocaleDateString('es-ES')}</div>
      </div>
    `).join('');
  }
}

window.onload = cargarPerfil;

// --- Nueva publicación ---
document.getElementById('btnCrearPublicacion').onclick = function() {
  document.getElementById('modalPublicacion').style.display = 'flex';
};
document.getElementById('cerrarModalPublicacion').onclick = function() {
  document.getElementById('modalPublicacion').style.display = 'none';
};
// Drag & drop y selección de archivos
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('filePublicacion');
const btnSeleccionarArchivo = document.getElementById('btnSeleccionarArchivo');
const previewImg = document.getElementById('previewImg');
let imagenesSeleccionadas = [];
dropArea.addEventListener('click', () => fileInput.click());
btnSeleccionarArchivo.onclick = () => fileInput.click();
dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.style.background='#222'; });
dropArea.addEventListener('dragleave', e => { e.preventDefault(); dropArea.style.background='#181818'; });
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.style.background='#181818';
  imagenesSeleccionadas = Array.from(e.dataTransfer.files);
  mostrarPreviewImagenes();
});
fileInput.onchange = function() {
  imagenesSeleccionadas = Array.from(fileInput.files);
  mostrarPreviewImagenes();
};
function mostrarPreviewImagenes() {
  if (!imagenesSeleccionadas.length) { previewImg.innerHTML = ''; return; }
  previewImg.innerHTML = imagenesSeleccionadas.map(img => {
    return `<img src="${URL.createObjectURL(img)}" style="max-width:120px;max-height:120px;border-radius:12px;margin:0 6px 6px 0;box-shadow:0 2px 8px #0003;">`;
  }).join('');
}
document.getElementById('formNuevaPublicacion').onsubmit = async function(e) {
  e.preventDefault();
  const id_usuario = localStorage.getItem('id_usuario');
  const titulo = document.getElementById('tituloPublicacion').value;
  const descripcion = document.getElementById('descPublicacion').value;
  const precio = document.getElementById('precioPublicacion').value;
  const formData = new FormData();
  formData.append('id_usuario', id_usuario);
  formData.append('titulo', titulo);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  imagenesSeleccionadas.forEach((img, i) => formData.append('imagenes', img));
  const res = await fetch('/api/publicaciones', {
    method: 'POST',
    body: formData
  });
  if (res.ok) {
    document.getElementById('msgPublicacion').innerText = '';
    document.getElementById('formNuevaPublicacion').reset();
    previewImg.innerHTML = '';
    imagenesSeleccionadas = [];
    document.getElementById('modalPublicacion').style.display = 'none';
    cargarPerfil(); // Recargar publicaciones
  } else {
    document.getElementById('msgPublicacion').innerText = 'Error al publicar.';
  }
};

// Mostrar/ocultar formulario de publicación
document.getElementById('btnCrearPublicacion').onclick = function() {
  const form = document.getElementById('formNuevaPublicacion');
  form.style.display = form.style.display === 'none' ? 'flex' : 'none';
};
