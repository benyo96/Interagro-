const db = require('../config/db');

const clienteController = {
  getAllUsers: (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  createUser: (req, res) => {
    const { nombre, municipio, direccion, contacto } = req.body;
    
    // Validación
    if (!nombre || !municipio || !direccion || !contacto) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    db.query(
      'INSERT INTO clientes (nombre, municipio, direccion, contacto) VALUES (?, ?, ?, ?)',
      [nombre, municipio, direccion, contacto],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
          message: 'Cliente creado exitosamente',
          id: results.insertId, 
          nombre, 
          municipio, 
          direccion, 
          contacto 
        });
      }
    );
  }
};

module.exports = userController;