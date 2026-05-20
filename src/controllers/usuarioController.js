const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');

// CREATE
const crearUsuario = async (req, res) => {
    try {
        const { RUT, NOMBRE, EMAIL, PASSWORD, FECHA_NACIMIENTO, DIRECCION, ROL_ID } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        const nuevoUsuario = await Usuario.create({
            RUT, NOMBRE, EMAIL, PASSWORD_HASH: hashedPassword, FECHA_NACIMIENTO, DIRECCION, ROL_ID
        });

        res.status(201).json({ message: 'Usuario creado exitosamente.', email: nuevoUsuario.EMAIL });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario.', error: error.message });
    }
};

// READ
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['PASSWORD_HASH'] }, // Excluir contraseñas de la respuesta
            include: [{ model: Rol, attributes: ['NOMBRE_ROL'] }]
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
    }
};

// UPDATE
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { NOMBRE, DIRECCION, ROL_ID } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        await usuario.update({ NOMBRE, DIRECCION, ROL_ID });
        res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
    }
};

// DELETE
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        await usuario.destroy();
        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
    }
};

module.exports = { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario };