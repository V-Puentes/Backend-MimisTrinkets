const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

const login = async (req, res) => {
    try {
        const { EMAIL, PASSWORD } = req.body;

        // Búsqueda del usuario
        const usuario = await Usuario.findOne({
            where: { EMAIL },
            include: [{ model: Rol, attributes: ['NOMBRE_ROL'] }]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Comparación de contraseñas
        const isMatch = await bcrypt.compare(PASSWORD, usuario.PASSWORD_HASH);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generación del Payload y firma del JWT
        const token = jwt.sign(
            {
                id: usuario.ID_USUARIO,
                rolId: usuario.ROL_ID,
                rolNombre: usuario.Rol.NOMBRE_ROL,
                nombre: usuario.NOMBRE,
                email: usuario.EMAIL
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Autenticación exitosa',
            token,
            usuario: {
                id: usuario.ID_USUARIO,
                nombre: usuario.NOMBRE,
                email: usuario.EMAIL,
                rol: usuario.Rol.NOMBRE_ROL
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

module.exports = { login };