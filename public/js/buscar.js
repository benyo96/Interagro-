
// All element bindings are attached after DOM is ready to avoid null references
function attachUiHandlers() {
  const salirBtn = document.getElementById('salirBtn');
  if (salirBtn) salirBtn.onclick = () => { localStorage.clear(); window.location.href = 'login.html'; };

  const cambiarCuentaBtn = document.getElementById('cambiarCuentaBtn');
  if (cambiarCuentaBtn) cambiarCuentaBtn.onclick = () => { localStorage.clear(); window.location.href = 'login.html'; };

  const aparienciaBtn = document.getElementById('aparienciaBtn');
  if (aparienciaBtn) aparienciaBtn.onclick = () => { document.body.classList.toggle('dark-mode'); };

  const actividadBtn = document.getElementById('actividadBtn');
  if (actividadBtn) actividadBtn.onclick = async () => {
    hidePanels();
    const id_usuario = localStorage.getItem('id_usuario');
    const panel = document.getElementById('actividadPanel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = '<b>Cargando actividad...</b>';
    // Consulta compras y ventas
    try {
      const compras = await fetch(`/api/compras/${id_usuario}`).then(r=>r.json());
      const ventas = await fetch(`/api/ventas/${id_usuario}`).then(r=>r.json());
      let html = '<h4>Mis compras</h4>';
      if (compras && compras.length) {
        html += '<ul>' + compras.map(c => `<li>Compra #${c.idcompra} - ${c.fecha}</li>`).join('') + '</ul>';
      } else {
        html += '<p>No tienes compras registradas.</p>';
      }
      html += '<h4>Mis ventas</h4>';
      if (ventas && ventas.length) {
        html += '<ul>' + ventas.map(v => `<li>Venta producto: ${v.nombre_productos} - Cantidad: ${v.cantidad}</li>`).join('') + '</ul>';
      } else {
        html += '<p>No tienes ventas registradas.</p>';
      }
      panel.innerHTML = html;
    } catch (err) {
      panel.innerHTML = '<p>Error cargando actividad.</p>';
      console.error(err);
    }
  };

  const guardadoBtn = document.getElementById('guardadoBtn');
  if (guardadoBtn) guardadoBtn.onclick = async () => {
    hidePanels();
    const id_usuario = localStorage.getItem('id_usuario');
    const panel = document.getElementById('guardadoPanel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = '<b>Cargando guardados...</b>';
    try {
      const favoritos = await fetch(`/api/favoritos/${id_usuario}`).then(r=>r.json());
      if (favoritos && favoritos.length) {
        panel.innerHTML = '<h4>Mis productos guardados</h4><ul>' + favoritos.map(f => `<li>${f.nombre_productos} - $${f.precio}</li>`).join('') + '</ul>';
      } else {
        panel.innerHTML = '<p>No tienes productos guardados.</p>';
      }
    } catch (err) {
      panel.innerHTML = '<p>Error al cargar guardados.</p>';
      console.error(err);
    }
  };

  const reporteBtn = document.getElementById('reporteBtn');
  if (reporteBtn) reporteBtn.onclick = () => { hidePanels(); const rp = document.getElementById('reportePanel'); if (rp) rp.style.display = 'block'; };
  const formReporte = document.getElementById('formReporte');
  if (formReporte) formReporte.onsubmit = async (e) => {
    e.preventDefault();
    const id_usuario = localStorage.getItem('id_usuario');
    const asunto = document.getElementById('asuntoReporte')?.value;
    const descripcion = document.getElementById('descReporte')?.value;
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario, asunto, descripcion })
      });
      if (res.ok) {
        document.getElementById('reporteMsg').innerText = 'Reporte enviado correctamente.';
        formReporte.reset();
      } else {
        document.getElementById('reporteMsg').innerText = 'Error al enviar el reporte.';
      }
    } catch (err) {
      document.getElementById('reporteMsg').innerText = 'Error al enviar.';
      console.error(err);
    }
  };
}

function hidePanels() {
  document.getElementById('actividadPanel').style.display = 'none';
  document.getElementById('guardadoPanel').style.display = 'none';
  document.getElementById('reportePanel').style.display = 'none';
}

  // Mostrar publicaciones en el grid principal
  async function cargarPublicacionesBuscar() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center;padding:32px;">Cargando publicaciones...</div>';
    try {
      const res = await fetch('/api/publicaciones');
      const publicaciones = await res.json();
      console.log('Publicaciones recibidas:', publicaciones);
      if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:32px;">No hay publicaciones disponibles.</div>';
        return;
      }
      grid.innerHTML = publicaciones.map(pub => {
        // Corregir la ruta de la imagen si es relativa
        let foto = pub.foto;
        if (foto && foto.startsWith('/img/publicaciones/')) {
          foto = '..' + foto;
        } else if (!foto) {
          foto = '../img/4.png';
        }
        return `
        <div>
          <div class="card h-100 product-card">
            <div class="position-relative">
              <img src="${foto}" class="card-img-top" alt="${pub.titulo}">
              <span class="badge bg-success position-absolute top-0 end-0 m-2">Nuevo</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">${pub.titulo}</h5>
              <p class="text-success fw-bold mb-1">$${Number(pub.precio).toLocaleString('es-CO')}</p>
              <p class="card-text text-muted small">${pub.descripcion || ''}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small"><i class="fas fa-map-marker-alt"></i> ${pub.categoria || 'Sin categoría'}</span>
                <button class="btn btn-outline-success btn-sm">Ver detalles</button>
              </div>
            </div>
          </div>
        </div>
        `;
      }).join('');
    } catch (error) {
      grid.innerHTML = '<div style="text-align:center;padding:32px;">Error al cargar publicaciones.</div>';
      console.error('Error al cargar publicaciones:', error);
    }
  }

  // Cargar publicaciones y adjuntar handlers una vez el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    try {
      attachUiHandlers();
    } catch (err) {
      console.warn('attachUiHandlers error (some sidebar elements may be missing):', err);
    }
    cargarPublicacionesBuscar();
  });
