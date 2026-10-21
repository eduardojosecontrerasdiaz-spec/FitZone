
function normalizarRutaImagen(foto) {
    if (!foto) return "../assets/images/crossFit.png";

    if (foto.startsWith("data:") || foto.startsWith("http")) {
        return foto;
    }

    let nombreArchivo = foto.split("/").pop();
    return "../assets/images/" + nombreArchivo;
}
// detalle-clase.js
// Muestra solamente la clase seleccionada.

const parametros = new URLSearchParams(window.location.search);
const idClase = parametros.get("id");
const contenedorDetalle = document.getElementById("detalleClase");

const clasesBaseDetalle = [
    { id: 1, nombre: "CrossFit Intenso", nivel: "Avanzado", duracion: "60 minutos", horario: "Lun - Mié - Vie (7:00 AM)", instructor: "Carlos Gómez", descripcion: "Entrenamiento de alta intensidad para fuerza y resistencia física.", foto: "../assets/images/crossFit.png" },
    { id: 2, nombre: "Yoga Flow", nivel: "Todos los niveles", duracion: "50 minutos", horario: "Mar - Jue (8:00 AM)", instructor: "Ana Martínez", descripcion: "Posturas y flexibilidad para conectar cuerpo, mente y respiración.", foto: "../assets/images/yoga.png" },
    { id: 3, nombre: "Spinning Cardio", nivel: "Intermedio", duracion: "45 minutos", horario: "Lun - Vie (6:00 PM)", instructor: "David Silva", descripcion: "Ciclismo bajo techo con música motivadora para alta quema calórica.", foto: "../assets/images/Spinning.png" }
];

function escaparDetalleHTML(valor) {
    return String(valor == null ? "" : valor)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderizarDetalleClase() {
    const clasesGuardadas = obtenerLista("clases");
    const todasLasClases = clasesGuardadas.concat(clasesBaseDetalle);
    const clase = todasLasClases.find(function (item) { return String(item.id) === String(idClase); });
    if (!contenedorDetalle) return;

    if (clase) {
        contenedorDetalle.innerHTML = `
            <img src="${normalizarRutaImagen(clase.foto)}" alt="${escaparDetalleHTML(clase.nombre)}">
            <div>
                <h2>${escaparDetalleHTML(clase.nombre)}</h2>
                <p class="detalle-clase-descripcion">${escaparDetalleHTML(clase.descripcion)}</p>
                <p><strong>Nivel:</strong> ${escaparDetalleHTML(clase.nivel)}</p>
                <p><strong>Duración:</strong> ${escaparDetalleHTML(clase.duracion)}</p>
                <p><strong>Horario:</strong> ${escaparDetalleHTML(clase.horario)}</p>
                <p><strong>Instructor:</strong> ${escaparDetalleHTML(clase.instructor)}</p>
                <a href="clases.html" class="boton-principal">Volver a clases</a>
            </div>`;
    } else {
        contenedorDetalle.innerHTML = `
            <h2>Clase no encontrada</h2>
            <p>Regresa a la sección de clases y selecciona una clase.</p>
            <a href="clases.html" class="boton-principal">Ver clases</a>`;
    }
}

renderizarDetalleClase();
if (window.FitZoneAPI) {
    window.FitZoneAPI.getPublicCollection("clases").then(function (remotas) {
        if (Array.isArray(remotas)) {
            localStorage.setItem("clases", JSON.stringify(remotas));
            renderizarDetalleClase();
        }
    }).catch(function (error) {
        console.warn("No se pudieron cargar los detalles de la clase desde el servidor; se usa la copia local.", error.message);
    });
}
