const express = require('express');
const router = express.Router();
const { obtenerMiCarrito, agregarAlCarrito, quitarDelCarrito, restarProducto } = require('../controllers/carritoController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas las operaciones de carrito requieren sesión iniciada
router.use(verifyToken);

router.get('/', obtenerMiCarrito);
router.post('/agregar', agregarAlCarrito);
router.delete('/quitar/:detalleId', quitarDelCarrito);
router.post('/restar', verifyToken, restarProducto);

module.exports = router;