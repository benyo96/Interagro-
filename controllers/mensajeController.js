const db = require('../config/db');

// ===== GET: Obtener conversaciones del usuario (inbox) =====
exports.getInbox = (req, res) => {
  try {
    const id_usuario = req.params.id_usuario;

    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const query = `
      SELECT DISTINCT
        CASE WHEN id_remitente = ? THEN id_destinatario ELSE id_remitente END AS otro_usuario,
        u.nombre AS nombre_usuario,
        MAX(m.fecha) AS ultima_fecha,
        MAX(m.mensaje) AS ultimo_mensaje
      FROM mensajes m
      LEFT JOIN usuarios u ON u.id = CASE WHEN m.id_remitente = ? THEN m.id_destinatario ELSE m.id_remitente END
      WHERE m.id_remitente = ? OR m.id_destinatario = ?
      GROUP BY otro_usuario, nombre_usuario
      ORDER BY ultima_fecha DESC
    `;

    db.query(query, [id_usuario, id_usuario, id_usuario, id_usuario], (err, rows) => {
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

    if (!id_usuario || !otro_usuario || isNaN(id_usuario) || isNaN(otro_usuario)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
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

    // Validaciones
    if (!id_remitente || !id_destinatario || !mensaje?.trim()) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (isNaN(id_remitente) || isNaN(id_destinatario)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
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
    res.status(500).json({ error: 'Error en el servidor' });  }
};