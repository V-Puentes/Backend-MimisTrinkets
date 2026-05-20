const sequelize = require('../config/database');
const { Carrito, DetalleCarrito, Producto, Pedido, DetallePedido } = require('../models');

const procesarCheckout = async (req, res) => {
    // Se inicia la transacción
    const t = await sequelize.transaction();

    try {
        const { DIRECCION_ENVIO, METODO_PAGO_ID } = req.body;
        const usuarioId = req.user.id;

        // 1. Obtener el carrito y sus detalles
        const carrito = await Carrito.findOne({
            where: { USUARIO_ID: usuarioId },
            include: [{
                model: DetalleCarrito,
                include: [{ model: Producto }]
            }]
        });

        if (!carrito || carrito.DetalleCarritos.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        let subtotalCalculado = 0;

        // 2. Validar Stock y calcular Subtotal
        for (const item of carrito.DetalleCarritos) {
            if (item.Producto.STOCK < item.CANTIDAD) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `Stock insuficiente para el producto: ${item.Producto.NOMBRE_PROD}. Stock actual: ${item.Producto.STOCK}` 
                });
            }
            // Se calcula el precio unitario considerando la oferta si la tiene
            const descuento = item.Producto.PORCENTAJE_OFERTA / 100;
            const precioFinal = item.Producto.PRECIO_PROD * (1 - descuento);
            subtotalCalculado += (precioFinal * item.CANTIDAD);
        }

        // 3. Cálculos de IVA (19% en Chile) y Total
        const valorIva = subtotalCalculado * 0.19;
        const totalConIva = subtotalCalculado + valorIva;

        // 4. Crear la cabecera del Pedido (Estado 1: Pendiente de Pago por defecto)
        const nuevoPedido = await Pedido.create({
            USUARIO_ID: usuarioId,
            SUBTOTAL: subtotalCalculado,
            VALOR_IVA: valorIva,
            TOTAL_CON_IVA: totalConIva,
            DIRECCION_ENVIO: DIRECCION_ENVIO,
            ESTADO_ID: 1, 
            METODO_PAGO_ID: METODO_PAGO_ID
        }, { transaction: t });

        // 5. Crear el Detalle del Pedido y Descontar Stock
        for (const item of carrito.DetalleCarritos) {
            const descuento = item.Producto.PORCENTAJE_OFERTA / 100;
            const precioFinal = item.Producto.PRECIO_PROD * (1 - descuento);

            // Insertar detalle de la compra
            await DetallePedido.create({
                PEDIDO_ID: nuevoPedido.ID_PEDIDO,
                PRODUCTO_ID: item.PRODUCTO_ID,
                CANTIDAD: item.CANTIDAD,
                PRECIO_UNITARIO: precioFinal
            }, { transaction: t });

            // Actualizar stock del producto
            const nuevoStock = item.Producto.STOCK - item.CANTIDAD;
            await Producto.update(
                { STOCK: nuevoStock },
                { where: { ID_PRODUCTO: item.PRODUCTO_ID }, transaction: t }
            );
        }

        // 6. Vaciar el carrito
        await DetalleCarrito.destroy({
            where: { CARRITO_ID: carrito.ID_CARRITO },
            transaction: t
        });

        // 7. Confirmar la transacción
        await t.commit();

        res.status(201).json({ 
            message: 'Compra procesada exitosamente', 
            pedidoId: nuevoPedido.ID_PEDIDO,
            totalCobrado: totalConIva
        });

    } catch (error) {
        // Si ocurre cualquier error en el proceso, se deshacen los cambios
        await t.rollback();
        res.status(500).json({ message: 'Error al procesar el checkout.', error: error.message });
    }
};

module.exports = { procesarCheckout };