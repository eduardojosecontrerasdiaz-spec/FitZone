# FitZone

FitZone es una web responsive para presentar los servicios de un gimnasio y administrar solicitudes de membresía, mensajes, clases, entrenadores y servicios. El frontend conserva HTML, CSS y JavaScript; el backend de despliegue utiliza Python, Flask, Gunicorn y MySQL.

## Tecnologías

- HTML, CSS y JavaScript sin framework obligatorio de frontend.
- Python + Flask para servir las páginas y exponer la API.
- PyMySQL para conectar Flask con MySQL.
- Gunicorn para ejecutar Flask en producción.
- Railway para publicar la aplicación y alojar el servicio MySQL.

## Archivos importantes

- `app.py`: aplicación Flask, endpoints API y acceso a MySQL.
- `requirements.txt`: dependencias Python.
- `Procfile`: comando de arranque de Gunicorn.
- `railway.json`: comando de despliegue y health check.
- `.env.example`: plantilla de variables locales sin credenciales reales.
- `js/api.js`: cliente JavaScript que llama a la API del mismo dominio.
- `js/storage.js`: compatibilidad con datos locales y sincronización de colecciones.

Los endpoints de la API se mantienen para que los formularios y el Dashboard existentes puedan comunicarse con Flask. Las contraseñas y la configuración de MySQL solo deben existir en variables de entorno del servidor, nunca en JavaScript del navegador.

## Datos almacenados

La aplicación crea estas tablas MySQL al iniciar:

- `members`: solicitudes de membresía, con estado inicial `Pendiente`.
- `contact_messages`: mensajes enviados desde Contacto.
- `site_collections`: colecciones administrables de entrenadores, clases y servicios.

No hay pasarela de pago integrada. Las valoraciones, el tema visual y algunos datos de compatibilidad siguen guardándose localmente en el navegador. La base de datos del servidor requiere configuración de variables de entorno.

## Ejecutar localmente

Necesitas Python 3.10 o superior y un servidor MySQL accesible.

1. Copia `.env.example` a `.env` y sustituye los valores por los de tu MySQL local.
2. Instala dependencias:

```bash
python -m pip install -r requirements.txt
```

3. Configura las variables de entorno de `.env` en tu terminal o usa un gestor local de variables. La aplicación no carga automáticamente `.env`; en Railway las variables se configuran en el panel del servicio.
4. Inicia el servidor local:

```bash
python app.py
```

Abre `http://localhost:5000`. La aplicación verifica las variables y crea las tablas necesarias. No abras los HTML con `file://`; la web necesita el servidor y la API.

## Variables de entorno

| Variable | Uso |
|---|---|
| `MYSQLHOST` | Host del servidor MySQL. |
| `MYSQLPORT` | Puerto MySQL, normalmente 3306. |
| `MYSQLUSER` | Usuario de MySQL. |
| `MYSQLPASSWORD` | Contraseña de MySQL. |
| `MYSQLDATABASE` | Base de datos de FitZone. |
| `ADMIN_USERNAME` | Usuario del administrador. |
| `ADMIN_PASSWORD` | Contraseña exclusiva del administrador; mínimo 12 caracteres. |
| `SESSION_SECRET` | Secreto aleatorio para firmar sesiones; mínimo 32 caracteres. |
| `PORT` | Puerto asignado por Railway; Railway lo define automáticamente. |

Nunca subas el archivo `.env`, claves ni contraseñas a GitHub.

## Publicar en Railway

1. Conecta esta rama/repo en Railway.
2. Añade un servicio MySQL al proyecto.
3. Copia las variables de conexión del servicio MySQL a las variables del servicio web: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE`.
4. Define `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `SESSION_SECRET` con valores propios y seguros.
5. Despliega el servicio web y genera un dominio público.
6. Comprueba `https://TU-DOMINIO/api/health`; la respuesta esperada es `{"status":"ok","database":"ok"}`.

La configuración del repositorio usa `gunicorn --bind 0.0.0.0:$PORT app:app`. El despliegue real y la creación de variables siguen requiriendo acciones en tu cuenta de Railway.
