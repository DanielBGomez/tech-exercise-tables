# Front-end
Para el frontend de la aplicación, decidí utilizar **Nuxt** como framework, ya que últimamente he trabajado bastante con este framework, además de que su estructura de directorios es muy cómoda para trabajar.

## Instalación
Para la instalación del sistema de front-end, simplemente necesitas clonar el repositorio y relaizar la instalación de las dependencias con npm utilizando el siguiente comando:
```
npm install
```

## Configuración
La única configuración que requiere el sistema de front-end es la especificación del servidor de back-end donde realizará las consultas HTTP.

Esta configuración se puede realizar en un archivo `.env` o como variable de entorno.
```
API_URL="http://127.0.0.1:3100"
```

## Ejecución
Para ejecutar el servidor de front-end, una vez que tengas las dependencias instaladas y las configuraciones a tu gusto, puedes optar por las siguienes opciones:

### Modo Development
Esta es la opción más sencilla, ya que automáticamente compila los archivos, además de que te ejecuta el servidor una vez esté listo.

```
npm run dev
```

### Modo production
Esta opción es más limpia, pero requiere que se ejecute en 2 pasos, ya que primero necesita generar los archivos de producción y posteriormente ejecutar el servidor en producción:

Compilar:
```
npm run build
```

Iniciar servidor de producción
```
npm run start
```
