const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
    ID_ROL: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_ROL: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    DESCRIPCION: {
        type: DataTypes.STRING(200)
    }
}, {
    tableName: 'ROL',
    timestamps: false
});

module.exports = Rol;