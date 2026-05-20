document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoader();

    const correo = document.getElementById('correo')?.value.trim();
    const contrasena = document.getElementById('contrasena')?.value;

    if (!correo || !contrasena) {
      alert('Completa todos los campos para continuar.');
      hideLoader();
      return;
    }

    try {
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();
      if (response.ok && data.usuario) {
        saveUsuario(data.usuario);
        window.location.href = 'buscar.html';
        return;
      }

      alert(data.error || 'Usuario o contraseña incorrectos.');
    } catch (error) {
      console.error('Login error:', error);
      alert('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      hideLoader();
    }
  });
});
