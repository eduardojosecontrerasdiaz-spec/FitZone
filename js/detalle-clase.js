
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

const clasesGuardadas = obtenerLista("clases");
const todasLasClases = clasesBaseDetalle.concat(clasesGuardadas);
const clase = todasLasClases.find(function(item) { return String(item.id) === String(idClase); });

if (clase && contenedorDetalle) {
    contenedorDetalle.innerHTML = `
        <img src="${normalizarRutaImagen(clase.foto)}" alt="${clase.nombre}">
        <div>
            <h2>${clase.nombre}</h2>
            <p class="detalle-clase-descripcion">${clase.descripcion}</p>
            <p><strong>Nivel:</strong> ${clase.nivel}</p>
            <p><strong>Duración:</strong> ${clase.duracion}</p>
            <p><strong>Horario:</strong> ${clase.horario}</p>
            <p><strong>Instructor:</strong> ${clase.instructor}</p>
            <a href="clases.html" class="boton-principal">Volver a clases</a>
        </div>
    `;
} else if (contenedorDetalle) {
    contenedorDetalle.innerHTML = `
        <h2>Clase no encontrada</h2>
        <p>Regresa a la sección de clases y selecciona una clase.</p>
        <a href="clases.html" class="boton-principal">Ver clases</a>
    `;
}
