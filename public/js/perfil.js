
// --- Estado y elementos ---
let descripcion = localStorage.getItem('perfil_descripcion') || '';
let elements = {};
// --- Menú Más ---
if (btnMas) {
  btnMas.addEventListener('click', (e) => {
    e.stopPropagation();
    // menuMas may be injected later, get it dynamically
    const m = document.getElementById('menuMas') || menuMas;
    if (!m) return;
    const currentlyHidden = !m.style.display || m.style.display === 'none';
    m.style.display = currentlyHidden ? 'block' : 'none';
  });
}
document.addEventListener('click', (e) => {
  const m = document.getElementById('menuMas') || menuMas;
  if (!m || !btnMas) return;
  if (!btnMas.contains(e.target) && !m.contains(e.target)) {
    m.style.display = 'none';
  }
});

// --- Salir y cambiar cuenta ---
const salirBtn = document.getElementById('salirBtn');
if (salirBtn) {
  salirBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}
const cambiarCuentaBtn = document.getElementById('cambiarCuentaBtn');
if (cambiarCuentaBtn) {
  cambiarCuentaBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

// --- Cambiar apariencia ---
const aparienciaBtn = document.getElementById('aparienciaBtn');
if (aparienciaBtn) {
  aparienciaBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

// --- Editar perfil ---
btnEditarPerfil.onclick = () => {
  inputDescripcion.value = descripcion;
  modalEditarPerfil.style.display = 'flex';
  // Mostrar foto actual en input
  if (localStorage.getItem('perfil_foto')) {
    perfilFoto.src = localStorage.getItem('perfil_foto');
  }
  if (document.getElementById('inputFotoPerfil')) {
    document.getElementById('inputFotoPerfil').value = '';
  }
};
if (cerrarModalEditarPerfil) {
  cerrarModalEditarPerfil.addEventListener('click', () => {
    modalEditarPerfil.style.display = 'none';
  });
}
if (guardarDescripcion) {
  guardarDescripcion.addEventListener('click', () => {
    try {
      console.log('Guardar perfil: click');
      descripcion = inputDescripcion.value.trim();
      localStorage.setItem('perfil_descripcion', descripcion);
      // Guardar foto de perfil si se seleccionó
      const fotoInput = document.getElementById('inputFotoPerfil');
      if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        const file = fotoInput.files[0];
        console.log('Foto seleccionada:', file.name, file.type, file.size);
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            // Reducir tamaño de la imagen antes de guardar para evitar exceder localStorage
            const originalDataUrl = e.target.result;
            const img = new Image();
            img.onload = function() {
              const MAX_DIM = 800;
              let w = img.width;
              let h = img.height;
              if (w > MAX_DIM || h > MAX_DIM) {
                const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
              }
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              // Comprimir a JPEG para ahorrar espacio
              const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              try {
                localStorage.setItem('perfil_foto', resizedDataUrl);
                // Actualizar UI inmediatamente
                if (perfilFoto) perfilFoto.src = resizedDataUrl;
                const modalFoto = document.getElementById('modalPerfilFoto');
                if (modalFoto) modalFoto.src = resizedDataUrl;
                console.log('Foto redimensionada y guardada en localStorage (perfil_foto)');
                cargarPerfil();
                modalEditarPerfil.style.display = 'none';
              } catch (err2) {
                console.error('Error guardando foto en localStorage (posible cuota):', err2);
                alert('No se pudo guardar la foto: es demasiado grande para localStorage. Intenta con una imagen más pequeña.');
              }
            };
            img.onerror = function() {
              console.error('No se pudo cargar la imagen para redimensionar. Se guardará la original.');
              try {
                localStorage.setItem('perfil_foto', originalDataUrl);
                if (perfilFoto) perfilFoto.src = originalDataUrl;
                const modalFoto = document.getElementById('modalPerfilFoto');
                if (modalFoto) modalFoto.src = originalDataUrl;
                cargarPerfil();
                modalEditarPerfil.style.display = 'none';
              } catch (err3) {
                console.error('Error guardando la imagen original en localStorage:', err3);
                alert('No se pudo guardar la foto. Revisa la consola.');
              }
            };
            img.src = originalDataUrl;
          } catch (err) {
            console.error('Error procesando la imagen:', err);
            alert('Error al procesar la imagen. Revisa la consola.');
          }
        };
        reader.onerror = function(err) {
          console.error('FileReader error:', err);
          alert('No se pudo leer la imagen. Revisa la consola.');
        };
        reader.readAsDataURL(file);
      } else {
        console.log('No se seleccionó foto, solo se guardará la descripción');
        cargarPerfil();
        modalEditarPerfil.style.display = 'none';
      }
    } catch (e) {
      console.error('Error en guardarDescripcion handler:', e);
      alert('Ocurrió un error. Revisa la consola para más detalles.');
    }
  });
}

// --- Nueva publicación ---
console.log('Inicializando evento de nueva publicación');
console.log('btnNuevaPublicacion:', btnNuevaPublicacion);
console.log('modalNuevaPublicacion:', modalNuevaPublicacion);

if (btnNuevaPublicacion) {
  btnNuevaPublicacion.addEventListener('click', () => {
    console.log('Click en botón nueva publicación');
    try {
      // Mostrar modal
      if (!modalNuevaPublicacion) {
        console.error('Modal no encontrado');
        return;
      }
      modalNuevaPublicacion.classList.add('show');
      console.log('Modal mostrado correctamente');
      
      // Llenar foto/nombre en modal si existen
      const modalPerfilFoto = document.getElementById('modalPerfilFoto');
      const modalPerfilNombre = document.getElementById('modalPerfilNombre');
      const foto = localStorage.getItem('perfil_foto');
      if (modalPerfilFoto) modalPerfilFoto.src = foto ? foto : '../img/agricultor.png';
      if (modalPerfilNombre) modalPerfilNombre.textContent = localStorage.getItem('perfil_nombre') || 'Usuario';
    } catch (error) {
      console.error('Error al mostrar el modal:', error);
    }
  });
} else {
  console.error('Botón nueva publicación no encontrado');
}
if (cerrarModalNuevaPublicacion) {
    cerrarModalNuevaPublicacion.addEventListener('click', () => {
    modalNuevaPublicacion.classList.remove('show');
    if (tituloPublicacion) tituloPublicacion.value = '';
    if (precioPublicacion) precioPublicacion.value = '';
    if (descPublicacion) descPublicacion.value = '';
    if (imgPublicacion) imgPublicacion.value = '';
    if (categoriaPublicacion) categoriaPublicacion.value = '';
    const otra = document.getElementById('otraCategoriaPublicacion');
    if (otra) { otra.value = ''; otra.style.display = 'none'; }
  });
}

// --- Publicar nueva publicación ---
publicarBtn.onclick = async () => {
  try {
    const titulo = tituloPublicacion.value.trim();
    const precio = precioPublicacion.value.replace(/\D/g, '');
    const descripcionPub = descPublicacion.value.trim();
    // Obtener y validar id_usuario
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      alert('Error: No hay usuario identificado. Por favor, inicia sesión nuevamente.');
      window.location.href = 'login.html';
      return;
    }
    
    const usuario = JSON.parse(usuarioGuardado);
    const id_usuario = usuario.id_usuario;
    if (!id_usuario) {
      alert('Error: ID de usuario no válido. Por favor, inicia sesión nuevamente.');
      window.location.href = 'login.html';
      return;
    }

    console.log('ID de usuario actual:', id_usuario);

    const files = Array.from(imgPublicacion.files);
    let categoria = categoriaPublicacion.value;
    
    // Validaciones
    if (categoria === 'Otra') {
      categoria = document.getElementById('otraCategoriaPublicacion').value.trim();
      if (!categoria) {
        alert('Especifique la categoría');
        return;
      }
    }
    if (!titulo) {
      alert('El nombre del producto es obligatorio');
      return;
    }
    if (!precio) {
      alert('El precio es obligatorio');
      return;
    }
    if (!files.length) {
      alert('Agrega al menos una imagen');
      return;
    }

    // Crear FormData para enviar los datos
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcionPub);
    formData.append('precio', precio);
    formData.append('categoria', categoria);
    formData.append('id_usuario', id_usuario);
    formData.append('foto', files[0]); // Solo la primera imagen por ahora
    formData.append('mostrar_ubicacion', '1'); // Por defecto mostrar ubicación

    // Enviar al servidor
    console.log('Enviando datos al servidor:', {
      titulo,
      descripcion: descripcionPub,
      precio,
      categoria,
      id_usuario,
      foto: files[0]?.name
    });

    console.log('Enviando formulario con FormData:', {
      titulo: formData.get('titulo'),
      precio: formData.get('precio'),
      categoria: formData.get('categoria'),
      id_usuario: formData.get('id_usuario'),
      foto: formData.get('foto')?.name
    });

    const response = await fetch('/api/publicaciones', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);

    if (!response.ok) {
      console.error('Error del servidor:', responseData);
      throw new Error(responseData.error || 'Error al crear la publicación');
    }

    console.log('Publicación creada:', responseData);

    // Limpiar formulario y cerrar modal
    modalNuevaPublicacion.style.display = 'none';
    tituloPublicacion.value = '';
    precioPublicacion.value = '';
    descPublicacion.value = '';
    imgPublicacion.value = '';
    categoriaPublicacion.value = categoriaPublicacion.options[0].value;
    document.getElementById('otraCategoriaPublicacion').value = '';
    document.getElementById('otraCategoriaPublicacion').style.display = 'none';

    // Recargar publicaciones
    cargarPublicaciones();
    
    alert('Publicación creada exitosamente');
  } catch (error) {
    console.error('Error al crear publicación:', error);
    alert('Error al crear la publicación. Por favor, intenta de nuevo.');
  }
};

// Formatear precio con puntos de miles en tiempo real
precioPublicacion.addEventListener('input', function(e) {
  let val = precioPublicacion.value.replace(/\D/g, '');
  if (!val) { precioPublicacion.value = ''; return; }
  precioPublicacion.value = Number(val).toLocaleString('es-CO');
});

// Cargar publicaciones del usuario
async function cargarPublicaciones() {
  try {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      console.error('No hay usuario en localStorage');
      window.location.href = 'login.html';
      return;
    }
    
    const usuario = JSON.parse(usuarioGuardado);
    const id_usuario = usuario.id_usuario;
    if (!id_usuario) {
      console.error('ID de usuario no válido');
      window.location.href = 'login.html';
      return;
    }

    console.log('Cargando publicaciones para usuario:', id_usuario);
    const response = await fetch(`/api/publicaciones?usuario=${id_usuario}`);
    if (!response.ok) throw new Error('Error al cargar publicaciones');
    
    const publicaciones = await response.json();
    mostrarPublicaciones(publicaciones);
  } catch (error) {
    console.error('Error:', error);
    publicacionesGrid.innerHTML = '<div style="color:#888;text-align:center;padding:32px;">Error al cargar las publicaciones.</div>';
  }
}

// Renderizar publicaciones y descripción
function cargarPerfil() {
  // Mostrar foto de perfil
  if (localStorage.getItem('perfil_foto')) {
    perfilFoto.src = localStorage.getItem('perfil_foto');
  } else {
    perfilFoto.src = '../img/agricultor.png';
  }
  perfilDescripcion.textContent = descripcion || 'Sin descripción';
  
  // Cargar publicaciones
  cargarPublicaciones();
}

// Mostrar publicaciones en el grid
function mostrarPublicaciones(publicaciones) {
  if (!publicaciones || publicaciones.length === 0) {
    publicacionesGrid.innerHTML = '<div style="color:#888;text-align:center;padding:32px;">No tienes publicaciones aún.</div>';
    perfilPublicaciones.textContent = '0';
    return;
  }

  perfilPublicaciones.textContent = publicaciones.length;
  publicacionesGrid.innerHTML = publicaciones.map(pub => `
    <div class="publicacion-card" style="background:#fff;border-radius:14px;box-shadow:0 2px 12px #0001;padding:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;">
      <div style="width:100%;height:200px;overflow:hidden;border-radius:10px;margin-bottom:8px;">
        <img src="${pub.foto || '../img/placeholder.jpg'}" 
             style="width:100%;height:100%;object-fit:cover;" 
             alt="${pub.titulo}">
      </div>
      <div style="font-weight:700;font-size:1.08em;color:#4caf50;">${pub.titulo}</div>
      <div style="color:#222;font-size:.98em;margin-bottom:4px;">${pub.descripcion || ''}</div>
      <div style="color:#388e3c;font-size:1.08em;font-weight:600;">$${Number(pub.precio).toLocaleString('es-CO')}</div>
      <div style="color:#222;font-size:.95em;">Categoría: ${pub.categoria || 'Sin categoría'}</div>
      <div class="acciones" style="display:flex;gap:10px;margin-top:10px;width:100%;">
        <button onclick="editarPublicacion(${pub.id_publicacion})" 
                class="btn btn-outline-success" 
                style="flex:1;">Editar</button>
        <button onclick="eliminarPublicacion(${pub.id_publicacion})" 
                class="btn btn-outline-danger" 
                style="flex:1;">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Inicializar perfil al cargar
// Función para verificar si hay usuario logueado
function verificarUsuario() {
  const usuarioGuardado = localStorage.getItem('usuario');
  if (!usuarioGuardado) {
    console.error('No hay usuario en localStorage');
    window.location.href = 'login.html';
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);
    if (!usuario.id_usuario) {
      throw new Error('ID de usuario no válido');
    }
    console.log('Usuario actual:', usuario.nombre, '(ID:', usuario.id_usuario, ')');
    return usuario;
  } catch (error) {
    console.error('Error al validar usuario:', error);
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
    return null;
  }
}

// Función para inicializar elementos DOM
function inicializarElementos() {
  console.log('Inicializando elementos DOM');
  
  // Obtener todos los elementos DOM necesarios
  elements = {
    btnMas: document.getElementById('btnMas'),
    menuMas: document.getElementById('menuMas'),
    perfilFoto: document.getElementById('perfilFoto'),
    btnEditarPerfil: document.getElementById('btnEditarPerfil'),
    perfilDescripcion: document.getElementById('perfilDescripcion'),
    perfilPublicaciones: document.getElementById('perfilPublicaciones'),
    publicacionesGrid: document.getElementById('publicacionesGrid'),
    btnNuevaPublicacion: document.getElementById('btnNuevaPublicacion'),
    modalEditarPerfil: document.getElementById('modalEditarPerfil'),
    cerrarModalEditarPerfil: document.getElementById('cerrarModalEditarPerfil'),
    inputDescripcion: document.getElementById('inputDescripcion'),
    guardarDescripcion: document.getElementById('guardarDescripcion'),
    modalNuevaPublicacion: document.getElementById('modalNuevaPublicacion'),
    cerrarModalNuevaPublicacion: document.getElementById('cerrarModalNuevaPublicacion'),
    tituloPublicacion: document.getElementById('tituloPublicacion'),
    precioPublicacion: document.getElementById('precioPublicacion'),
    descPublicacion: document.getElementById('descPublicacion'),
    imgPublicacion: document.getElementById('imgPublicacion'),
    publicarBtn: document.getElementById('publicarBtn'),
    inputFotoPerfil: document.getElementById('inputFotoPerfil'),
    categoriaPublicacion: document.getElementById('categoriaPublicacion'),
    otraCategoriaPublicacion: document.getElementById('otraCategoriaPublicacion')
  };

  // Debug: imprimir el estado de los elementos críticos
  console.log('Estado de elementos críticos:');
  console.log('btnNuevaPublicacion:', elements.btnNuevaPublicacion);
  console.log('modalNuevaPublicacion:', elements.modalNuevaPublicacion);
  console.log('publicarBtn:', elements.publicarBtn);
  console.log('categoriaPublicacion:', elements.categoriaPublicacion);

  // Verificar si se encontraron todos los elementos críticos
  const elementosCriticos = ['btnNuevaPublicacion', 'modalNuevaPublicacion', 'publicarBtn', 'categoriaPublicacion'];
  const elementosFaltantes = elementosCriticos.filter(id => !elements[id]);
  
  if (elementosFaltantes.length > 0) {
    console.error('Elementos críticos no encontrados:', elementosFaltantes);
    return false;
  }

  console.log('Todos los elementos críticos encontrados');
  return true;
}

// Inicializar al cargar
window.onload = () => {
  console.log('Página cargada, inicializando...');
  
  if (!inicializarElementos()) {
    console.error('Error al inicializar elementos. Algunas funciones podrían no estar disponibles.');
    return;
  }

  // Configurar eventos
  document.addEventListener('click', (e) => {
    if (elements.modalNuevaPublicacion && 
        !elements.modalNuevaPublicacion.querySelector('.modal-content').contains(e.target) &&
        !elements.btnNuevaPublicacion.contains(e.target)) {
      elements.modalNuevaPublicacion.classList.remove('show');
    }
  });

  // Prevenir que los clics dentro del modal se propaguen al documento
  if (elements.modalNuevaPublicacion) {
    elements.modalNuevaPublicacion.querySelector('.modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (elements.btnNuevaPublicacion && elements.modalNuevaPublicacion) {
    console.log('Configurando evento del botón nueva publicación');
    elements.btnNuevaPublicacion.addEventListener('click', () => {
      console.log('Click en botón nueva publicación');
      try {
        elements.modalNuevaPublicacion.style.display = 'flex';
        console.log('Modal mostrado correctamente');

        // Llenar foto/nombre en modal si existen
        const modalPerfilFoto = document.getElementById('modalPerfilFoto');
        const modalPerfilNombre = document.getElementById('modalPerfilNombre');
        const foto = localStorage.getItem('perfil_foto');
        if (modalPerfilFoto) modalPerfilFoto.src = foto || '../img/agricultor.png';
        if (modalPerfilNombre) modalPerfilNombre.textContent = localStorage.getItem('perfil_nombre') || 'Usuario';
      } catch (error) {
        console.error('Error al mostrar el modal:', error);
      }
    });
  } else {
    console.error('No se encontró el botón o el modal de nueva publicación');
  }

  cargarPerfil();
};
// Inicializar elementos del formulario
function inicializarFormulario() {
  const categoriaSelect = document.getElementById('categoriaPublicacion');
  const otraCategoriaInput = document.getElementById('otraCategoriaPublicacion');
  
  if (categoriaSelect && otraCategoriaInput) {
    // Asegurarse de que haya una opción seleccionada por defecto
    if (!categoriaSelect.value) {
      categoriaSelect.value = categoriaSelect.options[0].value;
    }

    // Manejar cambio de categoría
    categoriaSelect.addEventListener('change', function() {
      if (this.value === 'Otra') {
        otraCategoriaInput.style.display = 'block';
      } else {
        otraCategoriaInput.style.display = 'none';
        otraCategoriaInput.value = '';
      }
    });
  }
}
