function mostrarLoader() {
  document.getElementById('loaderOverlay').style.display = 'flex';
}
function ocultarLoader() {
  document.getElementById('loaderOverlay').style.display = 'none';
}
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  mostrarLoader();
  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const telefono = document.getElementById('telefono').value;
  const direccion = document.getElementById('direccion').value;
  const contrasena = document.getElementById('contrasena').value;
  const res = await fetch('/api/usuarios/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, telefono, direccion, contrasena })
  });
  const data = await res.json();
  ocultarLoader();
  if (res.ok) {
    window.location.href = 'login.html';
  } else {
    alert(data.error || 'No se pudo registrar');
  }
});
