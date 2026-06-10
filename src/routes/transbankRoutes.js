const express = require('express');
const router = express.Router();
const { iniciarPago, confirmarPago } = require('../controllers/transbankController');

// Ruta que llama el Frontend desde Checkout.jsx
router.post('/crear-transaccion', iniciarPago);

// Ruta que llama Transbank para devolver al usuario (soporta GET y POST)
router.get('/confirmar', confirmarPago);
router.post('/confirmar', confirmarPago);

module.exports = router;