const db = require('../config/db');

// ===== GET: Obtener conversaciones del usuario (inbox) =====
exports.getInbox = (req, res) => {
  try {
    const id_usuario = req.params.id_usuario;
    const headerUsuario = req.headers['x-usuario-id'];

    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    if (!headerUsuario) {
      return res.status(403).json({ error: 'Cabecera de usuario requerida' });
    }
    if (Number(headerUsuario) !== Number(id_usuario)) {
      return res.status(403).json({ error: 'No autorizado para ver estas conversaciones' });
    }

    const query = `
      SELECT
        chat.otro_usuario,
        chat.nombre_usuario,
        chat.ultima_fecha,
        chat.ultimo_mensaje,
        COALESCE(unread.mensajes_sin_leer, 0) AS mensajes_sin_leer
      FROM (
        SELECT
          CASE WHEN id_remitente = ? THEN id_destinatario ELSE id_remitente END AS otro_usuario,
          u.nombre AS nombre_usuario,
          MAX(m.fecha) AS ultima_fecha,
          SUBSTRING_INDEX(GROUP_CONCAT(m.mensaje ORDER BY m.fecha DESC SEPARATOR '|||'), '|||', 1) AS ultimo_mensaje
        FROM mensajes m
        LEFT JOIN usuarios u ON u.id = CASE WHEN m.id_remitente = ? THEN m.id_destinatario ELSE m.id_remitente END
        WHERE m.id_remitente = ? OR m.id_destinatario = ?
        GROUP BY otro_usuario, nombre_usuario
      ) AS chat
      LEFT JOIN (
        SELECT id_remitente AS otro_usuario, COUNT(*) AS mensajes_sin_leer
        FROM mensajes
        WHERE id_destinatario = ? AND leido = 0
        GROUP BY id_remitente
      ) AS unread ON unread.otro_usuario = chat.otro_usuario
      ORDER BY chat.ultima_fecha DESC
    `;

    db.query(query, [id_usuario, id_usuario, id_usuario, id_usuario, id_usuario], (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener inbox:', err);
        return res.status(500).json({ error: 'Error al obtener conversaciones' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error en getInbox:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== GET: Obtener mensajes de una conversación =====
exports.getMessages = (req, res) => {
  try {
    const { id_usuario, otro_usuario } = req.query;
    const headerUsuario = req.headers['x-usuario-id'];

    if (!id_usuario || !otro_usuario || isNaN(id_usuario) || isNaN(otro_usuario)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
    }
    if (!headerUsuario) {
      return res.status(403).json({ error: 'Cabecera de usuario requerida' });
    }
    if (Number(headerUsuario) !== Number(id_usuario)) {
      return res.status(403).json({ error: 'No autorizado para ver estos mensajes' });
    }

    const query = `
      SELECT * FROM mensajes 
      WHERE (id_remitente = ? AND id_destinatario = ?) 
         OR (id_remitente = ? AND id_destinatario = ?)
      ORDER BY fecha ASC
    `;

    db.query(query, [id_usuario, otro_usuario, otro_usuario, id_usuario], (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener mensajes:', err);
        return res.status(500).json({ error: 'Error al obtener mensajes' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error en getMessages:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== POST: Enviar mensaje =====
exports.sendMessage = (req, res) => {
  try {
    const { id_remitente, id_destinatario, mensaje } = req.body;
    const headerUsuario = req.headers['x-usuario-id'];

    // Validaciones
    if (!id_remitente || !id_destinatario || !mensaje?.trim()) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (isNaN(id_remitente) || isNaN(id_destinatario)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
    }
    if (!headerUsuario) {
      return res.status(403).json({ error: 'Cabecera de usuario requerida' });
    }
    if (Number(headerUsuario) !== Number(id_remitente)) {
      return res.status(403).json({ error: 'No autorizado para enviar mensajes como este usuario' });
    }

    const query = 'INSERT INTO mensajes (id_remitente, id_destinatario, mensaje, fecha) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';

    db.query(query, [id_remitente, id_destinatario, mensaje.trim()], (err, result) => {
      if (err) {
        console.error('❌ Error al enviar mensaje:', err);
        return res.status(500).json({ error: 'Error al enviar mensaje' });
      }
      res.status(201).json({ 
        mensaje: 'Mensaje enviado',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('❌ Error en sendMessage:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== PATCH: Marcar mensajes como leídos =====
exports.markAsRead = (req, res) => {
  try {
    const { id_usuario, otro_usuario } = req.body;
    const headerUsuario = req.headers['x-usuario-id'];

    if (!id_usuario || !otro_usuario || isNaN(id_usuario) || isNaN(otro_usuario)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
    }
    if (!headerUsuario) {
      return res.status(403).json({ error: 'Cabecera de usuario requerida' });
    }
    if (Number(headerUsuario) !== Number(id_usuario)) {
      return res.status(403).json({ error: 'No autorizado para marcar mensajes como leídos' });
    }

    const query = 'UPDATE mensajes SET leido = 1 WHERE id_remitente = ? AND id_destinatario = ? AND leido = 0';
    db.query(query, [otro_usuario, id_usuario], (err, result) => {
      if (err) {
        console.error('❌ Error al marcar mensajes como leídos:', err);
        return res.status(500).json({ error: 'Error al actualizar mensajes' });
      }
      res.json({ actualizado: result.affectedRows });
    });
  } catch (error) {
    console.error('❌ Error en markAsRead:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===== HELPER: Guardar mensaje desde WebSocket =====
exports.saveMessageData = ({ id_remitente, id_destinatario, mensaje }) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO mensajes (id_remitente, id_destinatario, mensaje, fecha) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
    db.query(query, [id_remitente, id_destinatario, mensaje.trim()], (err, result) => {
      if (err) {
        return reject(err);
      }
      const selectQuery = 'SELECT * FROM mensajes WHERE id = ?';
      db.query(selectQuery, [result.insertId], (selectError, rows) => {
        if (selectError) {
          return reject(selectError);
        }
        resolve(rows[0]);
      });
    });
  });
};

// ===== HELPER: Marcar como leídos desde WebSocket =====
exports.markConversationAsRead = (usuarioId, otroUsuarioId) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE mensajes SET leido = 1 WHERE id_remitente = ? AND id_destinatario = ? AND leido = 0';
    db.query(query, [otroUsuarioId, usuarioId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
};

// ===== DELETE: Eliminar mensaje =====
exports.deleteMessage = (req, res) => {
  try {
    const messageId = req.params.id;
    const { id_usuario } = req.query;
    const headerUsuario = req.headers['x-usuario-id'];

    if (!messageId || isNaN(messageId) || !id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    if (!headerUsuario) {
      return res.status(403).json({ error: 'Cabecera de usuario requerida' });
    }
    if (Number(headerUsuario) !== Number(id_usuario)) {
      return res.status(403).json({ error: 'No autorizado para eliminar este mensaje' });
    }

    const query = 'DELETE FROM mensajes WHERE id = ? AND id_remitente = ?';

    db.query(query, [messageId, id_usuario], (err, result) => {
      if (err) {
        console.error('❌ Error al eliminar mensaje:', err);
        return res.status(500).json({ error: 'Error al eliminar mensaje' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Mensaje no encontrado o no autorizado' });
      }

      res.json({ mensaje: 'Mensaje eliminado' });
    });
  } catch (error) {
    console.error('❌ Error en deleteMessage:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};