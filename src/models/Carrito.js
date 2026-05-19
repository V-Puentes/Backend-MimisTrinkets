const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrito = sequelize.define('Carrito', {
    ID_CARRITO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    USUARIO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    FECHA_ACTUALIZACION: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'CARRITO',
    timestamps: false
});

module.exports = Carrito;