const { EstadoPedido } = require('../models');

const obtenerEstados = async (req, res) => {
    try {
        const estados = await EstadoPedido.findAll();
        res.json(estados);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estados.', error: error.message });
    }
};

const crearEstado = async (req, res) => {
    try {
        const estado = await EstadoPedido.create(req.body);
        res.status(201).json(estado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear estado.', error: error.message });
    }
};

const actualizarEstado = async (req, res) => {
    try {
        const estado = await EstadoPedido.findByPk(req.params.id);
        if (!estado) return res.status(404).json({ message: 'Estado no encontrado.' });
        await estado.update(req.body);
        res.json(estado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado.', error: error.message });
    }
};

const eliminarEstado = async (req, res) => {
    try {
        const estado = await EstadoPedido.findByPk(req.params.id);
        if (!estado) return res.status(404).json({ message: 'Estado no encontrado.' });
        await estado.destroy();
        res.json({ message: 'Estado eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar estado.', error: error.message });
    }
};

module.exports = { obtenerEstados, crearEstado, actualizarEstado, eliminarEstado };