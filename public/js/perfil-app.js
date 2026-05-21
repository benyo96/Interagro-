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
    <article class="post-card" data-id="${post.id_publicacion}">
      <div class="post-image-wrap">
        <img src="${post.foto || createPlaceholderImage(post.titulo)}" alt="${post.titulo}" loading="lazy">
        <div class="post-actions">
          <button class="icon-btn edit-post" data-id="${post.id_publicacion}" title="Editar publicación"><i class="fa fa-pen"></i></button>
          <button class="icon-btn delete-post" data-id="${post.id_publicacion}" title="Eliminar publicación"><i class="fa fa-trash-alt"></i></button>
        </div>
      </div>
      <div class="post-body">
        <div class="post-headline">
          <h3>${post.titulo}</h3>
          <span class="post-price">${typeof formatCurrency === 'function' ? formatCurrency(post.precio) : post.precio}</span>
        </div>
        <p>${post.descripcion || 'Sin descripción'}</p>
        <div class="post-footer">
          <span class="badge">${post.categoria || 'Producto'}</span>
          <small>${post.fecha ? new Date(post.fecha).toLocaleDateString('es-CO') : ''}</small>
        </div>
      </div>
    </article>
  `).join('');
}

function openEditPostModal(post) {
  const editPostModal = document.getElementById('editPostModal');
  const editPostTitle = document.getElementById('editPostTitle');
  const editPostDescription = document.getElementById('editPostDescription');
  const editPostPrice = document.getElementById('editPostPrice');
  const editPostCategory = document.getElementById('editPostCategory');

  if (!editPostModal || !post) return;

  editPostModal.dataset.postId = String(post.id_publicacion);
  if (editPostTitle) editPostTitle.value = post.titulo || '';
  if (editPostDescription) editPostDescription.value = post.descripcion || '';
  if (editPostPrice) editPostPrice.value = post.precio || '';
  if (editPostCategory) editPostCategory.value = post.categoria || '';
  editPostModal.classList.add('show');
}

async function fetchPostById(id) {
  try {
    const response = await fetch(`/api/publicaciones/${id}`);
    if (!response.ok) throw new Error('No se pudo cargar la publicación');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadProfile() {
  if (!currentUser) return;
  showLoader();
  try {
    const response = await fetch(`/api/usuarios/${currentUser.id}`, {
      headers: authHeaders()
    });
    if (!response.ok) {
      throw new Error('No se pudo cargar el perfil');
    }

    const user = await response.json();
    currentUser = user;
    saveUsuario(user);

    document.getElementById('profileName').textContent = user.nombre || 'InterAgro';
    document.getElementById('profileBio').textContent = user.direccion || 'Productor local con productos frescos directos del campo.';
    const profileEmailElem = document.getElementById('profileEmail');
    if (profileEmailElem) profileEmailElem.textContent = user.correo || '';
    const profilePhoneElem = document.getElementById('profilePhone');
    if (profilePhoneElem) profilePhoneElem.textContent = user.telefono || '';
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

async function updateProfile(data) {
  if (!currentUser) return false;
  try {
    const response = await fetch(`/api/usuarios/${currentUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
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
      headers: authHeaders(),
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

  const profileModal = document.getElementById('profileModal');
  const createPostModal = document.getElementById('createPostModal');
  const bioInput = document.getElementById('bioInput');
  const avatarInput = document.getElementById('avatarInput');
  const postTitle = document.getElementById('postTitle');
  const postDescription = document.getElementById('postDescription');
  const postPrice = document.getElementById('postPrice');
  const postCategory = document.getElementById('postCategory');
  const postPhoto = document.getElementById('postPhoto');

  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnCreatePost = document.getElementById('btnCreatePost');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const closeCreatePostModal = document.getElementById('closeCreatePostModal');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const savePostBtn = document.getElementById('savePostBtn');
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const btnLogout = document.getElementById('btnLogout');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const editPostModal = document.getElementById('editPostModal');
  const closeEditPostModal = document.getElementById('closeEditPostModal');
  const saveEditPostBtn = document.getElementById('saveEditPostBtn');
  const editPostTitle = document.getElementById('editPostTitle');
  const editPostDescription = document.getElementById('editPostDescription');
  const editPostPrice = document.getElementById('editPostPrice');
  const editPostCategory = document.getElementById('editPostCategory');
  const profileGrid = document.getElementById('profileGrid');

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('show');
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('show');
  };

  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', () => {
      if (bioInput) {
        bioInput.value = currentUser?.direccion || '';
      }
      openModal(profileModal);
    });
  }

  if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => closeModal(profileModal));
  }

  const passwordInput = document.getElementById('passwordInput');

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
      let success = true;
      const newBio = bioInput?.value || '';
      const newPassword = passwordInput?.value || '';
      const payload = {};

      if (newBio.trim()) {
        payload.bio = newBio.trim();
      }
      if (newPassword.trim()) {
        payload.contrasena = newPassword.trim();
      }

      if (avatarInput?.files?.length) {
        success = await uploadAvatar(avatarInput.files[0]);
      }

      if (Object.keys(payload).length) {
        const updated = await updateProfile(payload);
        if (!updated) success = false;
      }

      if (!avatarInput?.files?.length && !Object.keys(payload).length) {
        alert('No hay cambios para guardar.');
        return;
      }

      if (success) {
        await loadProfile();
        if (avatarInput) avatarInput.value = '';
        if (passwordInput) passwordInput.value = '';
        closeModal(profileModal);
      }
    });
  }

  if (profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', () => {
      if (!settingsMenu) return;
      settingsMenu.classList.toggle('show');
    });
  }

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      if (settingsMenu) settingsMenu.classList.remove('show');
      alert('Aquí puedes agregar más opciones de configuración en el futuro.');
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      window.location.href = 'login.html';
    });
  }

  document.addEventListener('click', (event) => {
    if (!settingsMenu || !profileSettingsBtn) return;
    if (settingsMenu.contains(event.target) || profileSettingsBtn.contains(event.target)) return;
    settingsMenu.classList.remove('show');
  });

  if (btnCreatePost) {
    btnCreatePost.addEventListener('click', () => openModal(createPostModal));
  }

  if (closeCreatePostModal) {
    closeCreatePostModal.addEventListener('click', () => closeModal(createPostModal));
  }

  if (savePostBtn) {
    savePostBtn.addEventListener('click', async () => {
      showLoader();
      try {
        const title = postTitle?.value.trim();
        const description = postDescription?.value.trim();
        const price = postPrice?.value;
        const category = postCategory?.value;

        if (!title || !price || !category) {
          alert('Por favor completa todos los campos requeridos');
          return;
        }

        if (!postPhoto?.files?.length) {
          alert('Por favor selecciona una foto');
          return;
        }

        const formData = new FormData();
        formData.append('id_usuario', currentUser.id);
        formData.append('titulo', title);
        formData.append('descripcion', description || '');
        formData.append('precio', parseFloat(price));
        formData.append('categoria', category);
        formData.append('foto', postPhoto.files[0]);

        const response = await fetch('/api/publicaciones', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear la publicación');
        }

        alert('Publicación creada exitosamente');
        closeModal(createPostModal);
        if (postTitle) postTitle.value = '';
        if (postDescription) postDescription.value = '';
        if (postPrice) postPrice.value = '';
        if (postCategory) postCategory.value = '';
        if (postPhoto) postPhoto.value = '';

        await loadUserPublications();
      } catch (error) {
        console.error('Error al crear publicación:', error);
        alert(error.message || 'No se pudo crear la publicación');
      } finally {
        hideLoader();
      }
    });
  }

  if (closeEditPostModal) {
    closeEditPostModal.addEventListener('click', () => closeModal(editPostModal));
  }

  if (profileGrid) {
    profileGrid.addEventListener('click', async (event) => {
      const editBtn = event.target.closest('.edit-post');
      const deleteBtn = event.target.closest('.delete-post');
      if (editBtn) {
        const postId = editBtn.dataset.id;
        const post = await fetchPostById(postId);
        if (post) openEditPostModal(post);
        return;
      }
      if (deleteBtn) {
        const postId = deleteBtn.dataset.id;
        if (!postId) return;
        const confirmed = confirm('¿Seguro que deseas eliminar esta publicación?');
        if (!confirmed) return;
        showLoader();
        try {
          const response = await fetch(`/api/publicaciones/${postId}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'No se pudo eliminar la publicación');
          }
          await loadUserPublications();
        } catch (error) {
          console.error(error);
          alert(error.message || 'No se pudo eliminar la publicación');
        } finally {
          hideLoader();
        }
      }
    });
  }

  if (saveEditPostBtn) {
    saveEditPostBtn.addEventListener('click', async () => {
      if (!editPostModal) return;
      const postId = editPostModal.dataset.postId;
      if (!postId) return;

      const title = editPostTitle?.value.trim();
      const description = editPostDescription?.value.trim();
      const price = editPostPrice?.value;
      const category = editPostCategory?.value;

      if (!title || !price || !category) {
        alert('Por favor completa los campos obligatorios para actualizar la publicación.');
        return;
      }

      const payload = {
        titulo: title,
        descripcion: description,
        precio: parseFloat(price),
        categoria: category
      };

      showLoader();
      try {
        const response = await fetch(`/api/publicaciones/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al actualizar la publicación');
        }
        alert('Publicación actualizada correctamente');
        closeModal(editPostModal);
        await loadUserPublications();
      } catch (error) {
        console.error(error);
        alert(error.message || 'No se pudo actualizar la publicación');
      } finally {
        hideLoader();
      }
    });
  }

  loadProfile();
  loadUserPublications();
});
