function mostrarLoader() {
  document.getElementById('loaderOverlay').style.display = 'flex';
}
function ocultarLoader() {
  document.getElementById('loaderOverlay').style.display = 'none';
}

// --- Categoría múltiple y campo "otra" ---
const selectCategoria = document.getElementById('categoria');
const inputOtraCategoria = document.getElementById('otraCategoria');

selectCategoria.addEventListener('change', function() {
  const values = Array.from(this.selectedOptions).map(opt => opt.value);
  if (values.includes('Otra')) {
    inputOtraCategoria.style.display = 'block';
    inputOtraCategoria.required = true;
  } else {
    inputOtraCategoria.style.display = 'none';
    inputOtraCategoria.required = false;
    inputOtraCategoria.value = '';
  }
});


// --- Mini mapa Leaflet para lat/lng ---
window.addEventListener('DOMContentLoaded', function() {
  // Solo si existe el div del mapa
  const mapaDiv = document.getElementById('miniMapa');
  if (!mapaDiv) return;
  // Coordenadas por defecto (Colombia centro)
  const defaultLat = 4.5709, defaultLng = -74.2973;
  const map = L.map('miniMapa').setView([defaultLat, defaultLng], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(map);
  const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
  // Actualiza los campos ocultos
  function updateLatLngFields(lat, lng) {
    document.getElementById('latitud').value = lat;
    document.getElementById('longitud').value = lng;
  }
  updateLatLngFields(defaultLat, defaultLng);
  marker.on('dragend', function(e) {
    const { lat, lng } = marker.getLatLng();
    updateLatLngFields(lat, lng);
  });
  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updateLatLngFields(e.latlng.lat, e.latlng.lng);
  });
});

document.getElementById('publicarForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  mostrarLoader();
  const id_usuario = localStorage.getItem('id_usuario') || 1;
  const nombre_productos = document.getElementById('nombre_productos').value.trim();
  const precio = document.getElementById('precio').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const categorias = Array.from(selectCategoria.selectedOptions).map(opt => opt.value);
  let categoriaFinal = categorias.filter(c => c !== 'Otra').join(', ');
  if (categorias.includes('Otra')) {
    if (!inputOtraCategoria.value.trim()) {
      ocultarLoader();
      alert('Por favor, especifique la categoría.');
      return;
    }
    categoriaFinal += (categoriaFinal ? ', ' : '') + inputOtraCategoria.value.trim();
  }
  // Mini mapa: obtener lat/lng
  const latitud = document.getElementById('latitud').value;
  const longitud = document.getElementById('longitud').value;
  // Validación básica
  if (!nombre_productos || !precio || !descripcion || !categoriaFinal) {
    ocultarLoader();
    alert('Todos los campos son obligatorios.');
    return;
  }
  // Validar lat/lng (opcional: puedes hacerlos obligatorios si quieres)
  const body = { id_usuario, nombre_productos, precio, descripcion, categoria: categoriaFinal, latitud, longitud };
  const res = await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  ocultarLoader();
  if (res.ok) {
    alert('Producto publicado exitosamente');
    window.location.href = 'catalogo.html';
  } else {
    alert(data.error || 'No se pudo publicar');
  }
});
