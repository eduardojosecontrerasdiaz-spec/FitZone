# FitZone

FitZone es una aplicación web responsive para la gestión y presentación de los servicios de un gimnasio. E
La aplicación integra HTML5, CSS3, JavaScript Vanilla, Bootstrap 5, Tailwind CSS y LocalStorage para crear una interfaz moderna, responsive y funcional.

## Objetivo

Desarrollar una aplicación web para un gimnasio que permita a los usuarios consultar información sobre clases, entrenadores y planes de membresía, además de incorporar funcionalidades dinámicas mediante JavaScript y almacenamiento local.

## Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript Vanilla
* Bootstrap 5
* Tailwind CSS
* LocalStorage
* API pública JSONPlaceholder

## Estructura del proyecto

```text
FitZone/
│
├── index.html
├── README.md
│
├── pages/
│   ├── clases.html
│   ├── contacto.html
│   ├── dashboard.html
│   ├── detalle-clase.html
│   ├── entrenadores.html
│   ├── perfil-entrenador.html
│   ├── planes.html
│   └── registro.html
│
├── css/
│   ├── variables.css
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── api.js
│   ├── app.js
│   ├── clases.js
│   ├── crud.js
│   ├── darkmode.js
│   ├── detalle-clase.js
│   ├── entrenadores.js
│   ├── perfil-entrenador.js
│   ├── planes.js
│   ├── registro.js
│   ├── storage.js
│   └── validation.js
│
├── assets/
│   ├── icons/
│   └── images/
│
├── data/
│
└── docs/
    ├── bitacora.md
    ├── cambios.md
    ├── estructura.md
    ├── funcionalidades.md
    └── REDISENO_V2.md
```

## Funcionalidades principales

### Navegación

La aplicación cuenta con diferentes páginas relacionadas con los servicios del gimnasio y permite navegar entre ellas mediante los elementos de navegación.

### Planes

Permite consultar los diferentes planes de membresía disponibles y acceder al proceso de registro.

### Registro

Permite ingresar información para realizar el registro de una membresía.

### Clases

Permite consultar las clases disponibles y acceder a páginas con información detallada.

### Entrenadores

Permite consultar los entrenadores disponibles y acceder a sus perfiles individuales.

### Dashboard

Incluye un panel de administración para gestionar información de usuarios, entrenadores y clases.

### CRUD

El Dashboard implementa operaciones para:

* Crear registros.
* Consultar registros.
* Editar registros.
* Eliminar registros.

Estas operaciones utilizan LocalStorage como mecanismo de persistencia.

### Buscador

El Dashboard cuenta con un buscador para facilitar la consulta de usuarios.

### Modo oscuro

La aplicación incorpora un modo oscuro para modificar la apariencia visual de la interfaz.

### Contadores dinámicos

El Dashboard utiliza contadores para mostrar información resumida de los registros administrados.

### Barra de progreso

Se incorpora una barra de progreso dentro de la interfaz del Dashboard.

### Validaciones

Se realizan validaciones sobre diferentes formularios y campos, incluyendo datos obligatorios, correo electrónico y contraseñas.

### API pública

FitZone consume la API pública JSONPlaceholder mediante `fetch()` y muestra dinámicamente información obtenida de la API en el Dashboard.

### Bootstrap 5

Se utiliza Bootstrap 5 para implementar diferentes componentes de la interfaz, incluyendo:

* Navbar
* Cards
* Carousel
* Modal
* Toast
* Accordion
* Offcanvas
* Formularios
* Botones
* Grid

### Tailwind CSS

El Dashboard incorpora una sección desarrollada utilizando Tailwind CSS.

## Diseño Responsive

El proyecto fue desarrollado buscando una correcta visualización en diferentes dispositivos:

* Computadores.
* Tablets.
* Teléfonos móviles.

Para esto se utilizan estilos CSS y reglas responsive.

## LocalStorage

FitZone no utiliza una base de datos externa.

La información administrada desde el Dashboard se almacena localmente mediante LocalStorage.

Esto permite conservar los datos en el navegador del usuario.

## API

Para consumir la API pública es necesaria una conexión a Internet.

La aplicación utiliza JSONPlaceholder para obtener información mediante solicitudes `fetch()`.

## Cómo ejecutar el proyecto

1. Clonar el repositorio de FitZone.
2. Abrir la carpeta del proyecto.
3. Abrir `index.html` en un navegador.

También se recomienda utilizar una extensión como Live Server desde Visual Studio Code para ejecutar el proyecto durante el desarrollo.

## Documentación

La carpeta `docs/` contiene documentación sobre:

* Bitácora del desarrollo.
* Historial de cambios.
* Estructura del proyecto.
* Funcionalidades.
* Rediseño visual.

## Proyecto académico

**SENA**

Programa: Análisis y Desarrollo de Software (ADSO)

Proyecto: FitZone