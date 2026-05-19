const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
    ID_PEDIDO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    USUARIO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    FECHA_PEDIDO: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    SUBTOTAL: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    VALOR_IVA: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    TOTAL_CON_IVA: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    DIRECCION_ENVIO: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    ESTADO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    METODO_PAGO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'PEDIDO',
    timestamps: false
});

module.exports = Pedido;