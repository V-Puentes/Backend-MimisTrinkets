const { Rol } = require('../models');

const obtenerRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener roles.', error: error.message });
    }
};

const crearRol = async (req, res) => {
    try {
        const rol = await Rol.create(req.body);
        res.status(201).json(rol);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear rol.', error: error.message });
    }
};

const actualizarRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) return res.status(404).json({ message: 'Rol no encontrado.' });
        await rol.update(req.body);
        res.json(rol);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar rol.', error: error.message });
    }
};

const eliminarRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) return res.status(404).json({ message: 'Rol no encontrado.' });
        await rol.destroy();
        res.json({ message: 'Rol eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar rol.', error: error.message });
    }
};

module.exports = { obtenerRoles, crearRol, actualizarRol, eliminarRol };