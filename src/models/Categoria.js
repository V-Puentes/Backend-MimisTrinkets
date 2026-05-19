const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    ID_CATEGORIA: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_CAT: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    DESCRIPCION: {
        type: DataTypes.STRING(200)
    }
}, {
    tableName: 'CATEGORIA',
    timestamps: false
});

module.exports = Categoria;