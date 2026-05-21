const loaderOverlay = document.getElementById('loaderOverlay');

function showLoader() {
  if (loaderOverlay) loaderOverlay.classList.add('visible');
}

function hideLoader() {
  if (loaderOverlay) loaderOverlay.classList.remove('visible');
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch {
    return null;
  }
}

function saveUsuario(user) {
  if (!user) return;
  localStorage.setItem('usuario', JSON.stringify(user));
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function authHeaders() {
  const user = getCurrentUser();
  return user ? { 'X-Usuario-Id': String(user.id) } : {};
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function sanitizedText(text) {
  return text ? String(text).trim() : '';
}

function createPlaceholderImage(title) {
  const initials = title
    .split(' ')
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'%3E%3Crect width='600' height='450' fill='%23e6f2ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='80' fill='%23147a5e'%3E${initials}%3C/text%3E%3C/svg%3E`;
}
