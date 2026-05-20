let currentUser = null;
let inbox = [];
let activeChatId = null;
let activeChatName = '';
let activeMessages = [];

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderChatList() {
  const list = document.getElementById('chatList');
  if (!list) return;

  if (!inbox.length) {
    list.innerHTML = '<div class="chat-empty">No tienes conversaciones aún. Inicia un chat con otro usuario desde el buscador o agrega publicaciones.</div>';
    return;
  }

  list.innerHTML = inbox.map(chat => `
    <article class="chat-item ${chat.otro_usuario === activeChatId ? 'active' : ''}" data-chat-id="${chat.otro_usuario}" data-chat-name="${chat.nombre_usuario}">
      <h3>${chat.nombre_usuario || 'Usuario'}</h3>
      <p>${chat.ultimo_mensaje || 'Sin mensajes aún'}</p>
      <span class="chat-meta">${formatTimestamp(chat.ultima_fecha)}</span>
    </article>
  `).join('');

  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      const chatId = Number(item.dataset.chatId);
      const chatName = item.dataset.chatName;
      if (!isNaN(chatId)) {
        openChat(chatId, chatName);
      }
    });
  });
}

function renderChatView() {
  const view = document.getElementById('chatView');
  if (!view) return;

  if (!activeChatId) {
    view.innerHTML = '<div class="chat-empty">Selecciona una conversación para comenzar.</div>';
    return;
  }

  view.innerHTML = `
    <div class="chat-panel">
      <div class="chat-panel-header">
        <div>
          <p class="eyebrow">Chat con</p>
          <h3>${activeChatName || 'Usuario'}</h3>
        </div>
      </div>
      <div class="chat-messages">${activeMessages.length ? activeMessages.map(message => `
        <div class="chat-bubble ${message.id_remitente === currentUser.id ? 'outgoing' : 'incoming'}">
          <div class="message-text">${message.mensaje}</div>
          <div class="message-time">${formatTimestamp(message.fecha)}</div>
        </div>
      `).join('') : '<div class="chat-empty">No hay mensajes en esta conversación.</div>'}</div>
      <div class="chat-input-row">
        <input id="messageInput" type="text" placeholder="Escribe un mensaje..." autocomplete="off">
        <button id="sendMessageBtn" class="btn-primary">Enviar</button>
      </div>
    </div>
  `;

  document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
  document.getElementById('messageInput')?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  });
}

async function loadInbox() {
  if (!currentUser) return;
  showLoader();
  try {
    const response = await fetch(`/api/mensajes/inbox/${currentUser.id}`);
    if (!response.ok) {
      inbox = [];
      return;
    }
    inbox = await response.json();
  } catch (error) {
    console.error('Error al cargar conversaciones:', error);
    inbox = [];
  } finally {
    renderChatList();
    hideLoader();
  }
}

async function loadConversation(otroId) {
  if (!currentUser || !otroId) return;
  showLoader();
  try {
    const url = new URL('/api/mensajes/conversacion', window.location.origin);
    url.searchParams.set('id_usuario', currentUser.id);
    url.searchParams.set('otro_usuario', otroId);
    const response = await fetch(url);
    if (!response.ok) {
      activeMessages = [];
      return;
    }
    activeMessages = await response.json();
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
    activeMessages = [];
  } finally {
    renderChatView();
    hideLoader();
  }
}

function openChat(chatId, nombre) {
  activeChatId = chatId;
  activeChatName = nombre || '';
  renderChatList();
  loadConversation(chatId);
}

async function sendMessage() {
  if (!currentUser || !activeChatId) return;
  const input = document.getElementById('messageInput');
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  try {
    const response = await fetch('/api/mensajes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_remitente: currentUser.id,
        id_destinatario: activeChatId,
        mensaje: texto
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo enviar el mensaje');
    }

    input.value = '';
    await loadConversation(activeChatId);
    await loadInbox();
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    alert(error.message || 'No se pudo enviar el mensaje.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;
  currentUser = user;
  loadInbox();
});
