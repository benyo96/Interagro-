const db = require('../config/db');

const clienteController = {
  // ===== GET: Obtener todos los clientes =====
  getAllClientes: (req, res) => {
    try {
      const query = 'SELECT * FROM clientes ORDER BY id DESC';
      db.query(query, (err, results) => {
        if (err) {
          console.error('❌ Error al obtener clientes:', err);
          return res.status(500).json({ error: 'Error al obtener clientes' });
        }
        res.json(results || []);
      });
    } catch (error) {
      console.error('❌ Error en getAllClientes:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== POST: Crear un cliente =====
  createCliente: (req, res) => {
    try {
      const { id_usuario, direccion, contacto } = req.body;

      // Validaciones
      if (!id_usuario || isNaN(id_usuario) || !direccion?.trim() || !contacto?.trim()) {
        return res.status(400).json({ error: 'Todos los campos son requeridos y válidos' });
      }

      const query = 'INSERT INTO clientes (id_usuario, direccion, contacto) VALUES (?, ?, ?)';
      db.query(query, [id_usuario, direccion.trim(), contacto.trim()], (err, results) => {
        if (err) {
          console.error('❌ Error al crear cliente:', err);
          if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'El usuario no existe' });
          }
          return res.status(500).json({ error: 'Error al crear cliente' });
        }
        res.status(201).json({
          mensaje: 'Cliente creado exitosamente',
          id: results.insertId
        });
      });
    } catch (error) {
      console.error('❌ Error en createCliente:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // ===== GET: Obtener cliente por ID =====
  getClienteById: (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const query = 'SELECT * FROM clientes WHERE idclientes = ?';
      db.query(query, [id], (err, results) => {
        if (err) {
          console.error('❌ Error al obtener cliente:', err);
          return res.status(500).json({ error: 'Error al obtener cliente' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(results[0]);
      });
    } catch (error) {
      console.error('❌ Error en getClienteById:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
};

module.exports = clienteController;