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
}

function obtenerLista(nombre) {
    const datos = localStorage.getItem(nombre);

    if (datos) {
        return JSON.parse(datos);
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
