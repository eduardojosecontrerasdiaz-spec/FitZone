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

// Carga los planes activos desde MySQL. Si la tabla aún no está importada,
// se conservan los precios estáticos de respaldo para que la página no se rompa.
async function cargarPlanesDesdeMySQL() {
    if (!window.FitZoneAPI || typeof window.FitZoneAPI.getPlans !== "function") return;

    try {
        const planes = await window.FitZoneAPI.getPlans();
        if (!Array.isArray(planes) || planes.length === 0) return;

        const nombresPermitidos = new Set(["Básico", "Premium", "Profesional"]);
        const tarjetas = Array.from(document.querySelectorAll("#planes-lista .tarjeta-plan"));

        planes.forEach(function(plan) {
            if (!nombresPermitidos.has(plan.nombre)) return;

            const tarjeta = tarjetas.find(function(item) {
                const boton = item.querySelector(".boton-info-plan");
                return boton && boton.getAttribute("data-plan") === plan.nombre;
            });
            if (!tarjeta) return;

            const titulo = tarjeta.querySelector(".nombre-plan");
            const precio = tarjeta.querySelector(".precio-plan");
            const boton = tarjeta.querySelector(".boton-info-plan");

            if (titulo) titulo.textContent = plan.nombre;
            if (boton) boton.setAttribute("data-plan", plan.nombre);

            const valor = Number(plan.precio);
            if (precio && Number.isFinite(valor)) {
                const formato = new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0
                });
                precio.replaceChildren(document.createTextNode(formato.format(valor) + " "));

                const duracion = Number(plan.duracion_dias) || 30;
                const sufijo = document.createElement("small");
                sufijo.textContent = duracion >= 28 && duracion <= 31 ? "/mes" : "/" + duracion + " días";
                precio.appendChild(sufijo);
            }
        });
    } catch (error) {
        console.warn("No se pudieron cargar los planes desde MySQL; se conserva la información de respaldo.", error.message);
    }
}

cargarPlanesDesdeMySQL();
