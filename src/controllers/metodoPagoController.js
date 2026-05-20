const { MetodoPago } = require('../models');

const obtenerMetodos = async (req, res) => {
    try {
        const metodos = await MetodoPago.findAll();
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener métodos de pago.', error: error.message });
    }
};

const crearMetodo = async (req, res) => {
    try {
        const metodo = await MetodoPago.create(req.body);
        res.status(201).json(metodo);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear método de pago.', error: error.message });
    }
};

const actualizarMetodo = async (req, res) => {
    try {
        const metodo = await MetodoPago.findByPk(req.params.id);
        if (!metodo) return res.status(404).json({ message: 'Método no encontrado.' });
        await metodo.update(req.body);
        res.json(metodo);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar método.', error: error.message });
    }
};

const eliminarMetodo = async (req, res) => {
    try {
        const metodo = await MetodoPago.findByPk(req.params.id);
        if (!metodo) return res.status(404).json({ message: 'Método no encontrado.' });
        await metodo.destroy();
        res.json({ message: 'Método eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar método.', error: error.message });
    }
};

module.exports = { obtenerMetodos, crearMetodo, actualizarMetodo, eliminarMetodo };