// Opciones de problemas frecuentes
const opcionesProblemas = [
  'No puedo iniciar sesión',
  'No puedo publicar productos',
  'No recibo mensajes',
  'No puedo editar mi perfil',
  'No puedo cambiar mi contraseña',
  'No puedo ver mis compras',
  'Problemas con el diseño o visualización',
  'Otro problema',
];

// Reemplazar el input de asunto por un select
const formReporte = document.getElementById('formReporte');
const asuntoInput = document.getElementById('asuntoReporte');
const select = document.createElement('select');
select.id = 'asuntoReporte';
select.required = true;
select.style.marginBottom = '8px';
select.style.fontFamily = 'Montserrat, sans-serif';
select.style.fontSize = '1.13em';
select.style.borderRadius = '12px';
select.style.border = '2px solid #b2f2d7';
select.style.padding = '12px 16px';
select.style.background = '#f8fff8';
select.style.color = '#222';

const optionDefault = document.createElement('option');
optionDefault.value = '';
optionDefault.disabled = true;
optionDefault.selected = true;
optionDefault.textContent = 'Selecciona el tipo de problema';
select.appendChild(optionDefault);
opcionesProblemas.forEach(op => {
  const opt = document.createElement('option');
  opt.value = op;
  opt.textContent = op;
  select.appendChild(opt);
});
asuntoInput.parentNode.replaceChild(select, asuntoInput);

document.getElementById('formReporte').onsubmit = async function(e) {
  e.preventDefault();
  const asunto = document.getElementById('asuntoReporte').value;
  const descripcion = document.getElementById('descReporte').value.trim();
  // Obtener id_usuario desde localStorage (debe estar guardado al iniciar sesión)
  let id_usuario = null;
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.id_usuario) id_usuario = usuario.id_usuario;
  } catch (e) {}
  if (!id_usuario) {
    document.getElementById('reporteMsg').textContent = 'No se pudo identificar el usuario. Por favor, cierra sesión y vuelve a iniciar.';
    document.getElementById('reporteMsg').style.color = '#e53935';
    return;
  }
  try {
    const res = await fetch('/api/reportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, asunto, descripcion })
    });
    if (res.ok) {
      document.getElementById('reporteMsg').textContent = '¡Reporte enviado correctamente!';
      document.getElementById('reporteMsg').style.color = '#4caf50';
      formReporte.reset();
      select.selectedIndex = 0;
    } else {
      const data = await res.json();
      document.getElementById('reporteMsg').textContent = data.error || 'Error al enviar el reporte.';
      document.getElementById('reporteMsg').style.color = '#e53935';
    }
  } catch (err) {
    document.getElementById('reporteMsg').textContent = 'Error de conexión con el servidor.';
    document.getElementById('reporteMsg').style.color = '#e53935';
  }
};
