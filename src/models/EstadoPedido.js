const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstadoPedido = sequelize.define('EstadoPedido', {
    ID_ESTADO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_ESTADO: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    DESCRIPCION: {
        type: DataTypes.STRING(200)
    }
}, {
    tableName: 'ESTADO_PEDIDO',
    timestamps: false
});

module.exports = EstadoPedido;