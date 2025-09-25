const db = require('../config/db');

const clienteController = {
  // Obtener todos los clientes
  getAllClientes: (_req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // Crear un cliente (requiere id_usuario existente)
  createCliente: (req, res) => {
    const { id_usuario, direccion, contacto } = req.body;
    if (!id_usuario || !direccion || !contacto) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    db.query(
      'INSERT INTO clientes (id_usuario, direccion, contacto) VALUES (?, ?, ?)',
      [id_usuario, direccion, contacto],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          message: 'Cliente creado exitosamente',
          id: results.insertId,
          id_usuario,
          direccion,
          contacto
        });
      }
    );
  },

  // Obtener cliente por ID
  getClienteById: (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM clientes WHERE idclientes = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(results[0]);
    });
  }
};

module.exports = clienteController;