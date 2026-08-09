// validation.js
// Validación sencilla para formularios que no tienen una función propia.

const formularios = document.querySelectorAll("form:not(#formularioRegistro):not(.formulario-contacto)");

formularios.forEach(function(formulario) {
    formulario.addEventListener("submit", function(evento) {
        const campos = formulario.querySelectorAll("input[required], textarea[required], select[required]");
        let correcto = true;

        campos.forEach(function(campo) {
            if (campo.value.trim() === "") {
                correcto = false;
                campo.style.border = "2px solid #ef4444";
            } else {
                campo.style.border = "";
            }
        });

        const correo = formulario.querySelector("input[type='email']");
        if (correo && correo.value !== "" && !correo.value.includes("@")) {
            correcto = false;
            correo.style.border = "2px solid #ef4444";
            alert("Escribe un correo electrónico válido.");
            correo.focus();
            evento.preventDefault();
            return;
        }

        if (!correcto) {
            evento.preventDefault();
            alert("Por favor completa todos los campos obligatorios.");
        }
    });
});
