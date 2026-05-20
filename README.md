# Backend Webstore

Para la creación del repositorio se ejecutó 'npm install express sequelize pg pg-hstore cors dotenv bcryptjs jsonwebtoken' ´para instalar dependencias y 'npm install -D nodemon' para la herramienta de desarrollo

la estructura mvc se crea con 'mkdir src/config src/controllers src/models src/routes src/middlewares src/utils'

.env: almacena las variables de entorno

source:
* config:
    ** database.js: conecta proyecto con PostgreSQL utilizando el ORM
* index.js punto de entrada de la aplicación Express
* models: mapeo de tablas
* controllers
    ** authController.js: procesa solicitudes de login comparando los campos
    ** usuarioController.js: recibe datos en texto plano, encripta la contraseña y guarda los datos en PostgreSQL
    ** categoriaController.js:crud categorias
    ** franquiciaController.js: crud franquicias
    ** productoController.js: crud productos
    ** rolController.js:crud roles
    ** metodoPagoController.js:crud metodos de pago
    ** estadoPedidoController.js:crud
* middlewares
    ** authMiddleware.js: verifica peticiones tengan permisos necesarios
* routes
    ** authRoutes.js: endpoint al público
    ** los otros routes son para autenticacion mediante middlewares, define que es público y qué privado

Sobre el mantenedor de usuarios su acceso es solo para administradores(get, post,put,delete)
Sobre el mantenedor del catalogo que incluye categorias, franquicias y productos el acceso es mixto, lectura publica (get)y modificacion por admin(post,put,delete)