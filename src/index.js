const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const { Rol, Usuario } = require('./models');

// Middlewares
app.use(cors());
app.use(express.json());

// Verificación de conexión a PostgreSQL
const testDBConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        // Sincroniza los modelos con la base de datos sin alterar los datos existentes
        await sequelize.sync({ alter: false });
        console.log('Modelos sincronizados con PostgreSQL.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    testDBConnection();
});