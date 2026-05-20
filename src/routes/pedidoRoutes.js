const express = require('express');
const router = express.Router();
const { obtenerTodosLosPedidos, actualizarEstadoPedido, obtenerMisPedidos } = require('../controllers/pedidoController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Rutas de Cliente (Solo requiere estar logueado)
router.get('/mis-pedidos', verifyToken, obtenerMisPedidos);

// Rutas de Administrador (Requiere token y rol admin)
router.get('/', verifyToken, isAdmin, obtenerTodosLosPedidos);
router.put('/:id/estado', verifyToken, isAdmin, actualizarEstadoPedido);

module.exports = router;