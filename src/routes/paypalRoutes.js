const express = require('express');
const router = express.Router();
const { crearOrdenPayPal, capturarPagoPayPal } = require('../controllers/paypalController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Endpoint privado para generar la transacción desde el frontend
router.post('/crear-orden', verifyToken, crearOrdenPayPal);

// Endpoint público para recibir la redirección de respuesta desde los servidores de PayPal
router.get('/capturar', capturarPagoPayPal);

module.exports = router;