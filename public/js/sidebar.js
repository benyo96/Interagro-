// Centralized sidebar / "Más" menu logic
(function(){
  function initMenu(){
    const btnMas = document.getElementById('btnMas');
    const menuMas = document.getElementById('menuMas');
    if (!btnMas || !menuMas) return;

    // toggle
    btnMas.addEventListener('click', (e) => {
      e.stopPropagation();
      menuMas.style.display = (menuMas.style.display === 'none' || menuMas.style.display === '') ? 'block' : 'none';
    });

    // click outside -> close
    document.addEventListener('click', (e) => {
      if (!btnMas.contains(e.target) && !menuMas.contains(e.target)) {
        menuMas.style.display = 'none';
      }
    });

    // helpers
    function defaultMostrarConstruccion(e){
      if (e) e.preventDefault();
      const modal = document.getElementById('modalConstruccion');
      if (modal) modal.style.display = 'flex';
    }

    function callMostrarConstruccion(e){
      // prefer a page-provided function if exists
      if (typeof window.mostrarConstruccion === 'function') return window.mostrarConstruccion(e);
      return defaultMostrarConstruccion(e);
    }

    // menu items
    const actividadBtn = document.getElementById('actividadBtn');
    const guardadoBtn = document.getElementById('guardadoBtn');
    const aparienciaBtn = document.getElementById('aparienciaBtn');
    const reporteBtn = document.getElementById('reporteBtn');
    const cambiarCuentaBtn = document.getElementById('cambiarCuentaBtn');
    const salirBtn = document.getElementById('salirBtn');

    if (actividadBtn) actividadBtn.addEventListener('click', (e) => callMostrarConstruccion(e));
    if (guardadoBtn) guardadoBtn.addEventListener('click', (e) => callMostrarConstruccion(e));
    if (reporteBtn) reporteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const panel = document.getElementById('reportePanel');
      if (panel) panel.style.display = 'block';
      else callMostrarConstruccion(e);
    });
    if (aparienciaBtn) aparienciaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark-mode');
    });
    if (cambiarCuentaBtn) cambiarCuentaBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.clear(); window.location.href = 'login.html'; });
    if (salirBtn) salirBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.clear(); window.location.href = 'login.html'; });

    // ensure menu is hidden initially
    if (!menuMas.style.display) menuMas.style.display = 'none';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMenu);
  else initMenu();
})();
