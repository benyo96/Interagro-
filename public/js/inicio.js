
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


// --- Mostrar publicaciones en el feed con foto de perfil ---
window.onload = async function() {
  const feed = document.getElementById('feedPublicaciones');
  feed.innerHTML = '<b>Cargando publicaciones...</b>';
  let publicaciones = [];
  let usuarios = [];
  let usuariosMap = {};
  try {
    publicaciones = await fetch('/api/publicaciones').then(r => r.json());
    usuarios = await fetch('/api/usuarios').then(r => r.json());
    usuarios.forEach(u => { usuariosMap[u.id] = u; });
  } catch {
    publicaciones = JSON.parse(localStorage.getItem('publicaciones_local') || '[]');
    // Simular usuario local
    usuariosMap = {};
    publicaciones.forEach(pub => {
      if (!usuariosMap[pub.id_usuario]) {
        usuariosMap[pub.id_usuario] = { nombre: 'Tú', foto_perfil: null };
      }
    });
  }
  feed.innerHTML = publicaciones.length ? publicaciones.map(pub => {
    const usuario = usuariosMap[pub.id_usuario] || { nombre: 'Usuario', foto_perfil: null };
    const fotoPerfil = usuario.foto_perfil ? ('../' + usuario.foto_perfil) : '../img/agricultor.png';
    let imagenesHtml = '';
    if (pub.imagenes) {
      let imgs = [];
      try {
        imgs = typeof pub.imagenes === 'string' ? JSON.parse(pub.imagenes) : pub.imagenes;
      } catch {}
      if (Array.isArray(imgs) && imgs.length > 0) {
        imagenesHtml = `<div style='display:flex;gap:8px;margin-bottom:8px;'>` + imgs.map(img => `<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;box-shadow:0 2px 8px #0002;">`).join('') + `</div>`;
      }
    }
    return `<div class="feed-card" style="background:#fff;border-radius:14px;box-shadow:0 2px 12px #0001;padding:18px;display:flex;align-items:flex-start;gap:18px;">
      <img src="${fotoPerfil}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">
      <div style="flex:1;">
        <div style="font-weight:700;font-size:1.08em;color:#4caf50;">${usuario.nombre || 'Usuario'}</div>
        ${imagenesHtml}
        <div style="color:#222;font-size:.98em;margin-bottom:8px;">${pub.descripcion || ''}</div>
        <div style="color:#888;font-size:.92em;">${pub.fecha ? new Date(pub.fecha).toLocaleDateString('es-ES') : ''}</div>
      </div>
    </div>`;
  }).join('') : '<div style="color:#888;text-align:center;padding:32px;">No hay publicaciones aún.</div>';
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
