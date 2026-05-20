const express = require('express');
const router = express.Router();
const { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } = require('../controllers/categoriaController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerCategorias); // Pública
router.post('/', verifyToken, isAdmin, crearCategoria); // Protegida
router.put('/:id', verifyToken, isAdmin, actualizarCategoria); // Protegida
router.delete('/:id', verifyToken, isAdmin, eliminarCategoria); // Protegida

module.exports = router;