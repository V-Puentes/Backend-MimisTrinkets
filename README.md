# Backend Webstore

Para la creación del repositorio se3 ejecutó 'npm install express sequelize pg pg-hstore cors dotenv bcryptjs jsonwebtoken' ´para instalar dependencias y 'npm install -D nodemon' para la herramienta de desarrollo

la estructura mvc se crea con 'mkdir src/config src/controllers src/models src/routes src/middlewares src/utils'

.env: almacena las variables de entorno

source:
* config:
    ** database.js: conecta proyecto con PostgreSQL utilizando el ORM
* index.js punto de entrada de la aplicación Express
*models: mapeo de tablas