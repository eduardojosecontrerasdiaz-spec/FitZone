function guardarDato(nombre, valor) {
    localStorage.setItem(nombre, valor);
}

function obtenerDato(nombre) {
    return localStorage.getItem(nombre);
}

function eliminarDato(nombre) {
    localStorage.removeItem(nombre);
}

function guardarLista(nombre, lista) {
    localStorage.setItem(nombre, JSON.stringify(lista));

    // Persistencia remota mediante la API Flask para colecciones que administra el Dashboard.
    if (["entrenadores", "clases"].includes(nombre) &&
        window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated() &&
        (!window.FitZoneRemoteCollections || window.FitZoneRemoteCollections[nombre] !== false)) {
        window.FitZoneAPI.saveCollection(nombre, lista).catch(function (error) {
            window.FitZoneAPI.reportSyncError("No se pudo guardar " + nombre + " en la base de datos: " + error.message);
        });
    }
}

function obtenerLista(nombre) {
    const datos = localStorage.getItem(nombre);

    if (datos) {
        try {
            const lista = JSON.parse(datos);
            return Array.isArray(lista) ? lista : [];
        } catch (error) {
            console.warn("Se ignoraron datos locales inválidos para " + nombre + ".", error);
        }
    }

    return [];
}

function normalizarRutaImagen(foto) {
    if (!foto) {
        return foto;
    }

    if (foto.startsWith("data:") || foto.startsWith("http://") || foto.startsWith("https://")) {
        return foto;
    }

    if (foto.startsWith("../assets/")) {
        return foto;
    }

    if (foto.startsWith("assets/")) {
        return "../" + foto;
    }

    if (foto.startsWith("./assets/")) {
        return "../" + foto.substring(2);
    }

    return foto;
}
