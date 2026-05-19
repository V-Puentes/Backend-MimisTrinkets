const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Franquicia = require('./Franquicia');
const Producto = require('./Producto');
const MetodoPago = require('./MetodoPago');
const EstadoPedido = require('./EstadoPedido');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
const Carrito = require('./Carrito');
const DetalleCarrito = require('./DetalleCarrito');

// --- Autenticación ---
Rol.hasMany(Usuario, { foreignKey: 'ROL_ID' });
Usuario.belongsTo(Rol, { foreignKey: 'ROL_ID' });

// --- Catálogo ---
Categoria.hasMany(Producto, { foreignKey: 'CATEGORIA_ID' });
Producto.belongsTo(Categoria, { foreignKey: 'CATEGORIA_ID' });

Franquicia.hasMany(Producto, { foreignKey: 'FRANQUICIA_ID' });
Producto.belongsTo(Franquicia, { foreignKey: 'FRANQUICIA_ID' });

// --- Pedidos ---
Usuario.hasMany(Pedido, { foreignKey: 'USUARIO_ID' });
Pedido.belongsTo(Usuario, { foreignKey: 'USUARIO_ID' });

EstadoPedido.hasMany(Pedido, { foreignKey: 'ESTADO_ID' });
Pedido.belongsTo(EstadoPedido, { foreignKey: 'ESTADO_ID' });

MetodoPago.hasMany(Pedido, { foreignKey: 'METODO_PAGO_ID' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'METODO_PAGO_ID' });

Pedido.hasMany(DetallePedido, { foreignKey: 'PEDIDO_ID', onDelete: 'CASCADE' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'PEDIDO_ID' });

Producto.hasMany(DetallePedido, { foreignKey: 'PRODUCTO_ID' });
DetallePedido.belongsTo(Producto, { foreignKey: 'PRODUCTO_ID' });

// --- Carrito ---
Usuario.hasOne(Carrito, { foreignKey: 'USUARIO_ID', onDelete: 'CASCADE' });
Carrito.belongsTo(Usuario, { foreignKey: 'USUARIO_ID' });

Carrito.hasMany(DetalleCarrito, { foreignKey: 'CARRITO_ID', onDelete: 'CASCADE' });
DetalleCarrito.belongsTo(Carrito, { foreignKey: 'CARRITO_ID' });

Producto.hasMany(DetalleCarrito, { foreignKey: 'PRODUCTO_ID' });
DetalleCarrito.belongsTo(Producto, { foreignKey: 'PRODUCTO_ID' });

module.exports = {
    Rol,
    Usuario,
    Categoria,
    Franquicia,
    Producto,
    MetodoPago,
    EstadoPedido,
    Pedido,
    DetallePedido,
    Carrito,
    DetalleCarrito
};