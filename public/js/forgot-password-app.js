document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const message = document.getElementById('message');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('email')?.value?.trim();
    const contrasena = document.getElementById('newPassword')?.value?.trim();

    if (!correo || !contrasena) {
      message.textContent = 'Debes completar todos los campos.';
      message.className = 'form-message error';
      return;
    }

    try {
      const response = await fetch('/api/usuarios/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();
      if (!response.ok) {
        message.textContent = data.error || 'No se pudo actualizar la contraseña.';
        message.className = 'form-message error';
        return;
      }

      message.textContent = 'Contraseña actualizada correctamente. Puedes iniciar sesión ahora.';
      message.className = 'form-message success';
      form.reset();
    } catch (error) {
      console.error('Error en reset-password:', error);
      message.textContent = 'Error de red al intentar actualizar la contraseña.';
      message.className = 'form-message error';
    }
  });
});
