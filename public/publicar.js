function mostrarLoader() {
  document.getElementById('loaderOverlay').style.display = 'flex';
}
function ocultarLoader() {
  document.getElementById('loaderOverlay').style.display = 'none';
}
document.getElementById('publicarForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  mostrarLoader();
  // Simulación de id_usuario, reemplaza con el real
  const id_usuario = localStorage.getItem('id_usuario') || 1;
  const nombre_productos = document.getElementById('nombre_productos').value;
  const cantidad = document.getElementById('cantidad').value;
  const precio = document.getElementById('precio').value;
  const descripcion = document.getElementById('descripcion').value;
  const res = await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, nombre_productos, cantidad, precio, descripcion, id_categoria: 1 })
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
