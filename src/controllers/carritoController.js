const { Carrito, DetalleCarrito, Producto } = require('../models');

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
module.exports = { obtenerMiCarrito, agregarAlCarrito, quitarDelCarrito, restarProducto };