
function normalizarRutaImagen(foto) {
    if (!foto) return "../assets/images/elena.png";

    if (foto.startsWith("data:") || foto.startsWith("http")) {
        return foto;
    }

    let nombreArchivo = foto.split("/").pop();

    if (nombreArchivo.toLowerCase() === "elena.png") {
        nombreArchivo = "elena.png";
    }

    return "../assets/images/" + nombreArchivo;
}
// perfil-entrenador.js
// Busca el entrenador seleccionado y muestra solamente su perfil.

const contenedorPerfil = document.getElementById("perfilEntrenador");
const parametrosPerfil = new URLSearchParams(window.location.search);
const idEntrenador = parametrosPerfil.get("id");
const nombreEntrenador = parametrosPerfil.get("nombre");

const entrenadoresBase = [
    {
        nombre: "Carlos Gómez",
        especialidad: "Especialista en Musculación",
        experiencia: "6 años",
        descripcion: "Enfocado en hipertrofia muscular, fuerza máxima y biomecánica aplicada al entrenamiento libre.",
        foto: "../assets/images/carlos.png"
    },
    {
        nombre: "Ana Martínez",
        especialidad: "Instructora de Yoga y Pilates",
        experiencia: "8 años",
        descripcion: "Experta en movilidad articular, corrección postural y control respiratorio para mejorar el bienestar integral.",
        foto: "../assets/images/ana.png"
    },
    {
        nombre: "David Silva",
        especialidad: "Coach de CrossFit y Cardio",
        experiencia: "5 años",
        descripcion: "Especializado en acondicionamiento metabólico, entrenamientos de alta intensidad y resistencia.",
        foto: "../assets/images/david.png"
    },
    {
        nombre: "Elena Ríos",
        especialidad: "Nutrición y Readaptación",
        experiencia: "7 años",
        descripcion: "Apasionada por la readaptación funcional tras lesiones y la optimización del rendimiento mediante hábitos saludables.",
        foto: "../assets/images/elena.png"
    }
];

function buscarEntrenador() {
    const guardados = obtenerLista("entrenadores");
    const todos = entrenadoresBase.concat(guardados);

    if (idEntrenador) {
        return todos.find(function(entrenador) {
            return String(entrenador.id) === String(idEntrenador);
        });
    }

    if (nombreEntrenador) {
        return todos.find(function(entrenador) {
            return entrenador.nombre === nombreEntrenador;
        });
    }

    return null;
}

const entrenador = buscarEntrenador();

if (entrenador && contenedorPerfil) {
    contenedorPerfil.innerHTML = `
        <div class="perfil-entrenador-card">
            <img src="${normalizarRutaImagen(entrenador.foto)}" alt="${entrenador.nombre}">
            <div>
                <h2>${entrenador.nombre}</h2>
                <h3>${entrenador.especialidad}</h3>
                <p><strong>Experiencia:</strong> ${entrenador.experiencia}</p>
                <p>${entrenador.descripcion}</p>
                <a href="contacto.html" class="boton-principal">Contactar entrenador</a>
                <a href="entrenadores.html" class="boton-secundario">Ver todos</a>
            </div>
        </div>
    `;
} else if (contenedorPerfil) {
    contenedorPerfil.innerHTML = `
        <div class="tarjeta-info-contacto">
            <h2>Entrenador no encontrado</h2>
            <p>Regresa a la sección de entrenadores y selecciona un perfil.</p>
            <a href="entrenadores.html" class="boton-principal">Ver entrenadores</a>
        </div>
    `;
}
