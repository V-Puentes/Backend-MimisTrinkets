const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
    ID_DETALLE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PEDIDO_ID: {
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
    },
    PRECIO_UNITARIO: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'DETALLE_PEDIDO',
    timestamps: false
});

module.exports = DetallePedido;