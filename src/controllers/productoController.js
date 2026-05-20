const { Producto, Categoria, Franquicia } = require('../models');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                { model: Categoria, attributes: ['NOMBRE_CAT'] },
                { model: Franquicia, attributes: ['NOMBRE_FRANQ'] }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos.', error: error.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const producto = await Producto.create(req.body);
        res.status(201).json(producto);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto.', error: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
        await producto.update(req.body);
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto.', error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado.' });
        await producto.destroy();
        res.json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto.', error: error.message });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };