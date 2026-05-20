const { Franquicia } = require('../models');

const obtenerFranquicias = async (req, res) => {
    try {
        const franquicias = await Franquicia.findAll();
        res.json(franquicias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener franquicias.', error: error.message });
    }
};

const crearFranquicia = async (req, res) => {
    try {
        const franquicia = await Franquicia.create(req.body);
        res.status(201).json(franquicia);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear franquicia.', error: error.message });
    }
};

const actualizarFranquicia = async (req, res) => {
    try {
        const franquicia = await Franquicia.findByPk(req.params.id);
        if (!franquicia) return res.status(404).json({ message: 'Franquicia no encontrada.' });
        await franquicia.update(req.body);
        res.json(franquicia);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar franquicia.', error: error.message });
    }
};

const eliminarFranquicia = async (req, res) => {
    try {
        const franquicia = await Franquicia.findByPk(req.params.id);
        if (!franquicia) return res.status(404).json({ message: 'Franquicia no encontrada.' });
        await franquicia.destroy();
        res.json({ message: 'Franquicia eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar franquicia.', error: error.message });
    }
};

module.exports = { obtenerFranquicias, crearFranquicia, actualizarFranquicia, eliminarFranquicia };