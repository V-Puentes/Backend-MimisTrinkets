const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleCarrito = sequelize.define('DetalleCarrito', {
    ID_DETALLE_CAR: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CARRITO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PRODUCTO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CANTIDAD: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'DETALLE_CARRITO',
    timestamps: false
});

module.exports = DetalleCarrito;