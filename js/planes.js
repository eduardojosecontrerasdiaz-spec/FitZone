// planes.js
// Selección de plan y arreglo del modal.

const botonesInfoPlan = document.querySelectorAll(".boton-info-plan");
const botonInscribirme = document.getElementById("botonInscribirmePlan");

botonesInfoPlan.forEach(function(boton) {
    boton.addEventListener("click", function() {
        const plan = boton.getAttribute("data-plan");

        if (botonInscribirme) {
            botonInscribirme.setAttribute("data-plan", plan);
            botonInscribirme.href = "registro.html?plan=" + encodeURIComponent(plan);
        }
    });
});

// Evita que el fondo oscuro del modal quede pegado al cerrar.
const modalPlan = document.getElementById("modalInfoPlan");

if (modalPlan) {
    modalPlan.addEventListener("hidden.bs.modal", function() {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        const fondos = document.querySelectorAll(".modal-backdrop");
        fondos.forEach(function(fondo) {
            fondo.remove();
        });
    });
}

if (botonInscribirme) {
    botonInscribirme.addEventListener("click", function(evento) {
        const plan = botonInscribirme.getAttribute("data-plan") || "Básico";
        evento.preventDefault();
        window.location.href = "registro.html?plan=" + encodeURIComponent(plan);
    });
}
