// Tema FitZone: cambia el tema SOLO de esta pestaña y respeta el tema del sistema al iniciar.
const botonModo = document.getElementById("botonModo");
const preferenciaOscura = window.matchMedia("(prefers-color-scheme: dark)");

function obtenerTema() {
    return sessionStorage.getItem("fitzoneTema") || (preferenciaOscura.matches ? "dark" : "light");
}

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    document.documentElement.style.colorScheme = tema;

    if (botonModo) {
        botonModo.textContent = tema === "dark" ? "☀️" : "🌙";
        botonModo.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
        botonModo.setAttribute("title", tema === "dark" ? "Modo claro" : "Modo oscuro");
    }
}

aplicarTema(obtenerTema());

if (botonModo) {
    botonModo.addEventListener("click", function () {
        const nuevoTema = obtenerTema() === "dark" ? "light" : "dark";
        sessionStorage.setItem("fitzoneTema", nuevoTema);
        aplicarTema(nuevoTema);
    });
}

preferenciaOscura.addEventListener("change", function () {
    if (!sessionStorage.getItem("fitzoneTema")) {
        aplicarTema(preferenciaOscura.matches ? "dark" : "light");
    }
});
