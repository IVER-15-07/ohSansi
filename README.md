# ohSansi

Este repositorio contiene un sistema web diseñado para la gestión de olimpiadas académicas. Está dividido en dos partes principales: el **frontend** y el **backend**, cada uno con su propia configuración y funcionalidad. A continuación, se detalla el funcionamiento, los requisitos y las consideraciones necesarias para utilizar este sistema.

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Frontend](#frontend)
    - [Instalación y Configuración](#instalación-y-configuración-del-frontend)
    - [Estructura del Código](#estructura-del-código-del-frontend)
4. [Backend](#backend)
    - [Instalación y Configuración](#instalación-y-configuración-del-backend)
    - [Estructura del Código](#estructura-del-código-del-backend)
5. [Consideraciones Adicionales](#consideraciones-adicionales)
6. [Licencia](#licencia)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu sistema:

- **Node.js** (versión 18 o superior) y **npm** (para el frontend).
- **PHP** (versión 7.3 o superior) y **Composer** (para el backend).
- **MySQL** o cualquier base de datos compatible con Laravel.
- **Git** (opcional, para clonar el repositorio).
- **Vite** (para el desarrollo del frontend).
- **Servidor web** como Apache o Nginx (para el despliegue del backend).
- **Xampp** (version 8.2.12 Linux)

---

## Arquitectura del Sistema

El sistema está dividido en dos partes principales:

1. **Frontend**: Construido con React y Vite, se encarga de la interfaz de usuario. Utiliza TailwindCSS para el diseño y Axios para las solicitudes HTTP al backend.
2. **Backend**: Construido con Laravel, se encarga de la lógica del servidor, la gestión de la base de datos y la API REST que interactúa con el frontend.

### Flujo de Trabajo

1. El usuario interactúa con la interfaz del frontend.
2. El frontend realiza solicitudes HTTP al backend a través de la API.
3. El backend procesa las solicitudes, interactúa con la base de datos y devuelve las respuestas al frontend.

---

## Frontend

### Instalación y Configuración del Frontend

1. Navega al directorio del frontend:
    ```bash
    cd frontend
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```
3. Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4. Accede a la aplicación en tu navegador en http://localhost:5173.

### Estructura del Código del Frontend

El código del frontend está organizado de la siguiente manera:

- **src/components**: Contiene los componentes reutilizables de la interfaz.
- **src/pages**: Contiene las vistas principales del sistema.
- **src/services**: Contiene las funciones para realizar solicitudes HTTP al backend.
- **src/styles**: Contiene los estilos personalizados y configuraciones de TailwindCSS.
- **src/assets**: Contiene los material visual que se usaran en la interfaz, como ser imagenes , iconos, fondos.

---

## Backend

### Instalación y Configuración del Backend

1. Navega al directorio del backend:
    ```bash
    cd backend
    ```
2. Instala las dependencias de PHP utilizando Composer:
    ```bash
    composer install
    ```
3. Configura el archivo `.env` con los detalles de tu base de datos y otras configuraciones necesarias.
    ```bash
    cp .env.example .env
    ```

4. Configura las variables de entorno en el archivo .env:

    - Configura la conexión a la base de datos (**DB_HOST**, **DB_DATABASE**, **DB_USERNAME**, **DB_PASSWORD**).
    - Configura la URL base de la aplicación (**APP_URL**).
5. Genera la clave de la aplicación:
    
    ```bash
    php artisan key:generate
    ```
6. Ejecuta las migraciones para crear las tablas en la base de datos:
    ```bash
    php artisan migrate
    ```
7. Inicia el servidor de desarrollo:
     ```bash
    php artisan serve
    ```
8. Accede al backend en http://localhost:8000.

### Estructura del Código del Backend

El código del backend está organizado de la siguiente manera:

- `app/Models`: Contiene los modelos de Eloquent para interactuar con la base de datos.
- **app/Http/Controllers**: Contiene los controladores que manejan las solicitudes HTTP.
- `routes/api.php`: Define las rutas de la API REST.
- **database/migrations**: Contiene las migraciones para la estructura de la base de datos.
- `routes/web.php`: Define las rutas principales de la aplicación.
- **routes/console.php**: Contiene comandos personalizados para la consola.
- `app/Http/Controllers`: Contiene los controladores que manejan la lógica del backend.
- **resources/views**: Contiene las vistas Blade para el frontend del backend.
- `config/cors.php`: Configuración de CORS para permitir solicitudes desde el frontend.
- **public/index.php**: Punto de entrada principal para las solicitudes HTTP.


---

## Consideraciones Adicionales

1.  *Autenticación*: El sistema puede requerir autenticación para ciertas rutas. Configura los middlewares en el backend según sea necesario.
2. *Despliegue*:
    - Para el frontend, genera los archivos estáticos con:
     ```bash
    npm run build
    ```
    - Para el backend, asegúrate de configurar correctamente el servidor web (Apache/Nginx) y las variables de entorno.
3. *Manejo de Errores*: El backend incluye manejo básico de errores. Asegúrate de revisar los logs en storage/logs/laravel.log para depuración.
4. *Estilo de Código*: El backend utiliza Laravel Mix para compilar los activos y .styleci.yml para mantener un estilo de código consistente.
5. *Base de Datos*: Asegúrate de realizar respaldos periódicos de la base de datos.
--- 
6. Asegúrate de configurar correctamente los permisos de los directorios `storage` y `bootstrap/cache` en el backend.
7. Utiliza un servidor web como Apache o Nginx para el despliegue en producción.
8. Configura un certificado SSL para garantizar la seguridad de las comunicaciones entre el frontend y el backend.

---

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE). Puedes usarlo, modificarlo y distribuirlo libremente, siempre y cuando incluyas la licencia original.
