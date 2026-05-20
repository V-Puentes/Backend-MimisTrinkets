const express = require('express');
const router = express.Router();
const { generarReporteInventarioExcel, generarComprobantePDF } = require('../controllers/reporteController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// El reporte de inventario es exclusivo del Administrador
router.get('/inventario/excel', verifyToken, isAdmin, generarReporteInventarioExcel);

// El comprobante PDF requiere autenticación genérica (el controlador verifica si es el dueño)
router.get('/pedido/:id/pdf', verifyToken, generarComprobantePDF);

module.exports = router;