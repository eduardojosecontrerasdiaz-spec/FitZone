
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
// entrenadores.js
// Muestra perfiles individuales y agrega entrenadores guardados en el navegador.

function obtenerEntrenadoresGuardados() {
    const datos = localStorage.getItem("entrenadores");

    if (datos) {
        return JSON.parse(datos);
    }

    return [];
}

function mostrarEntrenadoresNuevos() {
    const contenedor = document.querySelector(".grid-entrenadores");

    if (!contenedor) {
        return;
    }

    const entrenadores = obtenerEntrenadoresGuardados();

    if (entrenadores.length === 0) {
        return;
    }

    contenedor.innerHTML = "";

    entrenadores.forEach(function(entrenador) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-entrenador entrenador-nuevo";

        tarjeta.innerHTML = `
            <img src="${normalizarRutaImagen(entrenador.foto)}" alt="${entrenador.nombre}">
            <h3 class="nombre-entrenador">${entrenador.nombre}</h3>
            <p class="especialidad-entrenador">${entrenador.especialidad}</p>
            <p class="experiencia-entrenador"><strong>Experiencia:</strong> ${entrenador.experiencia}</p>
            <p class="texto-tarjeta">${entrenador.descripcion}</p>
            <a href="perfil-entrenador.html?id=${entrenador.id}" class="boton-principal">Ver Perfil</a>
        `;

        contenedor.appendChild(tarjeta);
    });
}

function prepararPerfiles() {
    const botones = document.querySelectorAll(".tarjeta-entrenador .boton-principal, .tarjeta-entrenador .boton-secundario");

    botones.forEach(function(boton) {
        boton.addEventListener("click", function(evento) {
            const tarjeta = boton.closest(".tarjeta-entrenador");
            const nombre = tarjeta.querySelector(".nombre-entrenador").textContent.trim();

            if (boton.textContent.trim() === "Ver Perfil") {
                evento.preventDefault();
                window.location.href = "perfil-entrenador.html?nombre=" + encodeURIComponent(nombre);
            }
        });
    });
}

mostrarEntrenadoresNuevos();
prepararPerfiles();
