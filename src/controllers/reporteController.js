const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize'); // Importación directa del paquete nativo
const { Producto, Categoria, Franquicia, Pedido, DetallePedido, Usuario, EstadoPedido } = require('../models');
// =========================================================================
// REPORTE 1: INVENTARIO Y STOCK CRÍTICO (Filtro por límite de stock opcional)
// =========================================================================

// A. JSON para mostrar en la pantalla del Frontend
const obtenerInventarioJSON = async (req, res) => {
    try {
        const { limite } = req.query;
        const infoFiltro = limite ? { STOCK: { [Op.lte]: Number(limite) } } : {};

        const productos = await Producto.findAll({
            where: infoFiltro,
            include: [
                { model: Categoria, attributes: ['NOMBRE_CAT'] },
                { model: Franquicia, attributes: ['NOMBRE_FRANQ'] }
            ],
            order: [['STOCK', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de inventario.', error: error.message });
    }
};

// B. Generación de Excel filtrado
const generarReporteInventarioExcel = async (req, res) => {
    try {
        const { limite } = req.query;
        const infoFiltro = limite ? { STOCK: { [Op.lte]: Number(limite) } } : {};

        const productos = await Producto.findAll({
            where: infoFiltro,
            include: [
                { model: Categoria, attributes: ['NOMBRE_CAT'] },
                { model: Franquicia, attributes: ['NOMBRE_FRANQ'] }
            ],
            order: [['STOCK', 'ASC']]
        });

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Inventario');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Producto', key: 'nombre', width: 40 },
            { header: 'Categoría', key: 'categoria', width: 20 },
            { header: 'Franquicia', key: 'franquicia', width: 25 },
            { header: 'Precio Base', key: 'precio', width: 15 },
            { header: 'Oferta (%)', key: 'oferta', width: 15 },
            { header: 'Stock Actual', key: 'stock', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };

        productos.forEach(prod => {
            worksheet.addRow({
                id: prod.ID_PRODUCTO,
                nombre: prod.NOMBRE_PROD,
                // Corrección de alias relacionales a Categorium y Franquicium
                categoria: prod.Categorium ? prod.Categorium.NOMBRE_CAT : 'N/A',
                franquicia: prod.Franquicium ? prod.Franquicium.NOMBRE_FRANQ : 'N/A',
                precio: prod.PRECIO_PROD,
                oferta: prod.PORCENTAJE_OFERTA,
                stock: prod.STOCK
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Inventario.xlsx');

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar Excel.', error: error.message });
    }
};

// =========================================================================
// REPORTE 2: VENTAS POR RANGO DE FECHAS
// =========================================================================

// A. JSON para mostrar en la pantalla del Frontend
const obtenerVentasJSON = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: 'Faltan parámetros de rango de fechas.' });
        }

        // Configuración segura de objetos Date para evitar fallos de parseo en la BD
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);

        const ventas = await Pedido.findAll({
            where: {
                FECHA_PEDIDO: { [Op.between]: [inicio, fin] },
                ESTADO_ID: { [Op.ne]: 4 } // Excluir cancelados
            },
            include: [
                { model: Usuario, attributes: ['NOMBRE', 'EMAIL'] },
                { model: EstadoPedido, attributes: ['NOMBRE_ESTADO'] }
            ],
            order: [['FECHA_PEDIDO', 'DESC']]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de ventas.', error: error.message });
    }
};

const generarVentasPDF = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: 'Rango de fechas requerido.' });
        }

        // Configuración segura de objetos Date
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);

        const ventas = await Pedido.findAll({
            where: {
                FECHA_PEDIDO: { [Op.between]: [inicio, fin] },
                ESTADO_ID: { [Op.ne]: 4 }
            },
            include: [{ model: Usuario, attributes: ['NOMBRE'] }],
            order: [['FECHA_PEDIDO', 'ASC']]
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Ventas_${fechaInicio}_to_${fechaFin}.pdf`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        doc.fontSize(20).text('Reporte Consolidado de Ventas', { align: 'center' });
        doc.fontSize(11).text(`Periodo: ${fechaInicio} al ${fechaFin}`, { align: 'center' });
        doc.moveDown(2);

        let sumaTotal = 0;

        ventas.forEach(pedido => {
            doc.fontSize(10).text(`Pedido #${pedido.ID_PEDIDO} | Fecha: ${new Date(pedido.FECHA_PEDIDO).toLocaleDateString()} | Cliente: ${pedido.Usuario?.NOMBRE || 'N/A'}`);
            doc.text(`Monto Total: $${Number(pedido.TOTAL_CON_IVA).toLocaleString('es-CL')}`, { indent: 20 });
            doc.moveDown(0.5);
            sumaTotal += Number(pedido.TOTAL_CON_IVA);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Recaudado en Periodo: $${sumaTotal.toLocaleString('es-CL')}`, { align: 'right', bold: true });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar PDF.', error: error.message });
    }
};

// --- COMPROBANTE INDIVIDUAL (Mantiene su estructura corregida) ---
const generarComprobantePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id, {
            include: [
                { model: Usuario, attributes: ['NOMBRE', 'RUT', 'EMAIL'] },
                { model: DetallePedido, include: [{ model: Producto, attributes: ['NOMBRE_PROD'] }] }
            ]
        });

        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado.' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Comprobante_Pedido_${pedido.ID_PEDIDO}.pdf`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        doc.fontSize(20).text('Comprobante de Venta', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`N° de Pedido: ${pedido.ID_PEDIDO}`);
        doc.text(`Fecha: ${new Date(pedido.FECHA_PEDIDO).toLocaleDateString()}`);
        doc.text(`Cliente: ${pedido.Usuario?.NOMBRE || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalle de Productos:', { underline: true });
        doc.moveDown(0.5);

        pedido.DetallePedidos.forEach(item => {
            doc.fontSize(10).text(`- ${item.Producto?.NOMBRE_PROD || 'Producto descontinuado'}`);
            // Corrección de campo a PRECIO_HISTORICO
            doc.text(`  Cantidad: ${item.CANTIDAD} | P. Unitario: $${Number(item.PRECIO_HISTORICO).toLocaleString('es-CL')}`, { indent: 20 });
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.text(`Total Pagado (IVA Incluido): $${Number(pedido.TOTAL_CON_IVA).toLocaleString('es-CL')}`, { align: 'right', bold: true });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar comprobante.', error: error.message });
    }
};

module.exports = {
    obtenerInventarioJSON,
    generarReporteInventarioExcel,
    obtenerVentasJSON,
    generarVentasPDF,
    generarComprobantePDF
};