const formulario = document.querySelector(".formulario-contacto");

if (formulario) {
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        if (nombre === "") {
            alert("Escribe tu nombre.");
            return;
        }

        if (nombre.length < 3) {
            alert("El nombre debe tener mínimo 3 caracteres.");
            return;
        }

        if (correo === "" || !correo.includes("@")) {
            alert("Escribe un correo electrónico válido.");
            return;
        }

        if (mensaje === "") {
            alert("Escribe tu mensaje.");
            return;
        }

        if (mensaje.length < 10) {
            alert("El mensaje debe tener mínimo 10 caracteres.");
            return;
        }

        alert("¡Mensaje enviado correctamente!");
        formulario.reset();
    });
}
