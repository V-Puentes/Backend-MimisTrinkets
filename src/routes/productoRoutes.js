const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productoController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerProductos); // Pública
router.post('/', verifyToken, isAdmin, crearProducto); // Protegida
router.put('/:id', verifyToken, isAdmin, actualizarProducto); // Protegida
router.delete('/:id', verifyToken, isAdmin, eliminarProducto); // Protegida

module.exports = router;