// Cliente HTTP de FitZone. Flask sirve la web y la API desde el mismo dominio.
(function () {
    const TOKEN_KEY = "fitzoneAdminToken";
    const COLLECTIONS = new Set(["entrenadores", "clases", "servicios"]);

    async function request(url, opciones = {}) {
        const cabeceras = new Headers(opciones.headers || {});
        if (opciones.body && !cabeceras.has("Content-Type")) {
            cabeceras.set("Content-Type", "application/json");
        }
        const token = sessionStorage.getItem(TOKEN_KEY);
        if (token && !cabeceras.has("Authorization")) {
            cabeceras.set("Authorization", "Bearer " + token);
        }

        const respuesta = await fetch(url, { ...opciones, headers: cabeceras });
        const tipo = respuesta.headers.get("content-type") || "";
        const contenido = tipo.includes("application/json") ? await respuesta.json() : null;
        if (!respuesta.ok) {
            const error = new Error(contenido?.error || "No se pudo completar la solicitud.");
            error.status = respuesta.status;
            throw error;
        }
        return contenido;
    }

    const API = {
        tokenKey: TOKEN_KEY,
        isAdminAuthenticated() {
            return Boolean(sessionStorage.getItem(TOKEN_KEY));
        },
        async login(usuario, clave) {
            const respuesta = await request("/api/admin/login", {
                method: "POST",
                body: JSON.stringify({ usuario, clave })
            });
            sessionStorage.setItem(TOKEN_KEY, respuesta.token);
            // Se conserva la bandera antigua mientras otros fragmentos del dashboard la usan.
            sessionStorage.setItem("fitzoneAdmin", "si");
            return respuesta;
        },
        async verifySession() {
            return request("/api/admin/session");
        },
        logout() {
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem("fitzoneAdmin");
        },
        async sendContact(datos) {
            return request("/api/contact", { method: "POST", body: JSON.stringify(datos) });
        },
        async registerMembership(datos) {
            return request("/api/register", { method: "POST", body: JSON.stringify(datos) });
        },
        async getPublicCollection(nombre) {
            if (!COLLECTIONS.has(nombre)) return null;
            const respuesta = await request("/api/content/" + encodeURIComponent(nombre));
            return respuesta.data;
        },
        async getAdminCollection(nombre) {
            if (!COLLECTIONS.has(nombre)) return null;
            const respuesta = await request("/api/admin/collections/" + encodeURIComponent(nombre));
            return respuesta.data;
        },
        async saveCollection(nombre, data) {
            if (!COLLECTIONS.has(nombre)) return null;
            return request("/api/admin/collections/" + encodeURIComponent(nombre), {
                method: "PUT", body: JSON.stringify({ data })
            });
        },
        async getMembers() {
            const respuesta = await request("/api/admin/members");
            return respuesta.data;
        },
        async saveMembers(data) {
            return request("/api/admin/members", {
                method: "PUT", body: JSON.stringify({ data })
            });
        },
        async deleteMember(id) {
            return request("/api/admin/members/" + encodeURIComponent(id), { method: "DELETE" });
        },
        async getMessages() {
            const respuesta = await request("/api/admin/messages");
            return respuesta.data;
        },
        async markMessageRead(id, leido) {
            return request("/api/admin/messages/" + encodeURIComponent(id) + "/read", {
                method: "PATCH", body: JSON.stringify({ leido: Boolean(leido) })
            });
        },
        async deleteMessage(id) {
            return request("/api/admin/messages/" + encodeURIComponent(id), { method: "DELETE" });
        },
        reportSyncError(message) {
            let aviso = document.getElementById("fitzoneSyncNotice");
            if (!aviso) {
                aviso = document.createElement("div");
                aviso.id = "fitzoneSyncNotice";
                aviso.className = "fitzone-sync-notice";
                aviso.setAttribute("role", "status");
                aviso.setAttribute("aria-live", "polite");
                document.body.appendChild(aviso);
            }
            aviso.textContent = message;
            aviso.hidden = false;
            window.clearTimeout(aviso._fitZoneTimer);
            aviso._fitZoneTimer = window.setTimeout(function () { aviso.hidden = true; }, 7000);
        }
    };

    window.FitZoneAPI = API;
})();

// Mantiene la demostración original de JSONPlaceholder solo en el Dashboard; no es la base de datos de FitZone.
function cargarUsuariosApi() {
    const contenedor = document.getElementById("listaUsuariosApi");
    if (!contenedor) return;

    fetch("https://jsonplaceholder.typicode.com/users")
        .then(function (respuesta) {
            if (!respuesta.ok) throw new Error("No se pudo consultar la API");
            return respuesta.json();
        })
        .then(function (usuarios) {
            contenedor.innerHTML = "";
            usuarios.slice(0, 6).forEach(function (usuario) {
                const tarjeta = document.createElement("article");
                tarjeta.className = "tarjeta-api-usuario";
                const avatar = document.createElement("div");
                avatar.className = "avatar-api";
                avatar.textContent = usuario.name.charAt(0);
                const datos = document.createElement("div");
                datos.className = "datos-api";
                const nombre = document.createElement("h3");
                nombre.textContent = usuario.name;
                const correo = document.createElement("p");
                correo.textContent = usuario.email;
                const empresa = document.createElement("span");
                empresa.textContent = usuario.company.name;
                datos.append(nombre, correo, empresa);
                tarjeta.append(avatar, datos);
                contenedor.appendChild(tarjeta);
            });
        })
        .catch(function (error) {
            contenedor.textContent = "No se pudieron cargar los usuarios de la API de demostración.";
            console.warn("No se pudo consultar JSONPlaceholder:", error.message);
        });
}

document.addEventListener("DOMContentLoaded", cargarUsuariosApi);
