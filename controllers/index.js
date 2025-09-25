// Importar todos los controllers
const clienteController = require('./clienteController');


// Exportar solo las funciones existentes de los controladores
module.exports = {
  // Cliente functions
  getAllClientes: clienteController.getAllClientes,
  createCliente: clienteController.createCliente,
  getClienteById: clienteController.getClienteById,
};