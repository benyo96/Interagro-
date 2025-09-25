const db = require('../config/db');

const productController = {
  // GET /api/products - Obtener todos los productos
  getProducts: (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener productos' });
      }
      res.json(results);
    });
  },

  // POST /api/products - Crear nuevo producto
  createProduct: (req, res) => {
    const { name, price, description } = req.body;
    
    const sql = 'INSERT INTO products (name, price, description) VALUES (?, ?, ?)';
    db.query(sql, [name, price, description], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al crear producto' });
      }
      res.json({ 
        message: 'Producto creado exitosamente',
        id: results.insertId,
        name,
        price,
        description
      });
    });
  }
};

module.exports = productController;