const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    ID_USUARIO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    RUT: {
        type: DataTypes.STRING(12),
        unique: true
    },
    NOMBRE: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    EMAIL: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    PASSWORD_HASH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    FECHA_NACIMIENTO: {
        type: DataTypes.DATEONLY
    },
    DIRECCION: {
        type: DataTypes.STRING(150)
    },
    FECHA_REGISTRO: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ROL_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'USUARIO',
    timestamps: false
});

module.exports = Usuario;