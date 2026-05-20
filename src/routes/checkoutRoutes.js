const express = require('express');
const router = express.Router();
const { procesarCheckout } = require('../controllers/checkoutController');
const { verifyToken } = require('../middlewares/authMiddleware');

// La operación de pago requiere sesión iniciada
router.post('/', verifyToken, procesarCheckout);

module.exports = router;