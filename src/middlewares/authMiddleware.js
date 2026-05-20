const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica la existencia y validez del JWT en las cabeceras HTTP
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }
        // Inyecta la información del usuario en la solicitud
        req.user = decoded;
        next();
    });
};

// Verifica que el usuario tenga el rol de Administrador (ID: 2)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rolId === 2) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de Administrador.' });
    }
};

module.exports = { verifyToken, isAdmin };