const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const { Producto, Categoria, Franquicia, Pedido, DetallePedido, Usuario } = require('../models');

// --- REPORTE EXCEL: Inventario (Administrador) ---
const generarReporteInventarioExcel = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                { model: Categoria, attributes: ['NOMBRE_CAT'] },
                { model: Franquicia, attributes: ['NOMBRE_FRANQ'] }
            ]
        });

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Inventario');

        // Definición de columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Producto', key: 'nombre', width: 40 },
            { header: 'Categoría', key: 'categoria', width: 20 },
            { header: 'Franquicia', key: 'franquicia', width: 25 },
            { header: 'Precio Base', key: 'precio', width: 15 },
            { header: 'Oferta (%)', key: 'oferta', width: 15 },
            { header: 'Stock Actual', key: 'stock', width: 15 }
        ];

        // Estilo para la cabecera
        worksheet.getRow(1).font = { bold: true };

        // Inserción de datos
        productos.forEach(prod => {
            worksheet.addRow({
                id: prod.ID_PRODUCTO,
                nombre: prod.NOMBRE_PROD,
                categoria: prod.Categoria ? prod.Categoria.NOMBRE_CAT : 'N/A',
                franquicia: prod.Franquicia ? prod.Franquicia.NOMBRE_FRANQ : 'N/A',
                precio: prod.PRECIO_PROD,
                oferta: prod.PORCENTAJE_OFERTA,
                stock: prod.STOCK
            });
        });

        // Configuración de cabeceras HTTP para forzar la descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'Reporte_Inventario.xlsx');

        // Escribir el buffer y enviarlo
        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar Excel.', error: error.message });
    }
};

// --- REPORTE PDF: Comprobante de Pedido (Cliente/Administrador) ---
const generarComprobantePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findByPk(id, {
            include: [
                { model: Usuario, attributes: ['NOMBRE', 'RUT', 'EMAIL'] },
                { model: DetallePedido, include: [{ model: Producto, attributes: ['NOMBRE_PROD'] }] }
            ]
        });

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Validación de seguridad: Solo el administrador o el dueño del pedido pueden descargar el PDF
        if (req.user.rolId !== 2 && pedido.USUARIO_ID !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado a este documento.' });
        }

        // Configuración de cabeceras HTTP para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Comprobante_Pedido_${pedido.ID_PEDIDO}.pdf`);

        // Inicialización de PDFKit
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // Estructura del Documento
        doc.fontSize(20).text('Comprobante de Venta', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`N° de Pedido: ${pedido.ID_PEDIDO}`);
        doc.text(`Fecha: ${new Date(pedido.FECHA_PEDIDO).toLocaleDateString()}`);
        doc.text(`Cliente: ${pedido.Usuario.NOMBRE} (${pedido.Usuario.RUT})`);
        doc.text(`Dirección de Envío: ${pedido.DIRECCION_ENVIO}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalle de Productos:', { underline: true });
        doc.moveDown(0.5);

        pedido.DetallePedidos.forEach(item => {
            doc.fontSize(10).text(`- ${item.Producto.NOMBRE_PROD}`);
            doc.text(`  Cantidad: ${item.CANTIDAD} | P. Unitario: $${item.PRECIO_UNITARIO}`, { indent: 20 });
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(12).text(`Subtotal: $${pedido.SUBTOTAL}`, { align: 'right' });
        doc.text(`IVA (19%): $${pedido.VALOR_IVA}`, { align: 'right' });
        doc.fontSize(14).text(`Total Pagado: $${pedido.TOTAL_CON_IVA}`, { align: 'right', bold: true });

        // Finalizar la escritura del PDF
        doc.end();

    } catch (error) {
        res.status(500).json({ message: 'Error al generar PDF.', error: error.message });
    }
};

module.exports = { generarReporteInventarioExcel, generarComprobantePDF };