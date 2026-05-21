let currentUser = null;
let inbox = [];
let activeChatId = null;
let activeChatName = '';
let activeMessages = [];
let draftMessage = '';
let draftSelection = { start: 0, end: 0 };
let isInputFocused = false;
let socket = null;
let typingTimeout = null;
let isTypingSent = false;
let activeTypingUser = null;
let replyToMessage = null;
let notificationPermission = 'default';

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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAvatarInitials(name) {
  const parts = String(name || 'Usuario').trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const seed = String(name || 'usuario').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#1d9c58', '#2b7c4c', '#3a8c6a', '#1f7b5c', '#2b9f6f'];
  return colors[seed % colors.length];
}

function formatPreview(text) {
  if (!text) return '';
  const cleanText = String(text).replace(/\s+/g, ' ').trim();
  return cleanText.length > 40 ? `${cleanText.slice(0, 40)}...` : cleanText;
}

function preserveDraftState() {
  const input = document.getElementById('messageInput');
  if (!input) return;
  draftMessage = input.value;
  draftSelection.start = input.selectionStart ?? draftMessage.length;
  draftSelection.end = input.selectionEnd ?? draftMessage.length;
  isInputFocused = document.activeElement === input;
}

function restoreDraftState(input) {
  if (!input) return;
  input.value = draftMessage;
  if (isInputFocused) {
    input.focus();
    const start = Math.max(0, Math.min(draftSelection.start, input.value.length));
    const end = Math.max(0, Math.min(draftSelection.end, input.value.length));
    input.setSelectionRange(start, end);
  }
  input.addEventListener('input', (event) => {
    draftMessage = event.target.value;
    draftSelection.start = event.target.selectionStart ?? draftMessage.length;
    draftSelection.end = event.target.selectionEnd ?? draftMessage.length;
  });
  input.addEventListener('focus', () => {
    isInputFocused = true;
  });
  input.addEventListener('blur', () => {
    isInputFocused = false;
  });
}

function scrollMessagesToBottom() {
  const container = document.querySelector('.chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function renderChatList() {
  const list = document.getElementById('chatList');
  if (!list) return;

  if (!inbox.length) {
    list.innerHTML = '<div class="chat-empty">No tienes conversaciones aún. Inicia un chat con otro usuario desde el buscador.</div>';
    return;
  }

  list.innerHTML = inbox.map(chat => `
    <article class="chat-item ${chat.otro_usuario === activeChatId ? 'active' : ''}" data-chat-id="${chat.otro_usuario}" data-chat-name="${escapeHtml(chat.nombre_usuario)}">
      <div class="chat-item-avatar" style="background:${getAvatarColor(chat.nombre_usuario)};">${getAvatarInitials(chat.nombre_usuario)}</div>
      <div class="chat-item-content">
        <div class="chat-item-main">
          <div>
            <h3>${escapeHtml(chat.nombre_usuario || 'Usuario')}</h3>
            <p>${escapeHtml(formatPreview(chat.ultimo_mensaje || 'Sin mensajes aún'))}</p>
          </div>
          <div class="chat-item-meta">
            <span>${formatTimestamp(chat.ultima_fecha)}</span>
            ${chat.mensajes_sin_leer > 0 ? `<span class="chat-unread-badge">${chat.mensajes_sin_leer}</span>` : ''}
          </div>
        </div>
      </div>
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

  preserveDraftState();

  view.innerHTML = `
    <div class="chat-panel">
      <div class="chat-panel-header">
        <div>
          <p class="eyebrow">Chat con</p>
          <h3>${escapeHtml(activeChatName || 'Usuario')}</h3>
          <p id="typingIndicator" class="typing-indicator"></p>
        </div>
        <span class="chat-status">Conectado</span>
      </div>
      <div class="chat-messages">${activeMessages.length ? activeMessages.map(message => `
        <div class="chat-bubble ${message.id_remitente === currentUser.id ? 'outgoing' : 'incoming'}" data-message-id="${message.id}">
          <div class="message-row">
            <div class="message-text">
              ${message.reply_to_text ? `<div class="reply-context">${escapeHtml(formatPreview(message.reply_to_text))}</div>` : ''}
              ${escapeHtml(message.mensaje)}
            </div>
          </div>
          <div class="message-menu">
            <button class="message-menu-btn" type="button" data-message-id="${message.id}" aria-label="Mostrar acciones">⋮</button>
            <div class="message-menu-dropdown" data-message-id="${message.id}">
              <button class="message-action copy" data-message-id="${message.id}" type="button">Copiar</button>
              <button class="message-action reply" data-message-id="${message.id}" type="button">Responder</button>
              ${message.id_remitente === currentUser.id ? `<button class="message-action delete" data-message-id="${message.id}" type="button">Eliminar</button>` : ''}
            </div>
          </div>
          <div class="message-info">
            <span class="message-time">${formatTimestamp(message.fecha)}</span>
            ${message.id_remitente === currentUser.id ? `<span class="message-status">${escapeHtml(message.status || (message.leido ? 'Visto' : 'Enviado'))}</span>` : ''}
          </div>
        </div>
      `).join('') : '<div class="chat-empty">No hay mensajes en esta conversación.</div>'}</div>
      ${replyToMessage ? `<div class="reply-preview">
        <div class="reply-preview-label">Respondiendo a</div>
        <div class="reply-preview-text">${escapeHtml(formatPreview(replyToMessage.mensaje))}</div>
        <button id="clearReplyBtn" class="reply-preview-clear" type="button">✕</button>
      </div>` : ''}
      <div class="chat-input-row">
        <input id="messageInput" type="text" placeholder="Escribe un mensaje..." autocomplete="off" aria-label="Escribe un mensaje">
        <button id="sendMessageBtn" type="button" class="btn btn-primary">Enviar</button>
      </div>
    </div>
  `;

  const input = document.getElementById('messageInput');
  restoreDraftState(input);
  updateTypingIndicator();

  document.querySelectorAll('.message-menu-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const messageId = button.dataset.messageId;
      const dropdown = document.querySelector(`.message-menu-dropdown[data-message-id="${messageId}"]`);
      if (!dropdown) return;
      const isOpen = dropdown.classList.contains('open');
      closeAllMessageMenus();
      if (!isOpen) {
        dropdown.classList.add('open');
        positionMessageMenu(dropdown, button);
      }
    });
  });

  document.querySelectorAll('.message-menu-dropdown .message-action').forEach(button => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const messageId = button.dataset.messageId;
      if (!messageId) return;
      closeAllMessageMenus();
      if (button.classList.contains('copy')) {
        copyMessage(messageId);
        return;
      }
      if (button.classList.contains('reply')) {
        const message = activeMessages.find(item => String(item.id) === String(messageId));
        if (message) {
          setReplyToMessage(message);
        }
        return;
      }
      if (button.classList.contains('delete')) {
        if (confirm('¿Deseas eliminar este mensaje?')) {
          await deleteMessage(messageId);
        }
      }
    });
  });

  document.getElementById('clearReplyBtn')?.addEventListener('click', () => {
    replyToMessage = null;
    renderChatView();
  });

  document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
  document.getElementById('messageInput')?.addEventListener('input', () => {
    sendTypingStatus();
  });
  document.getElementById('messageInput')?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  });

  scrollMessagesToBottom();
}

function closeAllMessageMenus() {
  document.querySelectorAll('.message-menu-dropdown.open').forEach(dropdown => {
    dropdown.classList.remove('open');
    dropdown.classList.remove('open-up');
  });
}

function positionMessageMenu(dropdown, button) {
  dropdown.classList.remove('open-up');
  const rect = dropdown.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const margin = 12;
  if (rect.bottom + margin > viewportHeight) {
    dropdown.classList.add('open-up');
  }
}

function updateTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (!indicator) return;
  indicator.textContent = activeTypingUser === activeChatId ? `${escapeHtml(activeChatName || 'Usuario')} está escribiendo...` : '';
}

async function loadInbox(showLoading = true) {
  if (!currentUser) return;
  if (showLoading) showLoader();
  try {
    const response = await fetch(`/api/mensajes/inbox/${currentUser.id}`, {
      headers: authHeaders()
    });
    if (!response.ok) {
      inbox = [];
      return;
    }
    inbox = (await response.json()).map(chat => ({
      ...chat,
      otro_usuario: Number(chat.otro_usuario),
      mensajes_sin_leer: Number(chat.mensajes_sin_leer || 0)
    }));
  } catch (error) {
    console.error('Error al cargar conversaciones:', error);
    inbox = [];
  } finally {
    renderChatList();
    if (!activeChatId && inbox.length) {
      await openChat(inbox[0].otro_usuario, inbox[0].nombre_usuario || 'Usuario');
    }
    if (showLoading) hideLoader();
  }
}

async function loadConversation(otroId, showLoading = true) {
  if (!currentUser || !otroId) return;
  if (showLoading) showLoader();
  try {
    const url = new URL('/api/mensajes/conversacion', window.location.origin);
    url.searchParams.set('id_usuario', currentUser.id);
    url.searchParams.set('otro_usuario', otroId);
    const response = await fetch(url, {
      headers: authHeaders()
    });
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
    if (showLoading) hideLoader();
    markConversationRead(otroId);
  }
}

async function openChat(chatId, nombre) {
  activeChatId = Number(chatId);
  activeChatName = nombre || '';
  draftMessage = '';
  draftSelection = { start: 0, end: 0 };
  isInputFocused = false;
  replyToMessage = null;
  renderChatList();
  await loadConversation(activeChatId);
}

async function deleteMessage(messageId) {
  if (!currentUser || !messageId) return;
  try {
    const response = await fetch(`/api/mensajes/${messageId}?id_usuario=${currentUser.id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo eliminar el mensaje');
    }
    await loadConversation(activeChatId, false);
    await loadInbox(false);
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    alert(error.message || 'No se pudo eliminar el mensaje.');
  }
}

function findMessageIndex(messageId) {
  return activeMessages.findIndex(message => String(message.id) === String(messageId));
}

function updateMessageStatus(messageId, status) {
  const index = findMessageIndex(messageId);
  if (index === -1) return;
  activeMessages[index].status = status;
  renderChatView();
}

function copyMessage(messageId) {
  const message = activeMessages.find(item => String(item.id) === String(messageId));
  if (!message) return;
  navigator.clipboard.writeText(message.mensaje).then(() => {
    console.log('Mensaje copiado');
  }).catch(() => {
    alert('No se pudo copiar el mensaje.');
  });
}

function setReplyToMessage(message) {
  replyToMessage = {
    id: message.id,
    mensaje: message.mensaje
  };
  renderChatView();
}

function addOrReplaceMessage(message) {
  const index = findMessageIndex(message.id);
  if (index !== -1) {
    activeMessages[index] = { ...activeMessages[index], ...message };
  } else {
    activeMessages.push(message);
  }
}

function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  notificationPermission = Notification.permission;
  if (notificationPermission === 'default') {
    Notification.requestPermission().then((permission) => {
      notificationPermission = permission;
    });
  }
}

function showIncomingNotification(message) {
  if (!('Notification' in window) || notificationPermission !== 'granted') return;
  if (!document.hidden) return;

  const notification = new Notification('Mensaje nuevo', {
    body: message.mensaje,
    silent: true
  });

  notification.onclick = () => {
    window.focus();
  };
}

function playIncomingSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    console.error('Error al reproducir sonido de notificación:', error);
  }
}

async function markConversationRead(otroId) {
  if (!currentUser || !otroId) return;
  if (socket && socket.connected) {
    socket.emit('markAsRead', { conversationWith: otroId });
  }
  try {
    await fetch('/api/mensajes/leer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        id_usuario: currentUser.id,
        otro_usuario: otroId
      })
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
  }
}

function handleIncomingMessage(message) {
  if (!message || Number(message.id_destinatario) !== Number(currentUser.id)) return;
  loadInbox(false);
  if (Number(activeChatId) === Number(message.id_remitente)) {
    addOrReplaceMessage(message);
    renderChatView();
    playIncomingSound();
    showIncomingNotification(message);
    markConversationRead(message.id_remitente);
  } else {
    playIncomingSound();
    showIncomingNotification(message);
  }
}

function sendTypingStatus() {
  if (!socket || !socket.connected || !activeChatId) return;
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  if (!isTypingSent) {
    socket.emit('typing', { toUserId: activeChatId, isTyping: true });
    isTypingSent = true;
  }
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { toUserId: activeChatId, isTyping: false });
    isTypingSent = false;
  }, 900);
}

async function sendMessage() {
  if (!currentUser || !activeChatId) return;
  const input = document.getElementById('messageInput');
  const button = document.getElementById('sendMessageBtn');
  if (!input || !button) return;

  const texto = input.value.trim();
  if (!texto) return;

  const pendingMessage = {
    id: `pending-${Date.now()}`,
    id_remitente: currentUser.id,
    id_destinatario: activeChatId,
    mensaje: texto,
    fecha: new Date().toISOString(),
    status: 'Enviando...'
  };

  activeMessages.push(pendingMessage);
  renderChatView();
  scrollMessagesToBottom();

  button.disabled = true;
  try {
    if (socket && socket.connected) {
      socket.emit('sendMessage', {
        id_remitente: currentUser.id,
        id_destinatario: activeChatId,
        mensaje: texto
      }, async (response) => {
        if (!response?.success) {
          alert(response?.error || 'No se pudo enviar el mensaje.');
          await loadConversation(activeChatId, false);
          button.disabled = false;
          return;
        }
        input.value = '';
        draftMessage = '';
        replyToMessage = null;
        await loadConversation(activeChatId, false);
        await loadInbox(false);
        button.disabled = false;
      });
    } else {
      const response = await fetch('/api/mensajes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
      draftMessage = '';
      replyToMessage = null;
      await loadConversation(activeChatId, false);
      await loadInbox(false);
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    alert(error.message || 'No se pudo enviar el mensaje.');
  } finally {
    button.disabled = false;
  }
}

function connectSocket() {
  if (!window.io) return;
  socket = io({ transports: ['websocket'] });

  socket.on('connect', () => {
    socket.emit('registerUser', currentUser.id);
  });

  socket.on('newMessage', (message) => {
    handleIncomingMessage(message);
  });

  socket.on('userTyping', ({ fromUserId, isTyping }) => {
    activeTypingUser = isTyping && Number(fromUserId) === Number(activeChatId) ? Number(fromUserId) : null;
    updateTypingIndicator();
  });

  socket.on('messageDelivered', ({ messageId }) => {
    updateMessageStatus(messageId, 'Entregado');
  });

  socket.on('messageRead', ({ readerId }) => {
    if (Number(readerId) === Number(activeChatId)) {
      activeMessages.forEach((message) => {
        if (message.id_remitente === currentUser.id) {
          message.leido = 1;
          message.status = 'Visto';
        }
      });
      renderChatView();
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión socket:', error);
  });

  window.addEventListener('beforeunload', () => {
    if (socket) {
      socket.disconnect();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;
  currentUser = user;
  currentUser.id = Number(currentUser.id);

  requestNotificationPermission();

  document.getElementById('refreshChats')?.addEventListener('click', async () => {
    await loadInbox();
    if (activeChatId) {
      await loadConversation(activeChatId, false);
    }
  });

  document.addEventListener('click', () => {
    closeAllMessageMenus();
  });

  const pendingChat = JSON.parse(localStorage.getItem('pendingChat') || 'null');
  if (pendingChat?.id && pendingChat.id !== currentUser.id) {
    localStorage.removeItem('pendingChat');
    await openChat(pendingChat.id, pendingChat.name || 'Usuario');
  }

  await loadInbox();
  connectSocket();
});
