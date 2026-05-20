const { Categoria } = require('../models');

const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías.', error: error.message });
    }
};

const crearCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría.', error: error.message });
    }
};

const actualizarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada.' });
        await categoria.update(req.body);
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar categoría.', error: error.message });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada.' });
        await categoria.destroy();
        res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar categoría.', error: error.message });
    }
};

module.exports = { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria };