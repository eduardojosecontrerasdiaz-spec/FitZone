# Publicar FitZone en Railway

Esta versión está preparada para ejecutarse como **un servicio web Node.js y una base PostgreSQL**. No hace falta desplegar el frontend y la API por separado. `railway.json` ya indica el comando `npm start` y el endpoint `/api/health` para comprobar la aplicación.

## 1. Preparar el repositorio

1. Descomprime `FitZone_Railway.zip`.
2. Sube el contenido de la carpeta del proyecto a un repositorio GitHub tuyo. La carpeta raíz que debes subir es la que contiene `package.json`, `index.html`, `server/` y `css/`.
3. No subas archivos `.env`, claves ni contraseñas. Este paquete solo incluye `.env.example`, una plantilla sin secretos.

Si vas a crear un repositorio nuevo y ya tienes Git instalado, abre PowerShell dentro de la carpeta raíz y ejecuta:

```powershell
git init
git add .
git commit -m "Preparar FitZone para Railway"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

Reemplaza `TU_USUARIO` y `TU_REPOSITORIO` por los valores reales de tu repositorio. Si ya tienes el repositorio, usa tu procedimiento normal de `git add`, `git commit` y `git push`; no necesitas ejecutar `git init` de nuevo.

## 2. Crear el proyecto y la base de datos

1. Entra en Railway y crea un proyecto nuevo mediante **Deploy from GitHub repo**.
2. Selecciona el repositorio de FitZone y autoriza la conexión si Railway la solicita.
3. Añade una base de datos PostgreSQL al mismo proyecto (**Add service → Database → PostgreSQL**).
4. Espera a que la base de datos quede disponible.

Railway expone una variable `DATABASE_URL` para la conexión a PostgreSQL. En las variables del servicio web, crea una referencia a la variable de la base de datos usando el selector de variables de Railway (por ejemplo, una referencia del tipo `${{Postgres.DATABASE_URL}}`; el nombre `Postgres` debe coincidir con el nombre real de tu servicio de base de datos).

## 3. Configurar las variables del servicio web

En el servicio Node.js, abre **Variables** y configura:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Referencia a `DATABASE_URL` del servicio PostgreSQL de este proyecto. |
| `ADMIN_USERNAME` | Un nombre de administrador elegido por ti. |
| `ADMIN_PASSWORD` | Una contraseña nueva, única y larga (mínimo 12 caracteres; recomiendo 16 o más). |
| `SESSION_SECRET` | Una cadena aleatoria larga, de al menos 32 caracteres. |

No uses la contraseña de tu correo, GitHub ni otra cuenta. No copies el ejemplo de `.env.example` como contraseña final. Mantén las variables secretas dentro de Railway.

Para generar un secreto fuerte en una consola que tenga OpenSSL puedes usar `openssl rand -hex 32`. Si no tienes esa herramienta, genera una cadena aleatoria de 64 caracteres con un gestor de contraseñas.

Railway asigna `PORT`; normalmente no hace falta configurarlo manualmente. El arranque fallará intencionadamente si falta `DATABASE_URL` o alguna de las variables obligatorias de administrador.

## 4. Desplegar y generar un dominio

1. Guarda las variables. Railway debe iniciar un nuevo despliegue desde el repositorio.
2. En la configuración de red del servicio web, selecciona **Generate Domain** para obtener una URL pública.
3. Abre `https://TU-DOMINIO/api/health`. La respuesta correcta se parece a:

```json
{"status":"ok","database":"ok"}
```

4. Abre `https://TU-DOMINIO/` para la página principal.
5. Abre `https://TU-DOMINIO/pages/admin.html` para iniciar sesión con `ADMIN_USERNAME` y `ADMIN_PASSWORD` definidos en Railway.

Railway detecta el proyecto por `package.json`, instala las dependencias y usa `npm start`. La configuración del repositorio indica el endpoint de salud para que Railway compruebe el servicio después del despliegue.

## 5. Prueba funcional antes de compartir la web

Haz pruebas con datos ficticios primero:

- Envía un mensaje desde Contacto y comprueba que aparece en la sección de mensajes del Dashboard.
- Registra una solicitud de membresía; debe guardarse en PostgreSQL con estado `Pendiente`, no como pago realizado.
- En el Dashboard añade o edita una clase, un entrenador y un servicio; después recarga la web y confirma que los cambios siguen ahí.
- Cierra la sesión del administrador, vuelve a `/pages/admin.html` e intenta abrir `/pages/dashboard.html`; debe pedir acceso.
- Comprueba el diseño en móvil y escritorio y abre la consola del navegador para detectar errores.

No compartas la dirección pública hasta completar estas comprobaciones.

## 6. Si algo falla

- **El despliegue no arranca:** abre `Deployments`, entra en el despliegue fallido y revisa los logs. Verifica primero que existen las cuatro variables indicadas arriba.
- **`/api/health` responde `503`:** la web está levantada pero no consigue consultar PostgreSQL. Revisa que `DATABASE_URL` sea una referencia válida al servicio de base de datos correcto.
- **Error al iniciar sesión:** comprueba el nombre y contraseña configurados en el servicio web y vuelve a desplegar si modificaste variables.
- **Los formularios no guardan:** revisa `Deploy Logs` y el log de la aplicación; no se debe mostrar una confirmación exitosa cuando el servidor rechaza la solicitud.
- **Cambios en clases/entrenadores/servicios no persisten:** confirma que el inicio de sesión admin sigue válido y que la base está saludable.

## Qué queda fuera de esta entrega

- No está integrada una pasarela de pago: no se recoge ni almacena ningún dato de tarjeta.
- No hay envío automático de correos ni notificaciones externas; los mensajes de contacto se consultan desde el Dashboard.
- Las valoraciones y el tema visual aún se guardan en el navegador.
- Esta guía prepara el proyecto para Railway, pero el despliegue real requiere que tú conectes el repositorio y configures las variables en tu cuenta.
