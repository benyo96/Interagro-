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
