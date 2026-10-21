
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
        foto: "../assets/images/carlos.png",
        enfoque: "Fuerza, hipertrofia y técnica de levantamientos.",
        certificaciones: "Preparación física y biomecánica aplicada.",
        metodologia: "Planificación progresiva basada en objetivos, técnica y seguimiento del rendimiento."
    },
    {
        nombre: "Ana Martínez",
        especialidad: "Instructora de Yoga y Pilates",
        experiencia: "8 años",
        descripcion: "Experta en movilidad articular, corrección postural y control respiratorio para mejorar el bienestar integral.",
        foto: "../assets/images/ana.png",
        enfoque: "Movilidad, postura, respiración y control corporal.",
        certificaciones: "Yoga, Pilates y entrenamiento de movilidad.",
        metodologia: "Sesiones progresivas centradas en movilidad, control postural y bienestar integral."
    },
    {
        nombre: "David Silva",
        especialidad: "Coach de CrossFit y Cardio",
        experiencia: "5 años",
        descripcion: "Especializado en acondicionamiento metabólico, entrenamientos de alta intensidad y resistencia.",
        foto: "../assets/images/david.png",
        enfoque: "HIIT, acondicionamiento metabólico y resistencia.",
        certificaciones: "Preparación funcional y entrenamiento de alta intensidad.",
        metodologia: "Entrenamientos dinámicos adaptados al nivel del usuario y orientados al rendimiento."
    },
    {
        nombre: "Elena Ríos",
        especialidad: "Nutrición y Readaptación",
        experiencia: "7 años",
        descripcion: "Apasionada por la readaptación funcional tras lesiones y la optimización del rendimiento mediante hábitos saludables.",
        foto: "../assets/images/elena.png",
        enfoque: "Readaptación funcional, hábitos y rendimiento sostenible.",
        certificaciones: "Nutrición deportiva y readaptación funcional.",
        metodologia: "Acompañamiento individual para recuperar capacidades y construir hábitos sostenibles."
    }
];

function escaparPerfilHTML(valor) {
    return String(valor == null ? "" : valor)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function buscarEntrenador() {
    const guardados = obtenerLista("entrenadores");
    const todos = guardados.concat(entrenadoresBase);
    if (idEntrenador) return todos.find(function (entrenador) { return String(entrenador.id) === String(idEntrenador); });
    if (nombreEntrenador) return todos.find(function (entrenador) { return entrenador.nombre === nombreEntrenador; });
    return null;
}

function renderizarPerfil(entrenador) {
    if (!contenedorPerfil) return;
    if (!entrenador) {
        contenedorPerfil.innerHTML = `
            <div class="tarjeta-info-contacto">
                <h2>Entrenador no encontrado</h2>
                <p>Regresa a la sección de entrenadores y selecciona un perfil.</p>
                <a href="entrenadores.html" class="boton-principal">Ver entrenadores</a>
            </div>`;
        return;
    }
    contenedorPerfil.innerHTML = `
        <div class="perfil-entrenador-card">
            <img src="${normalizarRutaImagen(entrenador.foto)}" alt="${escaparPerfilHTML(entrenador.nombre)}">
            <div>
                <h2>${escaparPerfilHTML(entrenador.nombre)}</h2>
                <h3>${escaparPerfilHTML(entrenador.especialidad)}</h3>
                <p><strong>Experiencia:</strong> ${escaparPerfilHTML(entrenador.experiencia)}</p>
                <p>${escaparPerfilHTML(entrenador.descripcion)}</p>
                <p><strong>Enfoque:</strong> ${escaparPerfilHTML(entrenador.enfoque || "Entrenamiento personalizado y seguimiento del progreso.")}</p>
                <p><strong>Certificaciones:</strong> ${escaparPerfilHTML(entrenador.certificaciones || "Formación profesional especializada.")}</p>
                <p><strong>Metodología:</strong> ${escaparPerfilHTML(entrenador.metodologia || "Planificación adaptada a los objetivos de cada usuario.")}</p>
                <a href="contacto.html" class="boton-principal">Contactar entrenador</a>
                <a href="entrenadores.html" class="boton-secundario">Ver todos</a>
            </div>
        </div>`;
}

renderizarPerfil(buscarEntrenador());
if (window.FitZoneAPI) {
    window.FitZoneAPI.getPublicCollection("entrenadores").then(function (remotos) {
        if (Array.isArray(remotos)) {
            localStorage.setItem("entrenadores", JSON.stringify(remotos));
            renderizarPerfil(buscarEntrenador());
        }
    }).catch(function (error) {
        console.warn("No se pudo actualizar el perfil desde el servidor; se conserva la versión local.", error.message);
    });
}
