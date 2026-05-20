const express = require('express');
const router = express.Router();
const { obtenerRoles, crearRol, actualizarRol, eliminarRol } = require('../controllers/rolController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);

router.get('/', obtenerRoles);
router.post('/', crearRol);
router.put('/:id', actualizarRol);
router.delete('/:id', eliminarRol);

module.exports = router;