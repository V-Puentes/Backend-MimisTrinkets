const { Pedido, DetallePedido, Producto, EstadoPedido, MetodoPago, Usuario } = require('../models');

// --- ADMINISTRADOR ---
const obtenerTodosLosPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            include: [
                { model: Usuario, attributes: ['NOMBRE', 'EMAIL', 'RUT'] },
                { model: EstadoPedido, attributes: ['NOMBRE_ESTADO'] },
                { model: MetodoPago, attributes: ['NOMBRE_METODO'] },
                { 
                    model: DetallePedido, 
                    include: [{ model: Producto, attributes: ['NOMBRE_PROD', 'PRECIO_PROD'] }] 
                }
            ],
            order: [['FECHA_PEDIDO', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos.', error: error.message });
    }
};

const actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { ESTADO_ID } = req.body;

        const pedido = await Pedido.findByPk(id);
        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado.' });

        await pedido.update({ ESTADO_ID });
        res.json({ message: 'Estado del pedido actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado.', error: error.message });
    }
};

// --- CLIENTE ---
const obtenerMisPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: { USUARIO_ID: req.user.id },
            include: [
                { model: EstadoPedido, attributes: ['NOMBRE_ESTADO'] },
                { model: MetodoPago, attributes: ['NOMBRE_METODO'] },
                { 
                    model: DetallePedido,
                    include: [{ model: Producto, attributes: ['NOMBRE_PROD', 'IMAGEN_URL'] }]
                }
            ],
            order: [['FECHA_PEDIDO', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial de pedidos.', error: error.message });
    }
};

module.exports = { obtenerTodosLosPedidos, actualizarEstadoPedido, obtenerMisPedidos };