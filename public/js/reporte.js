document.getElementById('formReporte').onsubmit = function(e) {
  e.preventDefault();
  document.getElementById('reporteMsg').textContent = '¡Reporte enviado! (Funcionalidad de backend pendiente)';
};
