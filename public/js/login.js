function mostrarLoader() {
  document.getElementById('loaderOverlay').style.display = 'flex';
}
function ocultarLoader() {
  document.getElementById('loaderOverlay').style.display = 'none';
}
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  mostrarLoader();
  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;
  const res = await fetch('/api/usuarios/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });
  const data = await res.json();
  ocultarLoader();
  if (res.ok && data.usuario) {
    // Guardar el usuario completo en localStorage
    localStorage.setItem('usuario', JSON.stringify({
      id_usuario: data.usuario.id_usuario,
      nombre: data.usuario.nombre,
      correo: data.usuario.correo,
      rol: data.usuario.rol || 'cliente'
    }));
    window.location.href = 'buscar.html';
  } else {
    alert(data.error || 'Credenciales incorrectas');
  }
});
