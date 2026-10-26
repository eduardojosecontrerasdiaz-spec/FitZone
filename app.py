import base64
import hashlib
import hmac
import json
import os
import re
import time
from datetime import date
from functools import wraps
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
PLANS = {"Básico", "Premium", "Profesional"}
STATUSES = {"Pendiente", "Activo", "Inactivo"}
PAYMENT_METHODS = {"Tarjeta", "Transferencia", "Efectivo", "Por definir", ""}
COLLECTIONS = {"entrenadores", "clases", "servicios"}
RATE_LIMITS = {}


def env_value(*names, default=None):
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return default


def database_connection():
    return pymysql.connect(
        host=env_value("MYSQLHOST", "MYSQL_HOST", default="127.0.0.1"),
        port=int(env_value("MYSQLPORT", "MYSQL_PORT", default="3306")),
        user=env_value("MYSQLUSER", "MYSQL_USER", default="root"),
        password=env_value("MYSQLPASSWORD", "MYSQL_PASSWORD", default=""),
        database=env_value("MYSQLDATABASE", "MYSQL_DATABASE", default="fitzone"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
        connect_timeout=10,
        read_timeout=20,
        write_timeout=20,
    )


def initialize_database():
    statements = [
        """CREATE TABLE IF NOT EXISTS members (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(120) NOT NULL,
            correo VARCHAR(254) NOT NULL,
            telefono VARCHAR(40) NOT NULL,
            documento VARCHAR(40) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            plan VARCHAR(30) NOT NULL,
            estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
            metodo_pago_preferido VARCHAR(30) NOT NULL DEFAULT 'Por definir',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY members_correo_uq (correo),
            UNIQUE KEY members_documento_uq (documento),
            KEY members_created_at_idx (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
        """CREATE TABLE IF NOT EXISTS contact_messages (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(120) NOT NULL,
            correo VARCHAR(254) NOT NULL,
            telefono VARCHAR(40) NOT NULL,
            asunto VARCHAR(160) NOT NULL,
            mensaje TEXT NOT NULL,
            leido BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY contact_messages_created_at_idx (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
        """CREATE TABLE IF NOT EXISTS site_collections (
            nombre VARCHAR(30) NOT NULL PRIMARY KEY,
            datos JSON NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
    ]
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            for sql in statements:
                cursor.execute(sql)
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def fetch_one(sql, params=()):
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchone()
    finally:
        connection.close()


def fetch_all(sql, params=()):
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()
    finally:
        connection.close()


def text(value, maximum=500):
    return value.strip()[:maximum] if isinstance(value, str) else ""


def valid_email(value):
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", text(value, 254)))


def valid_date(value):
    if not isinstance(value, str):
        return False
    try:
        return date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def validate_registration(body):
    data = {
        "nombre": text(body.get("nombre"), 120),
        "correo": text(body.get("correo"), 254).lower(),
        "telefono": text(body.get("telefono"), 40),
        "documento": text(body.get("documento"), 40),
        "fecha": text(body.get("fecha"), 10),
        "plan": text(body.get("plan"), 30),
        "metodoPago": text(body.get("metodoPago"), 30),
    }
    errors = []
    if len(data["nombre"]) < 3: errors.append("Escribe tu nombre completo (mínimo 3 caracteres).")
    if not valid_email(data["correo"]): errors.append("Escribe un correo electrónico válido.")
    if len(data["telefono"]) < 7: errors.append("Escribe un teléfono válido.")
    if len(data["documento"]) < 4: errors.append("Escribe un documento válido.")
    if not valid_date(data["fecha"]): errors.append("La fecha no es válida.")
    if data["plan"] not in PLANS: errors.append("El plan seleccionado no es válido.")
    if data["metodoPago"] not in PAYMENT_METHODS: errors.append("La preferencia de pago no es válida.")
    return data, errors


def validate_contact(body):
    data = {
        "nombre": text(body.get("nombre"), 120),
        "correo": text(body.get("correo"), 254).lower(),
        "telefono": text(body.get("telefono"), 40),
        "asunto": text(body.get("asunto"), 160),
        "mensaje": text(body.get("mensaje"), 4000),
    }
    errors = []
    if len(data["nombre"]) < 3: errors.append("Escribe tu nombre completo.")
    if not valid_email(data["correo"]): errors.append("Escribe un correo electrónico válido.")
    if len(data["telefono"]) < 7: errors.append("Escribe un teléfono válido.")
    if len(data["asunto"]) < 3: errors.append("Escribe el asunto del mensaje.")
    if len(data["mensaje"]) < 10: errors.append("El mensaje debe tener al menos 10 caracteres.")
    return data, errors


def rate_limited(key, maximum, window=900):
    now = time.time()
    attempts = [stamp for stamp in RATE_LIMITS.get(key, []) if now - stamp < window]
    if len(attempts) >= maximum:
        RATE_LIMITS[key] = attempts
        return True
    attempts.append(now)
    RATE_LIMITS[key] = attempts
    return False


def limit_requests(maximum):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()
            if rate_limited(function.__name__ + ":" + ip, maximum):
                message = "Demasiados intentos de acceso. Espera unos minutos e inténtalo otra vez." if function.__name__ == "admin_login" else "Has enviado varias solicitudes en poco tiempo. Intenta nuevamente más tarde."
                return jsonify(error=message), 429
            return function(*args, **kwargs)
        return wrapper
    return decorator


def sign_token(payload):
    return hmac.new(os.getenv("SESSION_SECRET", "").encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_token(username):
    payload = json.dumps({"sub": username, "exp": int(time.time()) + 28800}, separators=(",", ":"))
    encoded = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return encoded + "." + sign_token(encoded)


def verify_token(token):
    if not isinstance(token, str) or len(token) > 2048 or token.count(".") != 1:
        return None
    payload, signature = token.split(".", 1)
    if not hmac.compare_digest(signature, sign_token(payload)):
        return None
    try:
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        return None
    if not data.get("sub") or data.get("exp", 0) <= int(time.time()):
        return None
    if not hmac.compare_digest(str(data["sub"]), os.getenv("ADMIN_USERNAME", "")):
        return None
    return data


def admin_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else ""
        admin = verify_token(token)
        if not admin:
            return jsonify(error="Sesión vencida o no autorizada. Inicia sesión nuevamente."), 401
        request.admin_user = admin["sub"]
        return function(*args, **kwargs)
    return wrapper


def validate_environment():
    required = ["MYSQLHOST", "MYSQLUSER", "MYSQLPASSWORD", "MYSQLDATABASE",
                "ADMIN_USERNAME", "ADMIN_PASSWORD", "SESSION_SECRET"]
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError("Faltan variables de entorno: " + ", ".join(missing))
    if len(os.environ["SESSION_SECRET"]) < 32:
        raise RuntimeError("SESSION_SECRET debe contener al menos 32 caracteres.")
    if len(os.environ["ADMIN_PASSWORD"]) < 12:
        raise RuntimeError("ADMIN_PASSWORD debe contener al menos 12 caracteres.")


@app.after_request
def security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; "
        "img-src 'self' data: https:; connect-src 'self' https://jsonplaceholder.typicode.com; "
        "object-src 'none'; frame-ancestors 'self'")
    return response


@app.get("/")
@app.get("/index.html")
def index():
    return send_from_directory(ROOT, "index.html")


@app.get("/css/<path:filename>")
def css_file(filename):
    return send_from_directory(ROOT / "css", filename)


@app.get("/js/<path:filename>")
def js_file(filename):
    return send_from_directory(ROOT / "js", filename)


@app.get("/assets/<path:filename>")
def asset_file(filename):
    return send_from_directory(ROOT / "assets", filename)


ALLOWED_PAGES = {"admin.html", "clases.html", "contacto.html", "dashboard.html", "detalle-clase.html",
                 "entrenadores.html", "perfil-entrenador.html", "planes.html", "registro.html"}


@app.get("/pages/<path:filename>")
def page_file(filename):
    if filename not in ALLOWED_PAGES:
        abort(404)
    return send_from_directory(ROOT / "pages", filename)


@app.get("/api/health")
def health():
    try:
        fetch_one("SELECT 1 AS healthy")
        return jsonify(status="ok", database="ok")
    except Exception:
        app.logger.exception("MySQL no responde")
        return jsonify(status="error", database="unavailable"), 503


@app.post("/api/contact")
@limit_requests(12)
def contact():
    data, errors = validate_contact(request.get_json(silent=True) or {})
    if errors:
        return jsonify(error=errors[0], errors=errors), 400
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO contact_messages (nombre, correo, telefono, asunto, mensaje) VALUES (%s, %s, %s, %s, %s)",
                           (data["nombre"], data["correo"], data["telefono"], data["asunto"], data["mensaje"]))
            message_id = cursor.lastrowid
        connection.commit()
        return jsonify(ok=True, message="Mensaje recibido correctamente.", id=message_id), 201
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.post("/api/register")
@limit_requests(12)
def register():
    data, errors = validate_registration(request.get_json(silent=True) or {})
    if errors:
        return jsonify(error=errors[0], errors=errors), 400
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""INSERT INTO members
                (nombre, correo, telefono, documento, fecha_nacimiento, plan, metodo_pago_preferido)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (data["nombre"], data["correo"], data["telefono"], data["documento"], data["fecha"], data["plan"], data["metodoPago"] or "Por definir"))
            member_id = cursor.lastrowid
        connection.commit()
        member = {"id": member_id, "nombre": data["nombre"], "correo": data["correo"], "telefono": data["telefono"],
                  "documento": data["documento"], "fecha_nacimiento": data["fecha"], "plan": data["plan"], "estado": "Pendiente"}
        return jsonify(ok=True, message="Solicitud de membresía recibida. FitZone se pondrá en contacto para confirmar los siguientes pasos.", member=member), 201
    except pymysql.err.IntegrityError as error:
        connection.rollback()
        if error.args and error.args[0] == 1062:
            return jsonify(error="Ya existe una membresía registrada con ese correo electrónico o documento."), 409
        raise
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.get("/api/content/<nombre>")
def public_collection(nombre):
    if nombre not in COLLECTIONS:
        return jsonify(error="Contenido no encontrado."), 404
    row = fetch_one("SELECT datos FROM site_collections WHERE nombre=%s", (nombre,))
    data = row["datos"] if row else None
    if isinstance(data, str):
        data = json.loads(data)
    return jsonify(data=data)


@app.post("/api/admin/login")
@limit_requests(8)
def admin_login():
    body = request.get_json(silent=True) or {}
    username = text(body.get("usuario"), 254)
    password = body.get("clave") if isinstance(body.get("clave"), str) else ""
    if not hmac.compare_digest(username, os.getenv("ADMIN_USERNAME", "")) or not hmac.compare_digest(password, os.getenv("ADMIN_PASSWORD", "")):
        return jsonify(error="Usuario o contraseña incorrectos."), 401
    return jsonify(ok=True, token=create_token(username), expiresIn=28800)


@app.get("/api/admin/session")
@admin_required
def admin_session():
    return jsonify(ok=True, usuario=request.admin_user)


@app.get("/api/admin/members")
@admin_required
def get_members():
    return jsonify(data=fetch_all("""SELECT id, nombre, correo, telefono, documento, fecha_nacimiento AS fecha,
        plan, estado, metodo_pago_preferido AS metodoPago, created_at FROM members ORDER BY created_at DESC, id DESC"""))


@app.put("/api/admin/members")
@admin_required
def save_members():
    users = (request.get_json(silent=True) or {}).get("data")
    if not isinstance(users, list) or len(users) > 500:
        return jsonify(error="La lista de miembros no es válida."), 400
    normalized, emails = [], set()
    for item in users:
        if not isinstance(item, dict):
            return jsonify(error="Uno de los miembros no es válido."), 400
        try:
            item_id = int(item.get("id"))
            item_id = item_id if item_id > 0 else None
        except (ValueError, TypeError):
            item_id = None
        name, email = text(item.get("nombre"), 120), text(item.get("correo"), 254).lower()
        plan, status = text(item.get("plan"), 30), text(item.get("estado"), 20) or "Activo"
        if len(name) < 3 or not valid_email(email):
            return jsonify(error="Uno de los miembros tiene nombre o correo no válido."), 400
        if plan not in PLANS or status not in STATUSES:
            return jsonify(error="Uno de los miembros tiene plan o estado no válido."), 400
        if email in emails:
            return jsonify(error="Hay correos duplicados en la lista."), 400
        emails.add(email)
        normalized.append({"id": item_id, "nombre": name, "correo": email, "plan": plan, "estado": status})

    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            for item in normalized:
                saved_id = None
                if item["id"]:
                    cursor.execute("UPDATE members SET nombre=%s, correo=%s, plan=%s, estado=%s WHERE id=%s",
                                   (item["nombre"], item["correo"], item["plan"], item["estado"], item["id"]))
                    if cursor.rowcount:
                        saved_id = item["id"]
                if not saved_id:
                    synthetic_doc = "FITZONE-DASH-" + hashlib.sha256(item["correo"].encode()).hexdigest()[:24]
                    cursor.execute("""INSERT INTO members
                        (nombre, correo, telefono, documento, fecha_nacimiento, plan, estado, metodo_pago_preferido)
                        VALUES (%s, %s, '', %s, '2000-01-01', %s, %s, 'Por definir')
                        ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), correo=VALUES(correo), plan=VALUES(plan),
                        estado=VALUES(estado), id=LAST_INSERT_ID(id)""",
                        (item["nombre"], item["correo"], synthetic_doc, item["plan"], item["estado"]))
                    saved_id = cursor.lastrowid
            # La lista enviada sincroniza altas y ediciones; nunca elimina otros registros.
            # Las eliminaciones se realizan mediante DELETE /api/admin/members/<id>.
        connection.commit()
        return jsonify(ok=True, count=len(normalized))
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.delete("/api/admin/members/<int:member_id>")
@admin_required
def delete_member(member_id):
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM members WHERE id=%s", (member_id,))
            if not cursor.rowcount:
                return jsonify(error="No se encontró el miembro."), 404
        connection.commit()
        return jsonify(ok=True)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.get("/api/admin/messages")
@admin_required
def get_messages():
    return jsonify(data=fetch_all("""SELECT id, nombre, correo, telefono, asunto, mensaje, leido, created_at
        FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 200"""))


@app.patch("/api/admin/messages/<int:message_id>/read")
@admin_required
def mark_message_read(message_id):
    body = request.get_json(silent=True) or {}
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE contact_messages SET leido=%s WHERE id=%s", (body.get("leido") is True, message_id))
            if not cursor.rowcount:
                cursor.execute("SELECT id FROM contact_messages WHERE id=%s", (message_id,))
                if not cursor.fetchone():
                    return jsonify(error="No se encontró el mensaje."), 404
        connection.commit()
        return jsonify(ok=True)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.delete("/api/admin/messages/<int:message_id>")
@admin_required
def delete_message(message_id):
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM contact_messages WHERE id=%s", (message_id,))
            if not cursor.rowcount:
                return jsonify(error="No se encontró el mensaje."), 404
        connection.commit()
        return jsonify(ok=True)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.get("/api/admin/collections/<nombre>")
@admin_required
def admin_collection(nombre):
    if nombre not in COLLECTIONS:
        return jsonify(error="Colección no permitida."), 404
    row = fetch_one("SELECT datos FROM site_collections WHERE nombre=%s", (nombre,))
    data = row["datos"] if row else None
    if isinstance(data, str):
        data = json.loads(data)
    return jsonify(data=data)


@app.put("/api/admin/collections/<nombre>")
@admin_required
def save_collection(nombre):
    if nombre not in COLLECTIONS:
        return jsonify(error="Colección no permitida."), 404
    data = (request.get_json(silent=True) or {}).get("data")
    if not isinstance(data, list) or len(data) > 200:
        return jsonify(error="La lista de contenido no es válida (máximo 200 elementos)."), 400
    connection = database_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""INSERT INTO site_collections (nombre, datos) VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE datos=VALUES(datos)""",
                (nombre, json.dumps(data, ensure_ascii=False)))
        connection.commit()
        return jsonify(ok=True, count=len(data))
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@app.errorhandler(HTTPException)
def http_error(error):
    if request.path.startswith("/api/"):
        return jsonify(error=error.description), error.code
    return error


@app.errorhandler(Exception)
def internal_error(error):
    app.logger.error("Error inesperado: %s", error)
    return jsonify(error="Ocurrió un error interno. Intenta nuevamente más tarde."), 500


if __name__ == "__main__":
    validate_environment()
    initialize_database()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
