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

        // Construcción dinámica del payload de actualización
        // Solo se asignan los campos que vengan explícitamente en la petición
        const camposActualizar = {};

        if (NOMBRE !== undefined) camposActualizar.NOMBRE = NOMBRE;
        if (DIRECCION !== undefined) camposActualizar.DIRECCION = DIRECCION;
        
        // El perfil del cliente no enviará ROL_ID, por lo que esta condición lo saltará.
        // El panel de administrador sí lo enviará, permitiendo la asignación de roles.
        if (ROL_ID !== undefined) camposActualizar.ROL_ID = parseInt(ROL_ID, 10);

        // Seguridad: Evitar peticiones vacías a la base de datos
        if (Object.keys(camposActualizar).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron datos válidos para la actualización.' });
        }

        await usuario.update(camposActualizar);
        res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
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

const actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { ROL_ID } = req.body;

        // Validación de presencia del campo
        if (ROL_ID === undefined) {
            return res.status(400).json({ message: 'El campo ROL_ID es obligatorio.' });
        }

        // Validación de rango de roles permitidos (1: Cliente, 2: Administrador)
        if (![1, 2].includes(parseInt(ROL_ID, 10))) {
            return res.status(400).json({ message: 'El ROL_ID proporcionado no es válido.' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Actualización exclusiva de la columna ROL_ID
        await usuario.update({ ROL_ID: parseInt(ROL_ID, 10) });
        
        res.json({ message: 'Rol de usuario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el rol:', error);
        res.status(500).json({ message: 'Error al actualizar el rol del usuario.', error: error.message });
    }
};

module.exports = { crearUsuario, obtenerUsuarios, actualizarUsuario,
actualizarPerfil, eliminarUsuario, obtenerUsuarioPorId,
    actualizarRol };