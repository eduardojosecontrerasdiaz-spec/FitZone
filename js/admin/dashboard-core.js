function escaparHTMLFitZone(valor) {
    return String(valor == null ? "" : valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function normalizarRutaImagen(foto) {
    if (!foto) return "../assets/images/elena.png";

    if (foto.startsWith("data:") || foto.startsWith("http")) {
        return foto;
    }

    let nombreArchivo = foto.split("/").pop();

    if (nombreArchivo.toLowerCase() === "elena.png") {
        nombreArchivo = "elena.png";
    }

    const ruta = "../assets/images/" + nombreArchivo;
    return ruta + "?v=" + Date.now();
}
// Utilidades compartidas del Dashboard administrativo.

const tablaUsuarios = document.querySelector(".tabla-admin tbody");
const buscador = document.querySelector(".campo-texto");
const botonAgregarUsuario = document.getElementById("botonAgregarUsuario");
const botonAgregarEntrenadorPrincipal = document.getElementById("botonAgregarEntrenadorPrincipal");
const botonAgregarClasePrincipal = document.getElementById("botonAgregarClasePrincipal");

// ==============================
// CERRAR FORMULARIOS
// ==============================

function cerrarFormulario(id) {
    const formulario = document.getElementById(id);

    if (formulario) {
        formulario.remove();
    }
}

// ==============================
// CONTADORES Y PROGRESO
// ==============================

function actualizarResumen() {
    const usuarios = obtenerLista("usuarios");
    const entrenadores = obtenerLista("entrenadores");
    const clasesNuevas = obtenerLista("clases");

    const contadorUsuarios = document.getElementById("contadorUsuarios");
    const contadorPlanes = document.getElementById("contadorPlanes");
    const contadorClases = document.getElementById("contadorClases");
    const contadorEntrenadores = document.getElementById("contadorEntrenadores");
    const barraProgreso = document.getElementById("barraProgreso");
    const textoProgreso = document.getElementById("textoProgreso");

    const usuariosActivos = usuarios.filter(function(usuario) {
        return usuario.estado === "Activo";
    }).length;

    if (contadorUsuarios) contadorUsuarios.textContent = usuarios.length;
    if (contadorPlanes) contadorPlanes.textContent = usuariosActivos;
    if (contadorClases) contadorClases.textContent = 3 + clasesNuevas.length;
    if (contadorEntrenadores) contadorEntrenadores.textContent = entrenadores.length;

    if (barraProgreso && textoProgreso) {
        const porcentaje = Math.min((usuariosActivos / 300) * 100, 100);
        barraProgreso.style.width = porcentaje + "%";
        textoProgreso.textContent = Math.round(porcentaje) + "% de la meta de 300 usuarios activos";
    }
}

actualizarResumen();
