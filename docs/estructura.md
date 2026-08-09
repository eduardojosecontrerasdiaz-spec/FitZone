# Estructura del Proyecto FitZone

## 1. Estructura general

El proyecto está organizado en diferentes carpetas de acuerdo con la función de cada recurso.

```text
FitZone/
│
├── index.html
├── README.md
│
├── pages/
├── css/
├── js/
├── assets/
├── data/
└── docs/
```

---

## 2. Archivos HTML

### `index.html`

Es la página principal de FitZone. Presenta la identidad del gimnasio y las principales secciones informativas.

### `pages/planes.html`

Presenta los planes de membresía disponibles.

Esta página utiliza componentes de Bootstrap 5.

### `pages/registro.html`

Contiene el formulario utilizado para el registro de una membresía.

### `pages/clases.html`

Presenta las clases disponibles en FitZone.

### `pages/detalle-clase.html`

Muestra información detallada de una clase seleccionada.

### `pages/entrenadores.html`

Presenta información de los entrenadores del gimnasio.

### `pages/perfil-entrenador.html`

Muestra información detallada de un entrenador seleccionado.

### `pages/contacto.html`

Contiene el formulario de contacto de FitZone.

### `pages/dashboard.html`

Contiene el panel administrativo del proyecto.

Esta página permite gestionar información mediante JavaScript y LocalStorage y utiliza una sección desarrollada con Tailwind CSS.

---

## 3. Carpeta `css/`

Contiene los archivos relacionados con los estilos propios del proyecto.

### `variables.css`

Contiene las variables CSS utilizadas para mantener una identidad visual consistente.

### `style.css`

Contiene los estilos generales y principales de la aplicación.

### `responsive.css`

Contiene las reglas necesarias para adaptar la interfaz a diferentes tamaños de pantalla.

---

## 4. Carpeta `js/`

Contiene la lógica JavaScript del proyecto.

### `app.js`

Gestiona comportamientos generales de la aplicación y eventos relacionados con la interfaz.

### `storage.js`

Contiene las funciones relacionadas con LocalStorage.

Permite guardar, obtener y eliminar información almacenada localmente.

### `crud.js`

Implementa las operaciones CRUD utilizadas en el Dashboard.

Permite gestionar:

* Usuarios.
* Entrenadores.
* Clases.

### `validation.js`

Contiene las validaciones utilizadas en los formularios.

### `api.js`

Realiza el consumo de la API pública JSONPlaceholder mediante `fetch()`.

### `darkmode.js`

Gestiona la funcionalidad del modo oscuro.

### `planes.js`

Gestiona las interacciones relacionadas con los planes de membresía.

### `registro.js`

Gestiona la lógica del formulario de registro y la información del plan seleccionado.

### `clases.js`

Gestiona información y comportamiento relacionado con las clases.

### `detalle-clase.js`

Gestiona la información mostrada en el detalle de una clase.

### `entrenadores.js`

Gestiona información relacionada con los entrenadores.

### `perfil-entrenador.js`

Gestiona la información mostrada en el perfil individual de un entrenador.

---

## 5. Carpeta `assets/`

Contiene los recursos utilizados por la aplicación.

### `assets/images/`

Contiene imágenes utilizadas en las diferentes páginas del gimnasio.

### `assets/icons/`

Contiene iconos y recursos gráficos del proyecto.

---

## 6. Carpeta `data/`

Contiene el espacio destinado a información o recursos relacionados con los datos del proyecto.

La persistencia principal de la aplicación se realiza mediante LocalStorage.

---

## 7. Carpeta `docs/`

Contiene la documentación del proyecto.

### `bitacora.md`

Registra las actividades realizadas durante las jornadas de desarrollo.

### `cambios.md`

Registra la evolución y los cambios importantes realizados durante el proyecto.

### `estructura.md`

Explica la organización de carpetas y archivos.

### `funcionalidades.md`

Describe las funcionalidades implementadas.

### `REDISENO_V2.md`

Documenta la segunda versión del rediseño visual de FitZone.

---

## 8. Organización del código

La estructura busca separar responsabilidades para facilitar el mantenimiento del proyecto.

Los archivos HTML contienen la estructura de las páginas.

Los archivos CSS contienen los estilos.

Los archivos JavaScript contienen la lógica y funcionalidades.

Los recursos gráficos se encuentran en `assets/`.

La documentación se encuentra en `docs/`.