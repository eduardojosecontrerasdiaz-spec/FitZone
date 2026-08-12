
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


// Buscador y votación sencilla de entrenadores.
document.addEventListener("DOMContentLoaded", function () {
    const buscador = document.getElementById("buscarEntrenador");
    const tarjetas = Array.from(document.querySelectorAll(".grid-entrenadores .tarjeta-entrenador"));
    const clave = "fitzoneCalificaciones";
    let calificaciones = JSON.parse(localStorage.getItem(clave) || "{}");
    const nombresBase = {"Carlos Gómez":5.0,"Ana Martínez":4.8,"David Silva":4.7,"Elena Ríos":4.9};

    function promedio(nombre){
        const dato=calificaciones[nombre];
        if(!dato) return nombresBase[nombre] || 5;
        return dato.total / dato.votos;
    }
    function actualizar(){
        tarjetas.forEach(function(t){
            const nombre=t.querySelector(".nombre-entrenador")?.textContent.trim();
            if(!nombre) return;
            const valor=promedio(nombre);
            const span=t.querySelector(".valor-rating");
            if(span) span.textContent=valor.toFixed(1);
            const estrellas=t.querySelector(".estrellas-entrenador");
            if(estrellas) estrellas.textContent="★★★★★";
        });
        const orden=tarjetas.slice().sort((a,b)=>promedio(b.querySelector(".nombre-entrenador").textContent.trim())-promedio(a.querySelector(".nombre-entrenador").textContent.trim()));
        tarjetas.forEach(t=>t.classList.remove("destacado"));
        orden.slice(0,2).forEach(t=>t.classList.add("destacado"));
    }
    tarjetas.forEach(function(t){
        t.querySelectorAll(".boton-voto").forEach(function(btn){
            btn.addEventListener("click",function(){
                const nombre=t.querySelector(".nombre-entrenador").textContent.trim();
                const valor=Number(btn.dataset.voto);
                if(!calificaciones[nombre]) calificaciones[nombre]={total:nombresBase[nombre]||5,votos:1};
                calificaciones[nombre].total+=valor;
                calificaciones[nombre].votos+=1;
                localStorage.setItem(clave,JSON.stringify(calificaciones));
                actualizar();
            });
        });
    });
    if(buscador){
        buscador.addEventListener("input",function(){
            const texto=buscador.value.toLowerCase().trim();
            tarjetas.forEach(function(t){t.style.display=t.textContent.toLowerCase().includes(texto)?"":"none";});
        });
    }
    actualizar();
});
