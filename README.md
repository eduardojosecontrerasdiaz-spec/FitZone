# FitZone

FitZone es una web responsive para presentar los servicios de un gimnasio y administrar solicitudes de membresía, mensajes, clases, entrenadores y servicios. La interfaz se conserva como base; los estilos y el JavaScript se ordenaron por responsabilidades, y ahora existe una API Node.js con PostgreSQL para los datos que deben persistir entre dispositivos.

## Tecnologías

- HTML, CSS y JavaScript sin framework de frontend obligatorio.
- Node.js 20 o superior y Express para servir la web y la API desde el mismo servicio.
- PostgreSQL para almacenar solicitudes de membresía, mensajes y contenido administrable.
- Railway para el despliegue; `railway.json` configura el inicio y el chequeo de salud.

## Estructura

```text
FitZone/
├── index.html
├── pages/                   # Páginas públicas y acceso al panel
├── css/
│   ├── style.css            # Manifiesto que importa los estilos divididos
│   ├── variables.css
│   ├── responsive.css
│   └── *.css                # Archivos por sección/componente
├── js/
│   ├── api.js               # Cliente para la API del mismo dominio
│   ├── app.js               # Formulario de contacto y lógica general
│   ├── storage.js           # Compatibilidad con datos locales
│   ├── admin/               # Miembros, clases, entrenadores y resumen
│   └── *.js                 # Lógica específica por página
├── server/
│   ├── index.js             # Arranque y cierre del servidor
│   ├── app.js               # Express, seguridad HTTP y archivos públicos
│   ├── db.js                # Pool PostgreSQL y esquema mínimo
│   ├── auth.js              # Sesión firmada para el administrador
│   ├── validation.js        # Validación del lado servidor
│   └── routes/public.js     # API pública y rutas protegidas de administración
├── tests/                   # Pruebas automáticas básicas
├── scripts/check-syntax.js  # Revisión sintáctica de todos los archivos JS
├── docs/DEPLOY_RAILWAY.md   # Guía de publicación
├── .env.example             # Plantilla sin secretos
├── package.json
└── railway.json
```

## CSS y JavaScript

`css/style.css` se mantiene como punto de entrada para que las páginas existentes no dependan de un cambio masivo. Importa archivos separados por responsabilidad (globales, navegación, hero, tarjetas, contacto, panel, páginas y pequeños ajustes). Las reglas originales se conservan en el mismo orden; los únicos estilos añadidos son para los avisos de sincronización y el estado de membresía pendiente.

El antiguo `js/crud.js` se dividió en `js/admin/dashboard-core.js`, `js/admin/members.js`, `js/admin/trainers.js` y `js/admin/classes.js`. Cada página mantiene sus scripts específicos. `js/api.js` centraliza las peticiones a la API.

## Datos que se guardan

La app crea automáticamente estas tres tablas en PostgreSQL:

- `members`: datos necesarios para la solicitud de membresía y su estado (`Pendiente`, `Activo` o `Inactivo`).
- `contact_messages`: mensajes enviados desde los formularios de contacto.
- `site_collections`: listas pequeñas de entrenadores, clases y servicios editables desde el panel.

No se almacena ningún dato de tarjeta y no existe una pasarela de pago integrada. El formulario registra una **solicitud**, inicialmente pendiente; no confirma cobros ni activa una membresía pagada. Tampoco se pide una contraseña a los clientes porque en esta versión no hay inicio de sesión de clientes. El panel administrativo sí tiene autenticación protegida mediante variables de entorno.

Las valoraciones y el tema visual siguen guardándose localmente en el navegador; no son parte de las funciones que se envían a PostgreSQL en esta versión. Si el Dashboard detecta miembros guardados en el navegador cuando PostgreSQL está vacío, pregunta antes de importarlos para evitar borrarlos o mezclarlos sin autorización.

## Ejecutar localmente

Necesitas Node.js 20+ y una base PostgreSQL accesible.

1. Copia `.env.example` como `.env` y edita los valores.
2. Crea una base de datos llamada `fitzone` en PostgreSQL (por ejemplo, desde pgAdmin) o utiliza una `DATABASE_URL` de desarrollo.
3. Configura `DATABASE_URL`, un usuario de administrador, una contraseña de administrador de al menos 12 caracteres y una `SESSION_SECRET` aleatoria de 32 caracteres o más.
4. Desde la carpeta raíz del proyecto ejecuta:

```bash
npm install
npm run check
npm test
npm start
```

Abre `http://localhost:3000`. El inicio del servidor crea o actualiza las tres tablas necesarias. No abras los HTML mediante `file://`: la web necesita la API del servidor.

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL; obligatoria. |
| `ADMIN_USERNAME` | Usuario del administrador; obligatoria. |
| `ADMIN_PASSWORD` | Contraseña exclusiva del administrador; mínimo 12 caracteres. |
| `SESSION_SECRET` | Secreto aleatorio para firmar sesiones; mínimo 32 caracteres. |
| `NODE_ENV` | Usa `production` en Railway. |
| `PORT` | Puerto local; Railway asigna el puerto de servicio automáticamente. |
| `PGSSL` | Opcional: usa `require` solo si el proveedor necesita SSL explícito. |

Nunca subas `.env` a GitHub ni escribas secretos dentro del código. `.gitignore` ya excluye el archivo `.env`.

## Pruebas y alcance

- `npm run check`: comprueba la sintaxis del backend.
- `npm test`: ejecuta pruebas de validación de datos.
- `GET /api/health`: comprueba que la API responde y que PostgreSQL es accesible.
- Acceso administrativo: `/pages/admin.html`.

La guía para publicar la aplicación está en [`docs/DEPLOY_RAILWAY.md`](docs/DEPLOY_RAILWAY.md). La publicación a Railway no se ejecuta automáticamente desde este paquete: debes conectar el repositorio y configurar las variables del servicio.
