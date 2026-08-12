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

        const overlay = document.createElement("div");
        overlay.className = "confirmacion-pago-overlay";
        overlay.innerHTML = `
            <div class="confirmacion-pago" role="dialog" aria-modal="true" aria-labelledby="tituloPagoExitoso">
                <h2 id="tituloPagoExitoso">Pago exitoso</h2>
                <p>Tu membresía fue registrada correctamente. ¡Bienvenido a FitZone!</p>
                <button type="button" class="boton-principal" id="aceptarPagoExitoso">Aceptar</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("aceptarPagoExitoso").addEventListener("click", function () {
            window.location.href = "../index.html";
        });
    });
}
