const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MetodoPago = sequelize.define('MetodoPago', {
    ID_METODO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_METODO: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    ACTIVO: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'METODO_PAGO',
    timestamps: false
});

module.exports = MetodoPago;