const express = require('express');
const router = express.Router();
const { 
    crearUsuario, 
    obtenerUsuarios, 
    actualizarUsuario, 
    actualizarPerfil, 
    eliminarUsuario, actualizarRol
} = require('../controllers/usuarioController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { obtenerUsuarioPorId } = require('../controllers/usuarioController');

router.post('/registro-publico', crearUsuario);
router.put('/perfil', verifyToken, actualizarPerfil);

// 2. Rutas generales protegidas por Administrador
router.post('/', verifyToken, isAdmin, crearUsuario);
router.get('/', verifyToken, isAdmin, obtenerUsuarios);
router.put('/:id', verifyToken, isAdmin, actualizarUsuario);
router.delete('/:id', verifyToken, isAdmin, eliminarUsuario);
router.get('/:id', verifyToken, obtenerUsuarioPorId);
router.patch('/:id/rol', verifyToken, isAdmin, actualizarRol);

module.exports = router;