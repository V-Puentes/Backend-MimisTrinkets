const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Franquicia = sequelize.define('Franquicia', {
    ID_FRANQUICIA: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE_FRANQ: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    EMPRESA_ORIGEN: {
        type: DataTypes.STRING(100)
    }
}, {
    tableName: 'FRANQUICIA',
    timestamps: false
});

module.exports = Franquicia;