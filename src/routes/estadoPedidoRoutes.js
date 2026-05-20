const express = require('express');
const router = express.Router();
const { obtenerEstados, crearEstado, actualizarEstado, eliminarEstado } = require('../controllers/estadoPedidoController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);

router.get('/', obtenerEstados);
router.post('/', crearEstado);
router.put('/:id', actualizarEstado);
router.delete('/:id', eliminarEstado);

module.exports = router;