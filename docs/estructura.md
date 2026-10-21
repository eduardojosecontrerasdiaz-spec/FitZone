# Estructura de FitZone

## Páginas

- `index.html`: página principal.
- `pages/planes.html`: planes disponibles.
- `pages/registro.html`: formulario de solicitud de membresía.
- `pages/clases.html` y `pages/detalle-clase.html`: catálogo y detalle de clases.
- `pages/entrenadores.html` y `pages/perfil-entrenador.html`: catálogo y perfiles de entrenadores.
- `pages/contacto.html`: formulario de contacto.
- `pages/admin.html` y `pages/dashboard.html`: acceso y panel de administración.

## CSS

`css/style.css` es el manifiesto compatible que importa estilos por responsabilidad: `global.css`, `navigation.css`, `hero.css`, `buttons-sections.css`, `grids-cards.css`, `plans-testimonials-location.css`, `contact.css`, `trainers-dashboard.css`, `footer.css`, `page-classes.css`, `page-plans.css`, `page-animation.css`, `page-registration-profile.css`, `page-class-details.css`, `uniformity.css`, `plans-components.css`, `dashboard-forms.css`, `interactions.css`, `theme-fixes.css` y `polish.css`. `backend-status.css` contiene los nuevos avisos de sincronización y estado de solicitud. `variables.css` y `responsive.css` se siguen cargando aparte en las páginas para conservar las rutas existentes.

## JavaScript

- `js/api.js`: cliente HTTP para la API propia y consulta de muestra a JSONPlaceholder.
- `js/app.js`: envío del formulario de contacto.
- `js/storage.js`: funciones de compatibilidad con LocalStorage y sincronización con el servidor.
- `js/admin/dashboard-core.js`: utilidades compartidas del dashboard.
- `js/admin/members.js`: gestión de miembros y solicitudes.
- `js/admin/trainers.js`: gestión de entrenadores.
- `js/admin/classes.js`: gestión de clases.
- `js/servicios.js`: gestión de servicios.
- `js/admin-login.js`, `js/dashboard-guard.js`, `js/admin-dashboard.js`, `js/admin-messages.js`: acceso, sesión y mensajes.
- Los otros archivos `js/*.js` mantienen la lógica específica de cada página.

## Backend y base de datos

- `server/index.js`: verifica configuración, prepara esquema e inicia el servicio.
- `server/app.js`: configura Express, cabeceras de seguridad y archivos públicos.
- `server/db.js`: pool PostgreSQL y esquema mínimo de datos.
- `server/auth.js`: sesión de administrador firmada y middleware de protección.
- `server/validation.js`: validación de datos de formularios.
- `server/routes/public.js`: rutas públicas y rutas de administración protegidas.

Tablas: `members`, `contact_messages` y `site_collections`. El esquema se crea o actualiza al iniciar el servicio. Las credenciales de administrador se configuran en variables de entorno; la versión actual no recopila ni guarda contraseñas de clientes, porque no incluye inicio de sesión para clientes. Si el Dashboard encuentra miembros antiguos en LocalStorage mientras la tabla remota está vacía, solicita permiso antes de importarlos.

## Configuración y pruebas

- `.env.example`: muestra el nombre de las variables requeridas sin guardar secretos.
- `railway.json`: define `npm start` y la comprobación `/api/health`.
- `tests/`: pruebas automáticas de validación de datos.
- `docs/DEPLOY_RAILWAY.md`: guía de despliegue y comprobaciones.
