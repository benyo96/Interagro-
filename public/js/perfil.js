// --- Estado ---// --- Menú Más ---

let descripcion = localStorage.getItem('perfil_descripcion') || '';const btnMas = document.getElementById('btnMas');

const menuMas = document.getElementById('menuMas');

// --- Elementos ---

const perfilFoto = document.getElementById('perfilFoto');btnMas.onclick = () => {

const btnEditarPerfil = document.getElementById('btnEditarPerfil');  menuMas.style.display = menuMas.style.display === 'none' ? 'block' : 'none';

const perfilDescripcion = document.getElementById('perfilDescripcion');};

const perfilPublicaciones = document.getElementById('perfilPublicaciones');

const publicacionesGrid = document.getElementById('publicacionesGrid');document.addEventListener('click', (e) => {

const btnNuevaPublicacion = document.getElementById('btnNuevaPublicacion');  if (!btnMas.contains(e.target) && !menuMas.contains(e.target)) {

const modalEditarPerfil = document.getElementById('modalEditarPerfil');    menuMas.style.display = 'none';

const cerrarModalEditarPerfil = document.getElementById('cerrarModalEditarPerfil');  }

const inputDescripcion = document.getElementById('inputDescripcion');});

const guardarDescripcion = document.getElementById('guardarDescripcion');

const modalNuevaPublicacion = document.getElementById('modalNuevaPublicacion');// --- Salir y cambiar cuenta ---

const cerrarModalNuevaPublicacion = document.getElementById('cerrarModalNuevaPublicacion');document.getElementById('salirBtn').onclick = () => {

const tituloPublicacion = document.getElementById('tituloPublicacion');  localStorage.clear();

const precioPublicacion = document.getElementById('precioPublicacion');  window.location.href = 'login.html';

const descPublicacion = document.getElementById('descPublicacion');};

const imgPublicacion = document.getElementById('imgPublicacion');

const publicarBtn = document.getElementById('publicarBtn');document.getElementById('cambiarCuentaBtn').onclick = () => {

  localStorage.clear();

// --- Inicializar perfil ---  window.location.href = 'login.html';

function cargarPerfil() {};

  perfilDescripcion.textContent = descripcion || 'Sin descripción';

  const id_usuario = localStorage.getItem('id_usuario');// --- Cambiar apariencia (modo oscuro/claro) ---

  let publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');document.getElementById('aparienciaBtn').onclick = () => {

  publicaciones = publicaciones.filter(pub => String(pub.id_usuario) === String(id_usuario));  document.body.classList.toggle('dark-mode');

  perfilPublicaciones.textContent = publicaciones.length;};

  publicacionesGrid.innerHTML = publicaciones.length ? publicaciones.map(pub => {

    let imgs = [];// --- Tu actividad (compras y ventas) ---

    if (pub.imagenes) {document.getElementById('actividadBtn').onclick = async () => {

      try { imgs = typeof pub.imagenes === 'string' ? JSON.parse(pub.imagenes) : pub.imagenes; } catch {}  hidePanels();

    }  const id_usuario = localStorage.getItem('id_usuario');

    const imgHtml = imgs.length ? `<img src="${imgs[0]}" alt="foto publicacion">` : '<div style="width:100%;aspect-ratio:1/1;background:#e0e0e0;"></div>';  const panel = document.getElementById('actividadPanel');

    return `<div class="publicacion-card">${imgHtml}<div class="titulo">${pub.nombre_productos||''}</div><div class="precio">${pub.precio ? '$'+Number(pub.precio).toLocaleString('es-CO') : ''}</div><div class="desc">${pub.descripcion||''}</div></div>`;  panel.style.display = 'block';

  }).join('') : '<div style="color:#888;text-align:center;padding:32px;">No tienes publicaciones aún.</div>';  panel.innerHTML = '<b>Cargando actividad...</b>';

}

  const compras = await fetch(`/api/compras/${id_usuario}`).then(r => r.json());

// --- Editar perfil ---  const ventas = await fetch(`/api/ventas/${id_usuario}`).then(r => r.json());

btnEditarPerfil.onclick = () => {

  inputDescripcion.value = descripcion;  let html = '<h4>Mis compras</h4>';

  modalEditarPerfil.style.display = 'flex';  html += compras.length

};    ? '<ul>' + compras.map(c => `<li>Compra #${c.idcompra} - ${c.fecha}</li>`).join('') + '</ul>'

cerrarModalEditarPerfil.onclick = () => {    : '<p>No tienes compras registradas.</p>';

  modalEditarPerfil.style.display = 'none';

};  html += '<h4>Mis ventas</h4>';

guardarDescripcion.onclick = () => {  html += ventas.length

  descripcion = inputDescripcion.value.trim();    ? '<ul>' + ventas.map(v => `<li>Venta: ${v.nombre_productos} - Cantidad: ${v.cantidad}</li>`).join('') + '</ul>'

  localStorage.setItem('perfil_descripcion', descripcion);    : '<p>No tienes ventas registradas.</p>';

  cargarPerfil();

  modalEditarPerfil.style.display = 'none';  panel.innerHTML = html;

};};



// --- Nueva publicación ---// --- Guardado (favoritos) ---

btnNuevaPublicacion.onclick = () => {document.getElementById('guardadoBtn').onclick = async () => {

  modalNuevaPublicacion.style.display = 'flex';  hidePanels();

};  const id_usuario = localStorage.getItem('id_usuario');

cerrarModalNuevaPublicacion.onclick = () => {  const panel = document.getElementById('guardadoPanel');

  modalNuevaPublicacion.style.display = 'none';  panel.style.display = 'block';

  tituloPublicacion.value = '';  panel.innerHTML = '<b>Cargando guardados...</b>';

  precioPublicacion.value = '';

  descPublicacion.value = '';  const favoritos = await fetch(`/api/favoritos/${id_usuario}`).then(r => r.json());

  imgPublicacion.value = '';

};  panel.innerHTML = favoritos.length

publicarBtn.onclick = () => {    ? '<h4>Mis productos guardados</h4><ul>' +

  const titulo = tituloPublicacion.value.trim();      favoritos.map(f => `<li>${f.nombre_productos} - $${f.precio}</li>`).join('') + '</ul>'

  const precio = precioPublicacion.value.trim();    : '<p>No tienes productos guardados.</p>';

  const descripcionPub = descPublicacion.value.trim();};

  const id_usuario = String(localStorage.getItem('id_usuario'));

  if (!titulo || !precio || !descripcionPub) {// --- Reportar un problema ---

    alert('Completa todos los campos');document.getElementById('reporteBtn').onclick = () => {

    return;  hidePanels();

  }  document.getElementById('reportePanel').style.display = 'block';

  // Imágenes a base64};

  const files = Array.from(imgPublicacion.files);

  if (!files.length) {document.getElementById('formReporte').onsubmit = async (e) => {

    alert('Agrega al menos una imagen');  e.preventDefault();

    return;  const id_usuario = localStorage.getItem('id_usuario');

  }  const asunto = document.getElementById('asuntoReporte').value;

  Promise.all(files.map(file => new Promise(resolve => {  const descripcion = document.getElementById('descReporte').value;

    const reader = new FileReader();

    reader.onload = e => resolve(e.target.result);  const res = await fetch('/api/reportes', {

    reader.readAsDataURL(file);    method: 'POST',

  }))).then(imagenesBase64 => {    headers: { 'Content-Type': 'application/json' },

    let publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');    body: JSON.stringify({ id_usuario, asunto, descripcion })

    publicaciones.unshift({  });

      nombre_productos: titulo,

      precio,  const msg = document.getElementById('reporteMsg');

      descripcion: descripcionPub,  if (res.ok) {

      imagenes: imagenesBase64,    msg.innerText = 'Reporte enviado correctamente.';

      fecha: new Date(),    e.target.reset();

      id_usuario: id_usuario  } else {

    });    msg.innerText = 'Error al enviar el reporte.';

    localStorage.setItem('publicaciones_local', JSON.stringify(publicaciones));  }

    cargarPerfil();};

    modalNuevaPublicacion.style.display = 'none';

    tituloPublicacion.value = '';// --- Ocultar paneles secundarios ---

    precioPublicacion.value = '';function hidePanels() {

    descPublicacion.value = '';  document.getElementById('actividadPanel').style.display = 'none';

    imgPublicacion.value = '';  document.getElementById('guardadoPanel').style.display = 'none';

  });  document.getElementById('reportePanel').style.display = 'none';

};}



// --- Cerrar modales al hacer click fuera ---// --- Cargar perfil ---

window.onclick = function(event) {async function cargarPerfil() {

  if (event.target === modalEditarPerfil) modalEditarPerfil.style.display = 'none';  const id_usuario = localStorage.getItem('id_usuario');

  if (event.target === modalNuevaPublicacion) modalNuevaPublicacion.style.display = 'none';  if (!id_usuario) return;

};

  const usuario = await fetch(`/api/usuarios/${id_usuario}`).then(r => r.json());

// --- Inicializar ---

cargarPerfil();  document.getElementById('perfilNombre').innerText = usuario.nombre || 'Usuario';

  document.getElementById('perfilBio').innerText = usuario.biografia || '';
  document.getElementById('perfilExtra').innerText = usuario.ubicacion || '';
  document.getElementById('perfilFoto').src = usuario.foto || 'img/agricultor.png';
  document.getElementById('perfilSeguidores').innerText = usuario.seguidores || 0;
  document.getElementById('perfilSeguidos').innerText = usuario.seguidos || 0;

  let publicaciones = [];
  try {
    // Traer todas las publicaciones y filtrar por usuario
    publicaciones = await fetch('/api/publicaciones').then(r => r.json());
    publicaciones = publicaciones.filter(pub => String(pub.id_usuario) === String(id_usuario));
  } catch {
    publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');
    publicaciones = publicaciones.filter(pub => String(pub.id_usuario) === String(id_usuario));
  }
  document.getElementById('perfilPublicaciones').innerText = publicaciones.length;

  const grid = document.getElementById('publicacionesGrid');
  grid.innerHTML = publicaciones.length
    ? publicaciones.map(pub => {
        let imgs = [];
        if (pub.imagenes) {
          try {
            imgs = typeof pub.imagenes === 'string' ? JSON.parse(pub.imagenes) : pub.imagenes;
          } catch {}
        }
        // Solo la primera imagen para el grid tipo Instagram
        const imgHtml = imgs.length ? `<img src="${imgs[0]}" alt="foto publicacion">` : '<div style="width:100%;aspect-ratio:1/1;background:#e0e0e0;"></div>';
        return `
        <div class="publicacion-img-card">
          ${imgHtml}
          <div class="publicacion-img-info">
            <div class="titulo">${pub.nombre_productos || ''}</div>
            ${pub.precio ? `<div class="precio">$${Number(pub.precio).toLocaleString('es-CO')}</div>` : ''}
            ${pub.categoria ? `<div class="categoria">${pub.categoria}</div>` : ''}
          </div>
        </div>
        `;
      }).join('')
    : '<div style="color:#888;text-align:center;padding:32px;">No tienes publicaciones aún.</div>';
}

window.onload = cargarPerfil;

// --- Subir foto de perfil ---
const formFotoPerfil = document.getElementById('formFotoPerfil');
const inputFotoPerfil = document.getElementById('inputFotoPerfil');
const btnCambiarFoto = document.getElementById('btnCambiarFoto');
const fotoPerfilMsg = document.getElementById('fotoPerfilMsg');
const perfilFoto = document.getElementById('perfilFoto');

btnCambiarFoto.onclick = () => inputFotoPerfil.click();

inputFotoPerfil.onchange = async function() {

  // --- Estado ---
  let descripcion = localStorage.getItem('perfil_descripcion') || '';

  // --- Elementos ---
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

  // --- Inicializar perfil ---
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
      const imgHtml = imgs.length ? `<img src="${imgs[0]}" alt="foto publicacion">` : '<div style="width:100%;aspect-ratio:1/1;background:#e0e0e0;"></div>';
      return `<div class="publicacion-card">${imgHtml}<div class="titulo">${pub.nombre_productos||''}</div><div class="precio">${pub.precio ? '$'+Number(pub.precio).toLocaleString('es-CO') : ''}</div><div class="desc">${pub.descripcion||''}</div></div>`;
    }).join('') : '<div style="color:#888;text-align:center;padding:32px;">No tienes publicaciones aún.</div>';
  }

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
  publicarBtn.onclick = () => {
    const titulo = tituloPublicacion.value.trim();
    const precio = precioPublicacion.value.trim();
    const descripcionPub = descPublicacion.value.trim();
    const id_usuario = String(localStorage.getItem('id_usuario'));
    if (!titulo || !precio || !descripcionPub) {
      alert('Completa todos los campos');
      return;
    }
    // Imágenes a base64
    const files = Array.from(imgPublicacion.files);
    if (!files.length) {
      alert('Agrega al menos una imagen');
      return;
    }
    Promise.all(files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    }))).then(imagenesBase64 => {
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
    });
  };

  // --- Cerrar modales al hacer click fuera ---
  window.onclick = function(event) {
    if (event.target === modalEditarPerfil) modalEditarPerfil.style.display = 'none';
    if (event.target === modalNuevaPublicacion) modalNuevaPublicacion.style.display = 'none';
  };

  // --- Inicializar ---
  cargarPerfil();
