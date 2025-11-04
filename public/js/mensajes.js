
// Salir y cambiar cuenta
document.getElementById('salirBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};
document.getElementById('cambiarCuentaBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

// Cambiar apariencia (modo oscuro/claro)
document.getElementById('aparienciaBtn').onclick = () => {
  document.body.classList.toggle('dark-mode');
};

// Tu actividad (compras/ventas)
document.getElementById('actividadBtn').onclick = async () => {
  hidePanels();
  const id_usuario = localStorage.getItem('id_usuario');
  const panel = document.getElementById('actividadPanel');
  panel.style.display = 'block';
  panel.innerHTML = '<b>Cargando actividad...</b>';
  // Consulta compras y ventas
  const compras = await fetch(`/api/compras/${id_usuario}`).then(r=>r.json());
  const ventas = await fetch(`/api/ventas/${id_usuario}`).then(r=>r.json());
  let html = '<h4>Mis compras</h4>';
  if (compras.length) {
    html += '<ul>' + compras.map(c => `<li>Compra #${c.idcompra} - ${c.fecha}</li>`).join('') + '</ul>';
  } else {
    html += '<p>No tienes compras registradas.</p>';
  }
  html += '<h4>Mis ventas</h4>';
  if (ventas.length) {
    html += '<ul>' + ventas.map(v => `<li>Venta producto: ${v.nombre_productos} - Cantidad: ${v.cantidad}</li>`).join('') + '</ul>';
  } else {
    html += '<p>No tienes ventas registradas.</p>';
  }
  panel.innerHTML = html;
};

// Guardado (favoritos)
document.getElementById('guardadoBtn').onclick = async () => {
  hidePanels();
  const id_usuario = localStorage.getItem('id_usuario');
  const panel = document.getElementById('guardadoPanel');
  panel.style.display = 'block';
  panel.innerHTML = '<b>Cargando guardados...</b>';
  const favoritos = await fetch(`/api/favoritos/${id_usuario}`).then(r=>r.json());
  if (favoritos.length) {
    panel.innerHTML = '<h4>Mis productos guardados</h4><ul>' + favoritos.map(f => `<li>${f.nombre_productos} - $${f.precio}</li>`).join('') + '</ul>';
  } else {
    panel.innerHTML = '<p>No tienes productos guardados.</p>';
  }
};

// Reportar un problema
document.getElementById('reporteBtn').onclick = () => {
  hidePanels();
  document.getElementById('reportePanel').style.display = 'block';
};
document.getElementById('formReporte').onsubmit = async (e) => {
  e.preventDefault();
  const id_usuario = localStorage.getItem('id_usuario');
  const asunto = document.getElementById('asuntoReporte').value;
  const descripcion = document.getElementById('descReporte').value;
  const res = await fetch('/api/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, asunto, descripcion })
  });
  if (res.ok) {
    document.getElementById('reporteMsg').innerText = 'Reporte enviado correctamente.';
    document.getElementById('formReporte').reset();
  } else {
    document.getElementById('reporteMsg').innerText = 'Error al enviar el reporte.';
  }
};

function hidePanels() {
  document.getElementById('actividadPanel').style.display = 'none';
  document.getElementById('guardadoPanel').style.display = 'none';
  document.getElementById('reportePanel').style.display = 'none';
}

// --- Mensajes: Inbox panel ---
async function cargarInbox() {
  const id_usuario = localStorage.getItem('id_usuario');
  if (!id_usuario) return;
  const inboxList = document.getElementById('inboxList');
  inboxList.innerHTML = '<div style="text-align:center;color:#888;padding:24px;">Cargando...</div>';
  try {
    const conversaciones = await fetch(`/api/mensajes/inbox/${id_usuario}`).then(r=>r.json());
    if (!conversaciones.length) {
      inboxList.innerHTML = '<div style="text-align:center;color:#888;padding:24px;">No tienes conversaciones.</div>';
      return;
    }
    inboxList.innerHTML = conversaciones.map(conv => `
      <div class="inbox-item" style="display:flex;align-items:center;gap:14px;padding:14px 22px;cursor:pointer;border-bottom:1px solid #222;transition:background .2s;" onclick="abrirConversacion('${conv.otro_usuario}', '${conv.id_producto || ''}')">
        <img src="img/agricultor.png" alt="Perfil" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
        <div style="flex:1;">
          <div style="font-weight:600;color:#fff;font-size:1.08em;">${conv.nombre_usuario || 'Usuario'}</div>
          ${conv.nombre_productos ? `<div style='color:#4caf50;font-size:.98em;'>${conv.nombre_productos}</div>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    inboxList.innerHTML = '<div style="text-align:center;color:#e53935;padding:24px;">Error al cargar conversaciones.</div>';
  }
}

window.onload = cargarInbox;

// --- Mensajes: Conversación panel ---
async function abrirConversacion(otro_usuario, id_producto) {
  const id_usuario = localStorage.getItem('id_usuario');
  if (!id_usuario) return;
  const panel = document.getElementById('conversacionPanel');
  panel.innerHTML = '<div style="color:#888;padding:32px;text-align:center;">Cargando conversación...</div>';
  try {
    // Fetch mensajes
    let url = `/api/mensajes/conversacion?id_usuario=${id_usuario}&otro_usuario=${otro_usuario}`;
    if (id_producto) url += `&id_producto=${id_producto}`;
    const mensajes = await fetch(url).then(r=>r.json());
    // Fetch usuario info (opcional, para mostrar nombre)
    // Fetch producto info (opcional, para mostrar producto)
    let headerHtml = '';
    if (id_producto) {
      headerHtml += `<div style='color:#4caf50;font-weight:600;font-size:1.08em;margin-bottom:6px;'>Producto: ${mensajes[0]?.nombre_productos || ''}</div>`;
    }
    headerHtml += `<div style='font-weight:700;color:#fff;font-size:1.15em;margin-bottom:8px;'>Chat con usuario #${otro_usuario}</div>`;
    // Mensajes
    let msgsHtml = '<div style="max-height:420px;overflow-y:auto;width:100%;padding:0 8px 0 0;">';
    if (!mensajes.length) {
      msgsHtml += '<div style="color:#888;text-align:center;padding:32px;">No hay mensajes aún.</div>';
    } else {
      msgsHtml += mensajes.map(msg => `
        <div style="margin-bottom:14px;display:flex;${msg.id_remitente==id_usuario?'justify-content:end':'justify-content:start'};">
          <div style="background:${msg.id_remitente==id_usuario?'#4caf50':'#222'};color:#fff;padding:10px 18px;border-radius:14px 14px 14px 4px;max-width:70%;font-size:1.04em;">
            ${msg.mensaje}
            <div style="font-size:.85em;color:#bbb;margin-top:4px;text-align:right;">${new Date(msg.fecha).toLocaleString('es-ES',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</div>
          </div>
        </div>
      `).join('');
    }
    msgsHtml += '</div>';
    // Formulario para enviar mensaje
    const formHtml = `
      <form id='formEnviarMsg' style='display:flex;gap:8px;margin-top:18px;width:100%;max-width:480px;'>
        <input type='text' id='inputMensaje' class='form-control' placeholder='Escribe un mensaje...' required style='flex:1;'>
        <button type='submit' class='btn btn-success'>Enviar</button>
      </form>
      <div id='msgEnvioStatus' style='margin-top:8px;color:#e53935;'></div>
    `;
    panel.innerHTML = `
      <div style='width:100%;max-width:520px;margin:0 auto;padding:32px 0;'>
        ${headerHtml}
        ${msgsHtml}
        ${formHtml}
      </div>
    `;
    // Scroll to bottom
    const msgsDiv = panel.querySelector('div[style*="max-height:420px"]');
    if (msgsDiv) msgsDiv.scrollTop = msgsDiv.scrollHeight;
    // Form submit
    document.getElementById('formEnviarMsg').onsubmit = async function(e) {
      e.preventDefault();
      const mensaje = document.getElementById('inputMensaje').value;
      const res = await fetch('/api/mensajes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_remitente: id_usuario, id_destinatario: otro_usuario, mensaje, id_producto: id_producto||null })
      });
      if (res.ok) {
        document.getElementById('inputMensaje').value = '';
        abrirConversacion(otro_usuario, id_producto); // Recargar conversación
        document.getElementById('msgEnvioStatus').innerText = '';
      } else {
        document.getElementById('msgEnvioStatus').innerText = 'Error al enviar mensaje.';
      }
    };
  } catch (err) {
    panel.innerHTML = '<div style="color:#e53935;padding:32px;text-align:center;">Error al cargar la conversación.</div>';
  }
}
