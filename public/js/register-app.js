document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoader();

    const nombre = document.getElementById('nombre')?.value.trim();
    const correo = document.getElementById('correo')?.value.trim();
    const telefono = document.getElementById('telefono')?.value.trim();
    const direccion = document.getElementById('direccion')?.value.trim();
    const contrasena = document.getElementById('contrasena')?.value;

    if (!nombre || !correo || !telefono || !direccion || !contrasena) {
      alert('Por favor completa todos los campos.');
      hideLoader();
      return;
    }

    try {
      const response = await fetch('/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, telefono, direccion, contrasena })
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = 'login.html';
        return;
      }

      alert(data.error || 'No se pudo registrar el usuario.');
    } catch (error) {
      console.error('Register error:', error);
      alert('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      hideLoader();
    }
  });
});
