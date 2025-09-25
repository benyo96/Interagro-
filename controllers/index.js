// Importar todos los controllers
const clienteController = require('./clienteController');
const productController = require('./productController');


// Exportar todos juntos
module.exports = {
  clienteController,
  productController,
};

// O exportar funciones específicas si prefieres
module.exports = {
  // User functions
  getAllclientes: clienteController.getAllclientes,
  createcliente: clienteController.createcliente,
  geclienteById: clienteController.getclientebyId,
  
  // Product functions
  getProducts: productController.getProducts,
  createProduct: productController.createProduct,
  
  // Auth functions
};