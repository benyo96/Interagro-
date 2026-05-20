const samplePerfilPosts = [
  { id: 1, titulo: 'Caja de fresas', categoria: 'Frutas', precio: 38000, imagen: '', descripcion: 'Fresas orgánicas recién cosechadas.' },
  { id: 2, titulo: 'Paquete de calabazas', categoria: 'Verduras', precio: 54000, imagen: '', descripcion: 'Calabazas grandes perfectas para sopas.' },
  { id: 3, titulo: 'Ramos de cilantro', categoria: 'Plantas Aromáticas', precio: 16000, imagen: '', descripcion: 'Cilantro fresco para tus recetas.' },
  { id: 4, titulo: 'Miel natural', categoria: 'Derivados', precio: 72000, imagen: '', descripcion: 'Miel pura de abeja de la región.' }
];

function renderAvatar(user, savedProfile) {
  const avatarElement = document.querySelector('.profile-avatar');
  if (!avatarElement) return;

  if (savedProfile.avatar) {
    avatarElement.style.backgroundImage = `url('${savedProfile.avatar}')`;
    avatarElement.textContent = '';
    return;
  }

  const initials = (user.nombre || 'AG').split(' ').filter(Boolean).map(word => word[0].toUpperCase()).slice(0, 2).join('');
  avatarElement.style.backgroundImage = 'none';
  avatarElement.textContent = initials || 'AG';
}

function saveProfileState(profile) {
  localStorage.setItem('interagro_profile', JSON.stringify(profile));
}

function renderProfileCards(posts) {
  const grid = document.getElementById('profileGrid');
  if (!grid) return;
  grid.innerHTML = posts.map(post => `
    <article class="post-card">
      <img src="${post.imagen || createPlaceholderImage(post.titulo)}" alt="${post.titulo}" loading="lazy">
      <div class="post-body">
        <h3>${post.titulo}</h3>
        <p>${post.descripcion}</p>
        <span class="badge">${post.categoria}</span>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  const nameElement = document.getElementById('profileName');
  const bioElement = document.getElementById('profileBio');
  const postsCount = document.getElementById('profilePosts');
  const editButton = document.getElementById('btnEditProfile');
  const modal = document.getElementById('profileModal');
  const modalClose = document.getElementById('closeProfileModal');
  const saveButton = document.getElementById('saveProfileBtn');
  const bioInput = document.getElementById('bioInput');
  const avatarInput = document.getElementById('avatarInput');

  const savedProfile = JSON.parse(localStorage.getItem('interagro_profile') || '{}');
  const posts = JSON.parse(localStorage.getItem('interagro_posts') || '[]');
  const storedPosts = posts.length ? posts : samplePerfilPosts;
  if (!posts.length) localStorage.setItem('interagro_posts', JSON.stringify(samplePerfilPosts));

  nameElement.textContent = user.nombre || 'InterAgro';
  bioElement.textContent = savedProfile.bio || 'Productor local con productos frescos directos del campo.';
  postsCount.textContent = String(storedPosts.length);
  renderAvatar(user, savedProfile);
  renderProfileCards(storedPosts);

  editButton?.addEventListener('click', () => {
    if (!modal) return;
    bioInput.value = savedProfile.bio || '';
    modal.classList.add('show');
  });

  modalClose?.addEventListener('click', () => {
    modal?.classList.remove('show');
  });

  saveButton?.addEventListener('click', () => {
    const updatedBio = bioInput.value.trim();
    const updatedProfile = {
      ...savedProfile,
      bio: updatedBio
    };

    if (avatarInput?.files?.length) {
      const file = avatarInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        updatedProfile.avatar = reader.result;
        saveProfileState(updatedProfile);
        bioElement.textContent = updatedBio || 'Productor local con productos frescos directos del campo.';
        renderAvatar(user, updatedProfile);
        modal?.classList.remove('show');
      };
      reader.readAsDataURL(file);
      return;
    }

    saveProfileState(updatedProfile);
    bioElement.textContent = updatedBio || 'Productor local con productos frescos directos del campo.';
    modal?.classList.remove('show');
  });
});
