let currentUser = null;
let userPosts = [];

function renderAvatar(user) {
  const avatarElement = document.querySelector('.profile-avatar');
  if (!avatarElement) return;

  if (user?.foto_perfil) {
    avatarElement.style.backgroundImage = `url('${user.foto_perfil}')`;
    avatarElement.textContent = '';
    return;
  }

  const initials = (user?.nombre || 'AG').split(' ').filter(Boolean).map(word => word[0].toUpperCase()).slice(0, 2).join('');
  avatarElement.style.backgroundImage = 'none';
  avatarElement.textContent = initials || 'AG';
}

function renderProfileCards(posts) {
  const grid = document.getElementById('profileGrid');
  if (!grid) return;

  if (!posts.length) {
    grid.innerHTML = '<div class="profile-empty">No hay publicaciones propias por el momento.</div>';
    return;
  }

  grid.innerHTML = posts.map(post => `
    <article class="post-card">
      <img src="${post.foto || createPlaceholderImage(post.titulo)}" alt="${post.titulo}" loading="lazy">
      <div class="post-body">
        <h3>${post.titulo}</h3>
        <p>${post.descripcion || 'Sin descripción'}</p>
        <span class="badge">${post.categoria || 'Producto'}</span>
      </div>
    </article>
  `).join('');
}

async function loadProfile() {
  if (!currentUser) return;
  showLoader();
  try {
    const response = await fetch(`/api/usuarios/${currentUser.id}`);
    if (!response.ok) {
      throw new Error('No se pudo cargar el perfil');
    }

    const user = await response.json();
    currentUser = user;

    document.getElementById('profileName').textContent = user.nombre || 'InterAgro';
    document.getElementById('profileBio').textContent = user.direccion || 'Productor local con productos frescos directos del campo.';
    document.getElementById('profileEmail')?.textContent = user.correo || '';
    document.getElementById('profilePhone')?.textContent = user.telefono || '';
    renderAvatar(user);
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  } finally {
    hideLoader();
  }
}

async function loadUserPublications() {
  if (!currentUser) return;
  showLoader();
  try {
    const response = await fetch(`/api/publicaciones?usuario=${currentUser.id}`);
    if (!response.ok) {
      throw new Error('No se pudieron cargar las publicaciones');
    }

    userPosts = await response.json();
    document.getElementById('profilePosts').textContent = String(userPosts.length);
    renderProfileCards(userPosts);
  } catch (error) {
    console.error('Error al cargar publicaciones propias:', error);
    userPosts = [];
    document.getElementById('profilePosts').textContent = '0';
    renderProfileCards([]);
  } finally {
    hideLoader();
  }
}

async function updateProfileBio(bio) {
  if (!currentUser) return false;
  try {
    const response = await fetch(`/api/usuarios/${currentUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: bio.trim() })
    });
    return response.ok;
  } catch (error) {
    console.error('Error al actualizar la biografía:', error);
    return false;
  }
}

async function uploadAvatar(file) {
  if (!currentUser || !file) return false;
  const formData = new FormData();
  formData.append('usuarioId', currentUser.id);
  formData.append('foto_perfil', file);

  showLoader();
  try {
    const response = await fetch('/api/usuarios/subir-foto-perfil', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al subir la imagen');
    }
    return true;
  } catch (error) {
    console.error('Error al subir avatar:', error);
    alert(error.message || 'No se pudo subir la foto de perfil.');
    return false;
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;
  currentUser = user;

  document.getElementById('btnEditProfile')?.addEventListener('click', () => {
    const bioInput = document.getElementById('bioInput');
    if (bioInput) {
      bioInput.value = currentUser?.direccion || '';
    }
    document.getElementById('profileModal')?.classList.add('show');
  });

  document.getElementById('closeProfileModal')?.addEventListener('click', () => {
    document.getElementById('profileModal')?.classList.remove('show');
  });

  document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const avatarInput = document.getElementById('avatarInput');
    const bioInput = document.getElementById('bioInput');
    const newBio = bioInput?.value || '';
    let success = true;

    if (avatarInput?.files?.length) {
      success = await uploadAvatar(avatarInput.files[0]);
    }

    if (newBio.trim()) {
      const updated = await updateProfileBio(newBio);
      if (!updated) success = false;
    }

    if (success) {
      await loadProfile();
      avatarInput.value = '';
      document.getElementById('profileModal')?.classList.remove('show');
    }
  });

  loadProfile();
  loadUserPublications();
});
