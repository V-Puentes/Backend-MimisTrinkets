const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');
const jwt = require('jsonwebtoken');

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
            attributes: { exclude: ['PASSWORD_HASH'] },
            include: [{ model: Rol, attributes: ['NOMBRE_ROL'] }]
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
    }
};

// UPDATE (Administrador modifica a terceros por ID)
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

const actualizarPerfil = async (req, res) => {
    try {
        const idUsuarioLogueado = req.user.id;
        const { NOMBRE, RUT, DIRECCION } = req.body;

        const usuario = await Usuario.findByPk(idUsuarioLogueado, {
            include: [{ model: Rol, attributes: ['NOMBRE_ROL'] }]
        });
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 1. Actualizar el registro en la Base de Datos
        await usuario.update({ NOMBRE, RUT, DIRECCION });

        // 2. Firmar nuevo token replicando la estructura exacta del authController
        const token = jwt.sign(
            {
                id: usuario.ID_USUARIO,
                rolId: usuario.ROL_ID,
                rolNombre: usuario.Rol?.NOMBRE_ROL || 'Cliente',
                nombre: usuario.NOMBRE,
                email: usuario.EMAIL,
                rut: usuario.RUT,          // Inclusión de persistencia para F5
                direccion: usuario.DIRECCION // Inclusión de persistencia para F5
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 3. Respuesta JSON consistente con el formato del login
        res.json({ 
            message: 'Perfil actualizado correctamente.', 
            token,
            usuario: {
                id: usuario.ID_USUARIO,
                nombre: usuario.NOMBRE,
                email: usuario.EMAIL,
                rut: usuario.RUT,
                direccion: usuario.DIRECCION,
                rol: usuario.Rol?.NOMBRE_ROL || 'Cliente'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el perfil.', error: error.message });
    }
};

const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ajuste esta consulta según el ORM (Sequelize/Prisma) o driver SQL que esté utilizando.
        // Ejemplo genérico con Sequelize:
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['PASSWORD'] } // Práctica de seguridad: no retornar el hash
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { crearUsuario, obtenerUsuarios, actualizarUsuario, actualizarPerfil, eliminarUsuario, obtenerUsuarioPorId };