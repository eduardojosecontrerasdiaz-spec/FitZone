// darkmode.js
// Activa y guarda el modo oscuro.

const botonModo = document.getElementById("botonModo");

if (localStorage.getItem("modoOscuro") === "si") {
    document.body.classList.add("modo-oscuro");
}

if (botonModo) {
    if (document.body.classList.contains("modo-oscuro")) {
        botonModo.textContent = "☀️";
    }

    botonModo.addEventListener("click", function() {
        document.body.classList.toggle("modo-oscuro");

        if (document.body.classList.contains("modo-oscuro")) {
            localStorage.setItem("modoOscuro", "si");
            botonModo.textContent = "☀️";
        } else {
            localStorage.setItem("modoOscuro", "no");
            botonModo.textContent = "🌙";
        }
    });
}
