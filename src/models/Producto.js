const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    ID_PRODUCTO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_PROD: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    DESCRIPCION_PROD: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    PRECIO_PROD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    PORCENTAJE_OFERTA: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    IMAGEN_URL: {
        type: DataTypes.STRING(350)
    },
    STOCK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    CATEGORIA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    FRANQUICIA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'PRODUCTO',
    timestamps: false
});

module.exports = Producto;