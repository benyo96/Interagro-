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
  // Validación básica
  if (!nombre_productos || !precio || !descripcion || !categoriaFinal) {
    ocultarLoader();
    alert('Todos los campos son obligatorios.');
    return;
  }
  const res = await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, nombre_productos, precio, descripcion, categoria: categoriaFinal })
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
