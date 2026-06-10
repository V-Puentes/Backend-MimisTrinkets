const express = require('express');
const router = express.Router();
const { 
    obtenerInventarioJSON, 
    generarReporteInventarioExcel, 
    obtenerVentasJSON, 
    generarVentasPDF, 
    generarComprobantePDF 
} = require('../controllers/reporteController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Asegúrese de que el sub-path sea exactamente '/inventario/datos'
router.get('/inventario/datos', verifyToken, isAdmin, obtenerInventarioJSON);
router.get('/inventario/excel', verifyToken, isAdmin, generarReporteInventarioExcel);
router.get('/ventas/datos', verifyToken, isAdmin, obtenerVentasJSON);
router.get('/ventas/pdf', verifyToken, isAdmin, generarVentasPDF);
router.get('/pedido/:id/pdf', verifyToken, generarComprobantePDF);

module.exports = router;