// registro.js
// Guarda el registro y simula la confirmación del pago.

const formularioRegistro = document.getElementById("formularioRegistro");
const planSeleccionado = document.getElementById("planSeleccionado");
const parametros = new URLSearchParams(window.location.search);
const plan = parametros.get("plan") || "Básico";

if (planSeleccionado) {
    planSeleccionado.textContent = "Plan seleccionado: " + plan;
}

if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const password = document.getElementById("passwordRegistro").value;
        const confirmarPassword = document.getElementById("confirmarPasswordRegistro").value;

        if (password.length < 6) {
            alert("La contraseña debe tener mínimo 6 caracteres.");
            return;
        }

        if (password !== confirmarPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const usuario = {
            nombre: document.getElementById("nombreRegistro").value,
            correo: document.getElementById("correoRegistro").value,
            telefono: document.getElementById("telefonoRegistro").value,
            documento: document.getElementById("documentoRegistro").value,
            fecha: document.getElementById("fechaRegistro").value,
            plan: plan,
            estado: "Activo"
        };

        const usuarios = obtenerLista("usuarios");
        usuarios.push(usuario);
        guardarLista("usuarios", usuarios);

        alert("Registro completado. El pago fue registrado de forma simulada. ¡Bienvenido a FitZone!");
        window.location.href = "dashboard.html";
    });
}
