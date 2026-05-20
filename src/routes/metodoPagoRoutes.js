const express = require('express');
const router = express.Router();
const { obtenerMetodos, crearMetodo, actualizarMetodo, eliminarMetodo } = require('../controllers/metodoPagoController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);

router.get('/', obtenerMetodos);
router.post('/', crearMetodo);
router.put('/:id', actualizarMetodo);
router.delete('/:id', eliminarMetodo);

module.exports = router;