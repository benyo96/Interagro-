let deck = [];
let indexCard = 0;
let likedCards = JSON.parse(localStorage.getItem('interagro_likes') || '[]');
let dragState = null;
let isAnimating = false;

function getCardImage(publicacion) {
  if (publicacion.foto) return publicacion.foto;
  if (publicacion.imagen) return publicacion.imagen;
  return createPlaceholderImage(publicacion.titulo || publicacion.categoria || 'Agro');
}

function buildCard(item, position) {
  const card = document.createElement('article');
  card.className = 'card-item';
  card.dataset.index = position;
  card.style.zIndex = `${20 - position}`;
  card.style.transform = `translate(-50%, ${position * 12}px) scale(${1 - position * 0.03})`;
  card.innerHTML = `
    <img src="${getCardImage(item)}" alt="${item.titulo}" loading="lazy">
    <div class="card-body">
      <span class="card-badge">${item.categoria || 'Producto'}</span>
      <h3>${item.titulo}</h3>
      <p>${item.descripcion}</p>
    </div>
    <div class="card-footer">
      <div class="location"><i class="fa fa-map-marker-alt"></i> ${item.ubicacion || 'Ubicación'}</div>
      <div class="location">${formatCurrency(item.precio)}</div>
    </div>
  `;

  if (position === 0) {
    card.classList.add('top-card');
    const detailButton = document.createElement('button');
    detailButton.className = 'ghost-btn';
    detailButton.textContent = 'Ver detalles';
    detailButton.style.margin = '0 22px 18px';
    detailButton.addEventListener('click', () => {
      alert(`${item.titulo}\n\n${item.descripcion}\n\n${formatCurrency(item.precio)}\n${item.ubicacion}`);
    });
    card.append(detailButton);
  }

  return card;
}

function attachTopCardGestures() {
  const topCard = document.querySelector('.card-item.top-card');
  if (!topCard || isAnimating) return;
  topCard.style.touchAction = 'none';
  topCard.onpointerdown = handleCardPointerDown;
}

function handleCardPointerDown(event) {
  if (isAnimating) return;
  const card = event.currentTarget;
  dragState = {
    card,
    startX: event.clientX,
    startY: event.clientY,
    currentX: 0,
    currentY: 0
  };
  card.classList.add('dragging');
  card.setPointerCapture(event.pointerId);
  card.onpointermove = handleCardPointerMove;
  card.onpointerup = handleCardPointerUp;
  card.onpointercancel = handleCardPointerUp;
}

function handleCardPointerMove(event) {
  if (!dragState) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  dragState.currentX = dx;
  dragState.currentY = dy;
  const rotate = dx / 14;
  dragState.card.style.transform = `translate(calc(-50% + ${dx}px), ${dy * 0.4}px) rotate(${rotate}deg)`;
}

function handleCardPointerUp(event) {
  if (!dragState) return;
  const { card, currentX } = dragState;
  card.releasePointerCapture(event.pointerId);
  card.onpointermove = null;
  card.onpointerup = null;
  card.onpointercancel = null;
  card.classList.remove('dragging');
  const threshold = 100;
  if (currentX > threshold) {
    swipeTopCard('like');
  } else if (currentX < -threshold) {
    swipeTopCard('pass');
  } else {
    card.style.transition = 'transform 0.2s ease';
    card.style.transform = 'translate(-50%, 0) scale(1)';
    card.addEventListener('transitionend', () => {
      card.style.transition = '';
    }, { once: true });
  }
  dragState = null;
}

function renderDeck() {
  const cardDeck = document.getElementById('cardDeck');
  const cardsLeft = document.getElementById('cardsLeft');
  const matchedCounter = document.getElementById('matchedCounter');

  if (!cardDeck || !cardsLeft || !matchedCounter) return;

  cardDeck.innerHTML = '';
  const visible = deck.slice(indexCard, indexCard + 3);

  if (visible.length === 0) {
    cardDeck.innerHTML = `
      <div class="card-item" style="position:relative; padding: 40px; text-align:center; transform: translate(-50%, 0); left: 50%;">
        <h3>No quedan publicaciones</h3>
        <p>Regresa más tarde o actualiza para ver nuevas opciones frescas.</p>
      </div>
    `;
    cardsLeft.textContent = '0';
    return;
  }

  visible.forEach((item, position) => {
    const card = buildCard(item, position);
    cardDeck.appendChild(card);
  });

  cardsLeft.textContent = String(Math.max(deck.length - indexCard, 0));
  matchedCounter.textContent = `${likedCards.length} likes`;
  attachTopCardGestures();
}

function swipeTopCard(action) {
  if (isAnimating || indexCard >= deck.length) return;
  const topCard = document.querySelector('.card-item.top-card');
  if (!topCard) {
    advanceDeck(action);
    return;
  }

  isAnimating = true;
  const x = action === 'like' ? 220 : -220;
  const rotation = action === 'like' ? 18 : -18;
  topCard.classList.add(action === 'like' ? 'swipe-right' : 'swipe-left');
  topCard.style.transform = `translate(calc(-50% + ${x}px), -20px) rotate(${rotation}deg)`;
  topCard.style.opacity = '0';

  topCard.addEventListener('transitionend', () => {
    advanceDeck(action);
  }, { once: true });
}

function advanceDeck(action) {
  if (action === 'like') {
    likedCards.push(deck[indexCard]);
    localStorage.setItem('interagro_likes', JSON.stringify(likedCards));
  }
  indexCard += 1;
  isAnimating = false;
  renderDeck();
}

async function loadPublicaciones() {
  showLoader();
  try {
    const response = await fetch('/api/publicaciones');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        deck = data;
      }
    }
  } catch (error) {
    console.error('No se pudo cargar publicaciones del servidor:', error);
  } finally {
    renderDeck();
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('btnLike')?.addEventListener('click', () => swipeTopCard('like'));
  document.getElementById('btnPass')?.addEventListener('click', () => swipeTopCard('pass'));
  loadPublicaciones();
});
