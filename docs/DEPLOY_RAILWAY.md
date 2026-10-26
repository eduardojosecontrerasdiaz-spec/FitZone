# Desplegar FitZone con Flask, MySQL y Railway

Esta versión sirve el frontend y la API desde el mismo servicio Flask. Gunicorn ejecuta la aplicación Python y PyMySQL se conecta al servicio MySQL de Railway. La versión de Python está fijada en `.python-version` a 3.12, igual que en las pruebas automáticas de GitHub Actions.

## 1. Conectar GitHub

1. Entra en Railway e inicia sesión con GitHub.
2. Crea un proyecto y selecciona Deploy from GitHub repo.
3. Selecciona FitZone y, para probar esta migración sin tocar la versión principal, usa la rama `railway-flask-mysql`.

El repositorio contiene `app.py`, `wsgi.py`, `requirements.txt`, `.python-version`, `Procfile`, `railway.json` y `railpack.json` para indicar el runtime Python y el comando de inicio. El punto de entrada `wsgi.py` valida las variables e inicializa las tablas al arrancar.

## 2. Crear MySQL

1. En el proyecto de Railway añade un servicio MySQL.
2. Abre las variables del servicio MySQL y localiza el host, puerto, usuario, contraseña y nombre de base de datos.
3. En las variables del servicio web crea estas variables usando los valores del servicio MySQL:

| Variable del servicio web | Valor |
|---|---|
| `MYSQLHOST` | Host privado del servicio MySQL |
| `MYSQLPORT` | Puerto del servicio MySQL |
| `MYSQLUSER` | Usuario de la base de datos |
| `MYSQLPASSWORD` | Contraseña de la base de datos |
| `MYSQLDATABASE` | Nombre de la base de datos |

Usa los nombres y valores que muestra Railway; no publiques estas credenciales en GitHub.

## 3. Configurar el administrador

En las variables del servicio web define:

- `ADMIN_USERNAME`: nombre de administrador elegido por ti.
- `ADMIN_PASSWORD`: contraseña única de al menos 12 caracteres; recomiendo 16 o más.
- `SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres.
- `PORT`: Railway lo asigna automáticamente; no hace falta inventar uno.

No reutilices la contraseña de tu correo o GitHub. No subas `.env` a GitHub. La plantilla `.env.example` sirve solo para desarrollo local y contiene valores de ejemplo.

## 4. Desplegar y probar

Railway instala las dependencias de `requirements.txt` y ejecuta Gunicorn con el comando del Procfile/configuración. Antes de desplegar, puedes ejecutar localmente `python -m unittest discover -s tests -v`; las pruebas no usan una base de datos real. GitHub Actions también comprueba que `Procfile`, `railway.json`, `railpack.json` y `.python-version` coincidan entre sí.

1. Espera a que el despliegue termine.
2. En Networking genera un dominio público.
3. Abre `https://TU-DOMINIO/`.
4. Comprueba `https://TU-DOMINIO/api/health`. Si está todo bien devuelve `{"status":"ok","database":"ok"}`.
5. Abre `/pages/admin.html` e inicia sesión con las credenciales que configuraste.

## 5. Pruebas funcionales

Prueba con datos ficticios antes de compartir el dominio:

- Envía un mensaje desde Contacto y confirma que se guarda en la sección de mensajes del Dashboard.
- Envía una solicitud de membresía y comprueba que queda como `Pendiente`.
- Inicia sesión como administrador, edita una colección de clases o entrenadores y recarga la página.
- Comprueba que los cambios persisten en MySQL y que los recursos CSS/JS se cargan correctamente.

## Notas

- Esta configuración crea las tablas `members`, `contact_messages` y `site_collections` si no existen.
- No hay pasarela de pago ni se almacenan datos de tarjetas.
- Los datos que solo se guardan en LocalStorage no se migran automáticamente a MySQL.
- La rama de migración conserva los archivos Node.js existentes como referencia, pero la configuración de Railway fuerza el proveedor Python.
- Si el health check falla, revisa primero las variables MySQL y los logs del servicio web.
- No he añadido contraseñas reales ni secretos al repositorio; las variables sensibles se configuran en el panel de Railway.
