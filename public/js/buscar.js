
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

  // Mostrar publicaciones en el grid principal. options: {q, categories, minPrice, maxPrice, location, sort}
  async function cargarPublicacionesBuscar(options = {}) {
    const grid = document.querySelector('.products-grid');
    const resultsInfo = document.querySelector('.results-header p');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center;padding:32px;">Cargando publicaciones...</div>';

    // Construir query string
    const qs = new URLSearchParams();
    if (options.q) qs.set('q', options.q);
    if (options.categories && options.categories.length) qs.set('categories', options.categories.join(','));
    if (options.minPrice != null) qs.set('minPrice', options.minPrice);
    if (options.maxPrice != null) qs.set('maxPrice', options.maxPrice);
    if (options.location) qs.set('location', options.location);
    if (options.sort) qs.set('sort', options.sort);

    const url = '/api/publicaciones' + (qs.toString() ? `?${qs.toString()}` : '');

    try {
      const res = await fetch(url);
      const publicaciones = await res.json();
      console.log('Publicaciones recibidas:', publicaciones);
      if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
        if (resultsInfo) resultsInfo.innerText = 'Mostrando 0 resultados';
        grid.innerHTML = '<div style="text-align:center;padding:32px;">No hay publicaciones disponibles.</div>';
        return;
      }

      if (resultsInfo) resultsInfo.innerText = `Mostrando ${publicaciones.length} resultados`;

      grid.innerHTML = publicaciones.map((pub, idx) => {
        let foto = pub.foto;
        if (foto && foto.startsWith('/img/publicaciones/')) {
          foto = '..' + foto;
        } else if (!foto) {
          foto = '../img/4.png';
        }
        return `
        <div>
          <div class="card h-100 product-card" data-idx="${idx}">
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
                <button class="btn btn-outline-success btn-sm ver-detalles-btn" data-idx="${idx}">Ver detalles</button>
              </div>
            </div>
          </div>
        </div>
        `;
      }).join('');

      // Evento para mostrar modal de detalles
      setTimeout(() => {
        document.querySelectorAll('.ver-detalles-btn').forEach(btn => {
          btn.onclick = function() {
            const idx = this.getAttribute('data-idx');
            const pub = publicaciones[idx];
            if (!pub) return;
            document.getElementById('modalProductoImg').src = pub.foto || '../img/4.png';
            document.getElementById('modalProductoTitulo').textContent = pub.titulo || '';
            document.getElementById('modalProductoPrecio').textContent = `$${Number(pub.precio).toLocaleString('es-CO')}`;
            document.getElementById('modalProductoCategoria').textContent = pub.categoria || 'Sin categoría';
            document.getElementById('modalProductoDesc').textContent = pub.descripcion || '';
            document.getElementById('modalProducto').style.display = 'flex';
          };
        });
        document.getElementById('cerrarModalProducto').onclick = function() {
          document.getElementById('modalProducto').style.display = 'none';
        };
        // Cerrar modal al hacer click fuera del contenido
        document.getElementById('modalProducto').onclick = function(e) {
          if (e.target === this) this.style.display = 'none';
        };
      }, 100);
    } catch (error) {
      if (resultsInfo) resultsInfo.innerText = 'Error al cargar resultados';
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

    // Elementos de búsqueda y filtros
    const searchInput = document.querySelector('.search-container input[type="text"]');
    const searchBtn = document.querySelector('.search-container button');
    const sortSelect = document.getElementById('sortSelect');
    const filterSection = document.querySelector('.filter-section');

    function gatherFilters() {
      const options = {};
      if (searchInput && searchInput.value.trim()) options.q = searchInput.value.trim();

      // categorías: todos los checkboxes dentro de filter-section
      if (filterSection) {
        const checked = Array.from(filterSection.querySelectorAll('input[type="checkbox"]:checked'))
          .map(cb => cb.nextElementSibling ? cb.nextElementSibling.innerText.trim() : cb.id);
        if (checked.length) options.categories = checked;

        // price inputs: asumimos dos inputs numéricos dentro .price-inputs
        const priceInputs = filterSection.querySelectorAll('.price-inputs input[type="number"]');
        if (priceInputs && priceInputs.length >= 2) {
          const min = priceInputs[0].value ? Number(priceInputs[0].value) : null;
          const max = priceInputs[1].value ? Number(priceInputs[1].value) : null;
          if (!isNaN(min) && min !== null) options.minPrice = min;
          if (!isNaN(max) && max !== null) options.maxPrice = max;
        }

        // ubicación: el select dentro de filter-section (si existe)
        const locSelect = filterSection.querySelector('select');
        if (locSelect && locSelect.value && !locSelect.value.startsWith('Todas')) options.location = locSelect.value;
      }

      if (sortSelect && sortSelect.value) options.sort = sortSelect.value;
      return options;
    }

    // Listeners
    if (searchBtn) searchBtn.addEventListener('click', () => cargarPublicacionesBuscar(gatherFilters()));
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); cargarPublicacionesBuscar(gatherFilters()); } });
    if (filterSection) {
      // Sincronizar slider y inputs de precio
      const priceRange = document.getElementById('priceRange');
      const priceMinLabel = document.getElementById('priceMinLabel');
      const priceMaxLabel = document.getElementById('priceMaxLabel');
      const priceMinInput = document.getElementById('priceMinInput');
      const priceMaxInput = document.getElementById('priceMaxInput');

      if (priceRange && priceMinLabel && priceMaxLabel && priceMinInput && priceMaxInput) {
        // No inicializar valores predeterminados, dejar inputs vacíos
        priceRange.value = '';
        priceMinInput.value = '';
        priceMaxInput.value = '';
        priceMinLabel.textContent = '$50,000';
        priceMaxLabel.textContent = '$10,000,000';

        priceRange.addEventListener('input', function () {
          const value = parseInt(priceRange.value);
          priceMinLabel.textContent = `$${value.toLocaleString()}`;
          priceMinInput.value = value;
          cargarPublicacionesBuscar(gatherFilters());
        });
        priceMinInput.addEventListener('input', function () {
          let min = parseInt(priceMinInput.value) || 50000;
          let max = parseInt(priceMaxInput.value) || 10000000;
          if (min < 50000) min = 50000;
          if (min > max) min = max;
          priceRange.value = min;
          priceMinLabel.textContent = `$${min.toLocaleString()}`;
          cargarPublicacionesBuscar(gatherFilters());
        });
        priceMaxInput.addEventListener('input', function () {
          let min = parseInt(priceMinInput.value) || 50000;
          let max = parseInt(priceMaxInput.value) || 10000000;
          if (max > 10000000) max = 10000000;
          if (max < min) max = min;
          priceMaxLabel.textContent = `$${max.toLocaleString()}`;
          cargarPublicacionesBuscar(gatherFilters());
        });
      }

      filterSection.addEventListener('change', (e) => {
        // responde a cambios en checkboxes, price inputs o location select
        cargarPublicacionesBuscar(gatherFilters());
      });
    }
    if (sortSelect) sortSelect.addEventListener('change', () => cargarPublicacionesBuscar(gatherFilters()));

    // Carga inicial con filtros vacíos (muestra todo)
    cargarPublicacionesBuscar(gatherFilters());
  });
