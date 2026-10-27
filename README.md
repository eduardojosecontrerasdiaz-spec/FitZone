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
- `wsgi.py`: valida la configuración e inicializa el esquema al iniciar en producción.
- `requirements.txt`: dependencias Python.
- `.python-version`: fija Python 3.12 para Railway y mantenerlo alineado con CI.
- `Procfile`: comando de arranque de Gunicorn.
- `railway.json`: comando de despliegue y health check.
- `railpack.json`: proveedor Python y comando de arranque.
- `.env.example`: plantilla de variables locales sin credenciales reales.
- `js/api.js`: cliente JavaScript que llama a la API del mismo dominio.
- `js/storage.js`: compatibilidad con datos locales y sincronización de colecciones.

Los endpoints de la API se mantienen para que los formularios y el Dashboard existentes puedan comunicarse con Flask. Las contraseñas y la configuración de MySQL solo deben existir en variables de entorno del servidor, nunca en JavaScript del navegador.

## Base de datos MySQL

En desarrollo local, `.env.example` usa `MYSQLDATABASE=fitzone_db`, que corresponde a la base configurada previamente con XAMPP. En Railway, establece `MYSQLDATABASE` con el nombre real de la base del servicio MySQL; no asumas que Railway usará el nombre local.

La aplicación aprovecha el esquema existente cuando está importado:

- `planes`: consulta los planes activos para mostrar sus precios en la página de planes.
- `entrenadores` y `clases`: se leen como contenido inicial cuando todavía no hay una colección guardada para el Dashboard.
- `usuarios`: se conserva intacta. No se mezcla automáticamente con las solicitudes de membresía porque el formulario de la web no recoge la contraseña requerida por el esquema original.

El archivo `database/schema.sql` documenta la estructura original de las cuatro tablas (`planes`, `usuarios`, `entrenadores` y `clases`). Contiene únicamente definiciones `CREATE TABLE IF NOT EXISTS`: no incluye datos de ejemplo, `INSERT` ni `DROP`. Úsalo solo en una base vacía si necesitas recrear el esquema original; no hace falta ejecutarlo sobre tu `fitzone_db` existente.

Al iniciar, Flask crea únicamente estas tablas auxiliares si todavía no existen, usando `CREATE TABLE IF NOT EXISTS`:

- `members`: solicitudes de membresía, con estado inicial `Pendiente`.
- `contact_messages`: mensajes enviados desde Contacto.
- `site_collections`: cambios de contenido administrados desde el Dashboard.

El backend no altera ni borra las tablas originales `planes`, `usuarios`, `entrenadores` o `clases`. Una vez guardada una colección desde el Dashboard, su versión administrada se conserva en `site_collections` para soportar los campos extra de la interfaz sin cambiar el esquema original.

No hay pasarela de pago integrada. Las valoraciones, el tema visual y algunos datos de compatibilidad siguen guardándose localmente en el navegador.

## Ejecutar localmente

Necesitas Python 3.12 y un servidor MySQL accesible. Para reutilizar la base local, importa primero un respaldo SQL de `fitzone_db` en el servidor remoto.

1. Copia `.env.example` a `.env` y sustituye los valores por los de tu MySQL local.
2. Instala dependencias:

```bash
python -m pip install -r requirements.txt
```

3. La aplicación carga las variables de `.env` automáticamente. En Railway, configura esas variables en el panel del servicio.
4. Inicia el servidor local:

```bash
python app.py
```

Para ejecutar las pruebas automatizadas sin conectarse a un MySQL real:

```bash
python -m unittest discover -s tests -v
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

Nunca subas el archivo `.env`, claves ni contraseñas a GitHub. El workflow de GitHub Actions comprueba que los archivos de configuración de Railway sean coherentes, además de ejecutar las pruebas y validar la sintaxis JavaScript.

## Publicar en Railway

1. Conecta esta rama/repo en Railway.
2. Añade un servicio MySQL al proyecto.
3. Copia las variables de conexión del servicio MySQL a las variables del servicio web: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE`.
4. Define `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `SESSION_SECRET` con valores propios y seguros.
5. Despliega el servicio web y genera un dominio público.
6. Comprueba `https://TU-DOMINIO/api/health`; la respuesta esperada es `{"status":"ok","database":"ok"}`.

La configuración del repositorio usa `gunicorn --bind 0.0.0.0:$PORT wsgi:app`; este punto de entrada valida variables e inicializa las tablas antes de atender solicitudes. El despliegue real y la creación de variables siguen requiriendo acciones en tu cuenta de Railway.
