const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');

// Definir rutas para productos
router.get('/', productController.getProducts);        // GET /api/products
router.post('/', productController.createProduct);     // POST /api/products

module.exports = router;