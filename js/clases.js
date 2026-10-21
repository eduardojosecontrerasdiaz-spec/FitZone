
function escaparHTMLFitZone(valor) {
    return String(valor == null ? "" : valor).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizarRutaImagen(foto) {
    if (!foto) return "../assets/images/crossFit.png";

    if (foto.startsWith("data:") || foto.startsWith("http")) {
        return foto;
    }

    let nombreArchivo = foto.split("/").pop();
    return "../assets/images/" + nombreArchivo;
}
// clases.js
// Muestra las clases nuevas y permite abrir el detalle de cada una.

function obtenerClasesGuardadas() {
    return obtenerLista("clases");
}

function mostrarClasesNuevas() {
    const contenedor = document.getElementById("listaClasesNuevas");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    const clases = obtenerClasesGuardadas();

    if (clases.length === 0) {
        contenedor.innerHTML = `
            <article class="tarjeta-vacio">
                <div class="icono-vacio">+</div>
                <h3>Próximamente</h3>
                <p>Estamos preparando nuevas clases para que sigas superando tus límites.</p>
            </article>
        `;
        return;
    }

    clases.forEach(function(clase) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-entrenador";

        tarjeta.innerHTML = `
            <img class="imagen-entrenador" src="${normalizarRutaImagen(clase.foto)}" alt="${escaparHTMLFitZone(clase.nombre)}">
            <h3 class="nombre-entrenador">${escaparHTMLFitZone(clase.nombre)}</h3>
            <p class="texto-tarjeta">${escaparHTMLFitZone(clase.descripcion)}</p>
            <p class="experiencia-entrenador"><strong>Nivel:</strong> ${escaparHTMLFitZone(clase.nivel)}</p>
            <p class="experiencia-entrenador"><strong>Duración:</strong> ${escaparHTMLFitZone(clase.duracion)}</p>
            <p class="experiencia-entrenador"><strong>Horario:</strong> ${escaparHTMLFitZone(clase.horario)}</p>
            <p class="experiencia-entrenador"><strong>Instructor:</strong> ${escaparHTMLFitZone(clase.instructor)}</p>
            <a href="detalle-clase.html?id=${clase.id}" class="boton-principal">Ver detalles</a>
        `;

        contenedor.appendChild(tarjeta);
    });
}

mostrarClasesNuevas();

if (window.FitZoneAPI) {
    window.FitZoneAPI.getPublicCollection("clases").then(function (remotas) {
        if (Array.isArray(remotas)) {
            localStorage.setItem("clases", JSON.stringify(remotas));
            mostrarClasesNuevas();
        }
    }).catch(function (error) {
        console.warn("No se pudieron cargar nuevas clases desde el servidor; se conservan los datos locales.", error.message);
    });
}
