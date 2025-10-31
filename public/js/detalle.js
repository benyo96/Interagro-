async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const res = await fetch(`/api/productos/${id}`);
  const prod = await res.json();
  document.getElementById('nombreProducto').textContent = prod.nombre_productos || 'Producto';
  document.getElementById('descripcionProducto').textContent = prod.descripcion || '';
  document.getElementById('precioProducto').textContent = prod.precio ? `$${prod.precio}` : '';
  // Si tienes imagen real, reemplaza src
  // document.getElementById('imgProducto').src = prod.imagen || 'img/logo-interagro.png';
}
cargarDetalle();
function mostrarLoader() {
  document.getElementById('loaderOverlay').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('loaderOverlay').style.display = 'none';
    alert('Chat iniciado (simulado)');
  }, 1500);
}
