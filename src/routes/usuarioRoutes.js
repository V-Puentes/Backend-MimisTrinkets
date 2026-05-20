const express = require('express');
const router = express.Router();
const { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuarioController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Aplicar protección a todas las rutas de este mantenedor
router.use(verifyToken, isAdmin);

// Endpoints: /api/usuarios
router.post('/', crearUsuario);
router.get('/', obtenerUsuarios);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;