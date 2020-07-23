# Back-end
Para el backend de la aplicación, decidí crear un servidor con **express**, bases de datos con **MySQL** y adicionalmente utilicé algunas librerías que desarrollé en otros proyectos para facilitar el trabajo.

## Instalación
Para la instalación del sistema de back-end, simplemente necesitas clonar el repositorio y realizar la instalación de las dependencias con npm utilizando el siguiente comando:
```
npm install
```

## Configuración
La configuración del servidor se puede realizar en un archivo `.env` o por medio de variables de entorno.

Las configuraciones predeterminadas, ejemplificando un archivo .env, son las siguientes:
```.env
# Database
DB_HOST='localhost'
DB_USER='root'
DB_PASSWORD=''
DB_DATABASE='tech_test' # Este archivo lo puedes encontrar en la raíz del proyecto

# Server
PORT=3100
```

## Ejecución
Para ejecutar el servidor, una vez que tengas las dependencias instaladas y las configuraciones a tu gusto, simplemente ejecuta:
```
npm start
```
También puedes ejecutar directamente con Node:
```
node index
```

## Notas adicionales
> La librería y configuración de MySQL utiliza una Pool de conexiones, por lo que si el servidor no está correctamente configurado no te mandará error hasta que realices una conexión a la base de datos por medio de un endpoint.
