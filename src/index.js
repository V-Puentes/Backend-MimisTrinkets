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

// --- Importación de Rutas ---
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const franquiciaRoutes = require('./routes/franquiciaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const rolRoutes = require('./routes/rolRoutes');
const metodoPagoRoutes = require('./routes/metodoPagoRoutes');
const estadoPedidoRoutes = require('./routes/estadoPedidoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const transbankRoutes = require('./routes/transbankRoutes');

// --- Configuración de Rutas base ---
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/franquicias', franquiciaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/estados-pedido', estadoPedidoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/transbank', transbankRoutes);

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