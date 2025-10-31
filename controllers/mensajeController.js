const db = require('../config/db');

// Obtener conversaciones del usuario (inbox)
exports.getInbox = async (req, res) => {
  const id_usuario = req.params.id_usuario;
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT
        CASE WHEN id_remitente = ? THEN id_destinatario ELSE id_remitente END AS otro_usuario,
        u.nombre AS nombre_usuario,
        p.idproductos AS id_producto,
        p.nombre_productos
      FROM mensajes m
      LEFT JOIN usuarios u ON u.id_usuario = CASE WHEN m.id_remitente = ? THEN m.id_destinatario ELSE m.id_remitente END
      LEFT JOIN productos p ON m.id_producto = p.idproductos
      WHERE m.id_remitente = ? OR m.id_destinatario = ?
      ORDER BY m.fecha DESC
    `, [id_usuario, id_usuario, id_usuario, id_usuario]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
};

// Obtener mensajes de una conversación
exports.getMessages = async (req, res) => {
  const { id_usuario, otro_usuario, id_producto } = req.query;
  try {
    let query = `SELECT * FROM mensajes WHERE ((id_remitente = ? AND id_destinatario = ?) OR (id_remitente = ? AND id_destinatario = ?))`;
    let params = [id_usuario, otro_usuario, otro_usuario, id_usuario];
    if (id_producto) {
      query += ' AND id_producto = ?';
      params.push(id_producto);
    }
    query += ' ORDER BY fecha ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Enviar mensaje
exports.sendMessage = async (req, res) => {
  const { id_remitente, id_destinatario, mensaje, id_producto } = req.body;
  try {
    await db.query(
      'INSERT INTO mensajes (id_remitente, id_destinatario, mensaje, id_producto) VALUES (?, ?, ?, ?)',
      [id_remitente, id_destinatario, mensaje, id_producto || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};
