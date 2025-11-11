// mensajes.js - funcionalidad básica para la vista de mensajes
document.addEventListener('DOMContentLoaded', function(){
  const inboxList = document.getElementById('inboxList');
  const conversacionPanel = document.getElementById('conversacionPanel');

  // Datos de ejemplo
  const users = [
    { id: 'u1', name: 'Ejemplo 1', avatar: '../img/placeholder.jpg', last: '¿Tienes disponibilidad esta semana?', messages: [
      {from:'them', text:'Hola! ¿Tienes disponibilidad esta semana?'},
      {from:'me', text:'Sí, el jueves por la mañana me viene bien.'}
    ]},
    { id: 'u2', name: 'Ejemplo 2', avatar: '../img/placeholder.jpg', last: 'Perfecto, confirmo', messages: [
      {from:'them', text:'Perfecto, confirmo'},
      {from:'me', text:'Genial, nos vemos entonces.'}
    ]}
  ];

  let activeUser = null;

  function renderInbox(){
    inboxList.innerHTML = '';
    users.forEach(u => {
      const item = document.createElement('div');
      item.className = 'chat-item';
      item.dataset.id = u.id;
      item.innerHTML = `
        <img class="avatar" src="${u.avatar}" alt="${u.name}">
        <div class="meta">
          <div class="name">${u.name}</div>
          <div class="last">${u.last}</div>
        </div>
      `;
      item.addEventListener('click', ()=>{
        document.querySelectorAll('.chat-item').forEach(ci=>ci.classList.remove('active'));
        item.classList.add('active');
        loadConversation(u.id);
      });
      inboxList.appendChild(item);
    });
  }

  function loadConversation(id){
    const u = users.find(x=>x.id===id);
    if(!u) return;
    activeUser = u;
    // build header + messages + composer
    conversacionPanel.classList.remove('empty');
    conversacionPanel.innerHTML = `
      <div class="conversacion-header">
        <img src="${u.avatar}" class="avatar" />
        <div class="name">${u.name}</div>
        <div class="actions">
          <div class="icon" title="Llamar">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="icon" title="Videollamada">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="15" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M17 9l4-2v10l-4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
      <div class="messages-list" id="messagesList"></div>
      <div class="compose-bar">
        <label class="btn-ico" title="Emoji">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
        </label>
        <label class="btn-ico" title="Imagen">
          <input type="file" id="fileImage" accept="image/*">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5-4 4-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </label>
        <div class="input-wrap">
          <input id="msgInput" type="text" placeholder="Escribe un mensaje...">
        </div>
        <button class="send-btn" id="sendBtn">Enviar</button>
      </div>
    `;

    const messagesList = document.getElementById('messagesList');
    u.messages.forEach(m => appendMessage(m, messagesList));

    // scroll to bottom
    setTimeout(()=> messagesList.scrollTop = messagesList.scrollHeight, 60);

    // events
    const sendBtn = document.getElementById('sendBtn');
    const msgInput = document.getElementById('msgInput');
    const fileImage = document.getElementById('fileImage');

    sendBtn.onclick = sendMessage;
    msgInput.addEventListener('keydown', function(e){ if(e.key==='Enter'){ sendMessage(); e.preventDefault(); } });

    fileImage.addEventListener('change', function(ev){
      const f = ev.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = function(e){
        appendMessage({from:'me', image: e.target.result}, messagesList);
        messagesList.scrollTop = messagesList.scrollHeight;
      }
      reader.readAsDataURL(f);
      fileImage.value = '';
    });

    function sendMessage(){
      const text = msgInput.value.trim();
      if(!text) return;
      const m = {from:'me', text};
      u.messages.push(m);
      appendMessage(m, messagesList);
      msgInput.value = '';
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }

  function appendMessage(m, container){
    const box = document.createElement('div');
    const cls = m.from === 'me' ? 'bubble sent' : 'bubble received';
    box.className = cls;
    if(m.image){
      const img = document.createElement('img');
      img.src = m.image;
      img.style.maxWidth = '220px';
      img.style.borderRadius = '10px';
      img.style.display = 'block';
      box.appendChild(img);
    }
    if(m.text){
      const p = document.createElement('div');
      p.textContent = m.text;
      box.appendChild(p);
    }
    // container can be messages-list or conversacionPanel when empty
    if(container) container.appendChild(box);
  }

  // init
  renderInbox();
  // select first chat by default
  setTimeout(()=>{
    const first = document.querySelector('.chat-item');
    if(first) first.click();
  },50);
});

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
