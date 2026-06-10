const { Carrito, DetalleCarrito, Producto, Pedido, DetallePedido } = require('../models');
const sequelize = require('../config/database');

const procesarCheckout = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const usuarioId = req.user.id;
        const { DIRECCION_ENVIO, METODO_PAGO_ID } = req.body;

        // 1. Validaciones de presencia de datos requeridos por el modelo
        if (!DIRECCION_ENVIO || !METODO_PAGO_ID) {
            await t.rollback();
            return res.status(400).json({ message: 'Dirección de envío y método de pago son obligatorios.' });
        }

        const carrito = await Carrito.findOne({ where: { USUARIO_ID: usuarioId }, transaction: t });
        if (!carrito) {
            await t.rollback();
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }

        const detalles = await DetalleCarrito.findAll({ where: { CARRITO_ID: carrito.ID_CARRITO }, transaction: t });
        if (detalles.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        let totalConIva = 0;
        const operacionesProductos = [];

        // 2. Validación estricta de stock y cálculo dinámico de montos
        for (const item of detalles) {
            const producto = await Producto.findByPk(item.PRODUCTO_ID, { transaction: t });
            
            if (!producto) {
                await t.rollback();
                return res.status(404).json({ message: `Producto ID ${item.PRODUCTO_ID} no encontrado en el inventario.` });
            }

            // Regla de negocio: Rechazar si la cantidad solicitada supera el stock
            if (producto.STOCK < item.CANTIDAD) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `Stock insuficiente para el producto: ${producto.NOMBRE_PROD}. Disponible: ${producto.STOCK}, Solicitado: ${item.CANTIDAD}` 
                });
            }

            // Cálculo del precio final unitario considerando el descuento promocional
            const precioUnitario = Number(producto.PRECIO_PROD);
            const descuento = Number(producto.PORCENTAJE_OFERTA || 0) / 100;
            const precioFinal = precioUnitario * (1 - descuento);

            totalConIva += precioFinal * item.CANTIDAD;
            
            // Almacena en memoria las instancias listas para mutar stock posterior
            operacionesProductos.push({
                instanciaProducto: producto,
                cantidadAComprar: item.CANTIDAD,
                precioHistorico: precioFinal
            });
        }

        // 3. Desglose impositivo estándar (Basado en precios chilenos con IVA incluido)
        const total = totalConIva;
        const subtotal = total / 1.19;
        const valorIva = total - subtotal;

        // 4. Inserción en la tabla PEDIDO (ESTADO_ID: 1 representa "Procesando"/"Pendiente")
        const nuevoPedido = await Pedido.create({
            USUARIO_ID: usuarioId,
            SUBTOTAL: subtotal.toFixed(2),
            VALOR_IVA: valorIva.toFixed(2),
            TOTAL_CON_IVA: total.toFixed(2),
            DIRECCION_ENVIO,
            ESTADO_ID: 1, 
            METODO_PAGO_ID
        }, { transaction: t });

        // 5. Generación de detalles de la orden y mutación del inventario
        for (const operacion of operacionesProductos) {
            await DetallePedido.create({
                PEDIDO_ID: nuevoPedido.ID_PEDIDO,
                PRODUCTO_ID: operacion.instanciaProducto.ID_PRODUCTO,
                CANTIDAD: operacion.cantidadAComprar,
                PRECIO_HISTORICO: operacion.precioHistorico
            }, { transaction: t });

            // Descuento automatizado de unidades en la tabla Producto
            operacion.instanciaProducto.STOCK -= operacion.cantidadAComprar;
            await operacion.instanciaProducto.save({ transaction: t });
        }

        // 6. Vaciado completo de las líneas de detalle del carrito
        await DetalleCarrito.destroy({ where: { CARRITO_ID: carrito.ID_CARRITO }, transaction: t });

        // Confirma de forma persistente todos los cambios en la base de datos
        await t.commit();
        
        res.status(200).json({ 
            message: 'Transacción procesada exitosamente y stock actualizado.', 
            pedidoId: nuevoPedido.ID_PEDIDO 
        });

    } catch (error) {
        // En caso de excepción, revierte cualquier cambio ejecutado en este ciclo
        if (!t.finished) await t.rollback();
        res.status(500).json({ message: 'Error al procesar el pago.', error: error.message });
    }
};

// Obtener o inicializar el carrito del usuario logueado
const obtenerMiCarrito = async (req, res) => {
    try {
        let carrito = await Carrito.findOne({
            where: { USUARIO_ID: req.user.id },
            include: [{
                model: DetalleCarrito,
                include: [{ model: Producto, attributes: ['NOMBRE_PROD', 'PRECIO_PROD', 'STOCK', 'IMAGEN_URL'] }]
            }]
        });

        // Si no tiene carrito, se crea uno vacío
        if (!carrito) {
            carrito = await Carrito.create({ USUARIO_ID: req.user.id });
            // Se devuelve la misma estructura incluyendo los detalles vacíos
            return res.json({ ...carrito.toJSON(), DetalleCarritos: [] });
        }

        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el carrito.', error: error.message });
    }
};

// Agregar un producto al carrito
const agregarAlCarrito = async (req, res) => {
    try {
        const { PRODUCTO_ID, CANTIDAD } = req.body;

        // 1. Obtener carrito
        let carrito = await Carrito.findOne({ where: { USUARIO_ID: req.user.id } });
        if (!carrito) {
            carrito = await Carrito.create({ USUARIO_ID: req.user.id });
        }

        // 2. Verificar si el producto ya está en el carrito
        const itemExistente = await DetalleCarrito.findOne({
            where: { CARRITO_ID: carrito.ID_CARRITO, PRODUCTO_ID }
        });

        if (itemExistente) {
            // Actualizar cantidad
            await itemExistente.update({ CANTIDAD: itemExistente.CANTIDAD + CANTIDAD });
        } else {
            // Crear nuevo detalle
            await DetalleCarrito.create({
                CARRITO_ID: carrito.ID_CARRITO,
                PRODUCTO_ID,
                CANTIDAD
            });
        }

        res.status(200).json({ message: 'Producto agregado al carrito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar al carrito.', error: error.message });
    }
};

// Eliminar un producto del carrito
const quitarDelCarrito = async (req, res) => {
    try {
        const { detalleId } = req.params;
        
        const item = await DetalleCarrito.findByPk(detalleId);
        if (!item) return res.status(404).json({ message: 'Ítem no encontrado en el carrito.' });

        await item.destroy();
        res.json({ message: 'Producto removido del carrito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al remover del carrito.', error: error.message });
    }
};

const restarProducto = async (req, res) => {
    const { PRODUCTO_ID } = req.body;
    const usuarioId = req.user.id;

    try {
        const carrito = await Carrito.findOne({ where: { USUARIO_ID: usuarioId } });
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        const detalle = await DetalleCarrito.findOne({ where: { CARRITO_ID: carrito.ID_CARRITO, PRODUCTO_ID } });
        
        if (detalle && detalle.CANTIDAD > 1) {
            detalle.CANTIDAD -= 1;
            await detalle.save();
            res.json({ message: 'Cantidad disminuida' });
        } else {
            res.status(400).json({ message: 'La cantidad no puede ser menor a 1' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al restar producto', error: error.message });
    }
};

// Se incluye restarProducto en el objeto exportado
module.exports = { obtenerMiCarrito, agregarAlCarrito, quitarDelCarrito, restarProducto, procesarCheckout };