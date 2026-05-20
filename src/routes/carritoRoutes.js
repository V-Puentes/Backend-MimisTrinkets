const express = require('express');
const router = express.Router();
const { obtenerMiCarrito, agregarAlCarrito, quitarDelCarrito } = require('../controllers/carritoController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas las operaciones de carrito requieren sesión iniciada
router.use(verifyToken);

router.get('/', obtenerMiCarrito);
router.post('/agregar', agregarAlCarrito);
router.delete('/quitar/:detalleId', quitarDelCarrito);

module.exports = router;