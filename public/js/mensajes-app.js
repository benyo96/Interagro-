const sampleChats = [
  {
    id: 1,
    partner: 'María',
    subtitle: 'Interesada en tomates cherry',
    messages: [
      { from: 'other', text: 'Hola, ¿todavía tienes tomates cherry?', time: '10:05' },
      { from: 'me', text: 'Sí, tengo una caja disponible para hoy.', time: '10:08' }
    ]
  },
  {
    id: 2,
    partner: 'Andrés',
    subtitle: 'Consulta sobre maíz',
    messages: [
      { from: 'other', text: '¿Cuánto cuesta el maíz dulce?', time: 'ayer' },
      { from: 'me', text: 'COP 42.000 por paquete. Puedo reservarlo para ti.', time: 'ayer' }
    ]
  },
  {
    id: 3,
    partner: 'Carla',
    subtitle: '¿Envíos disponibles?',
    messages: [
      { from: 'other', text: '¿Haces entregas cerca de la ciudad?', time: 'hace 2 días' }
    ]
  }
];

let chats = [];
let activeChatId = null;

function saveChats() {
  localStorage.setItem('interagro_chats', JSON.stringify(chats));
}

function renderChatList() {
  const list = document.getElementById('chatList');
  if (!list) return;

  list.innerHTML = chats.map(chat => `
    <article class="chat-item ${chat.id === activeChatId ? 'active' : ''}" data-chat-id="${chat.id}">
      <h3>${chat.partner}</h3>
      <p>${chat.subtitle}</p>
    </article>
  `).join('');

  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      const chatId = Number(item.dataset.chatId);
      openChat(chatId);
    });
  });
}

function renderActiveChat() {
  const view = document.getElementById('chatView');
  if (!view) return;

  const chat = chats.find(item => item.id === activeChatId);
  if (!chat) {
    view.innerHTML = '<div class="chat-empty">Selecciona una conversación para comenzar.</div>';
    return;
  }

  view.innerHTML = `
    <div class="chat-panel">
      <div class="chat-panel-header">
        <div>
          <p class="eyebrow">Chat</p>
          <h3>${chat.partner}</h3>
        </div>
      </div>
      <div class="chat-messages">${chat.messages.map(message => `
        <div class="chat-bubble ${message.from === 'me' ? 'outgoing' : 'incoming'}">${message.text}</div>
      `).join('')}</div>
      <div class="chat-input-row">
        <input id="messageInput" type="text" placeholder="Escribe un mensaje...">
        <button id="sendMessageBtn" class="btn-primary">Enviar</button>
      </div>
    </div>
  `;

  document.getElementById('sendMessageBtn')?.addEventListener('click', () => sendMessage(chat.id));
  document.getElementById('messageInput')?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage(chat.id);
    }
  });
}

function openChat(chatId) {
  activeChatId = chatId;
  renderChatList();
  renderActiveChat();
}

function sendMessage(chatId) {
  const input = document.getElementById('messageInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const chat = chats.find(item => item.id === chatId);
  if (!chat) return;

  chat.messages.push({ from: 'me', text, time: 'Ahora' });
  input.value = '';
  saveChats();
  renderActiveChat();
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  chats = JSON.parse(localStorage.getItem('interagro_chats') || 'null') || sampleChats;
  saveChats();
  renderChatList();
  openChat(chats[0]?.id || null);
});
