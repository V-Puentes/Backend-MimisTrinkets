const express = require('express');
const router = express.Router();
const { obtenerFranquicias, crearFranquicia, actualizarFranquicia, eliminarFranquicia } = require('../controllers/franquiciaController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerFranquicias); // Pública
router.post('/', verifyToken, isAdmin, crearFranquicia); // Protegida
router.put('/:id', verifyToken, isAdmin, actualizarFranquicia); // Protegida
router.delete('/:id', verifyToken, isAdmin, eliminarFranquicia); // Protegida

module.exports = router;