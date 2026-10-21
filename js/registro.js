// Solicitud de membresía. No se recopilan contraseñas porque no existe inicio de sesión para clientes.
(function () {
    const formularioRegistro = document.getElementById('formularioRegistro');
    const planSeleccionado = document.getElementById('planSeleccionado');
    const parametros = new URLSearchParams(window.location.search);
    const planesValidos = ['Básico', 'Premium', 'Profesional'];
    const planSolicitado = parametros.get('plan') || 'Básico';
    const plan = planesValidos.includes(planSolicitado) ? planSolicitado : 'Básico';
    const mensajeRegistro = document.getElementById('mensajeRegistro');

    if (planSeleccionado) planSeleccionado.textContent = 'Plan seleccionado: ' + plan;

    if (!formularioRegistro) return;
    formularioRegistro.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        const boton = formularioRegistro.querySelector('button[type="submit"]');
        if (boton) { boton.disabled = true; boton.textContent = 'Enviando solicitud…'; }
        if (mensajeRegistro) mensajeRegistro.textContent = '';
        const datos = {
            nombre: document.getElementById('nombreRegistro').value.trim(),
            correo: document.getElementById('correoRegistro').value.trim(),
            telefono: document.getElementById('telefonoRegistro').value.trim(),
            documento: document.getElementById('documentoRegistro').value.trim(),
            fecha: document.getElementById('fechaRegistro').value,
            plan,
            metodoPago: document.getElementById('metodoPago').value || 'Por definir'
        };

        try {
            const respuesta = await window.FitZoneAPI.registerMembership(datos);
            formularioRegistro.reset();
            if (planSeleccionado) planSeleccionado.textContent = 'Plan seleccionado: ' + plan;
            if (mensajeRegistro) mensajeRegistro.textContent = respuesta.message;
            const overlay = document.createElement('div');
            overlay.className = 'confirmacion-pago-overlay';
            overlay.innerHTML = `
                <div class="confirmacion-pago" role="dialog" aria-modal="true" aria-labelledby="tituloSolicitudRecibida">
                    <h2 id="tituloSolicitudRecibida">Solicitud recibida</h2>
                    <p>Registramos tu solicitud de membresía. FitZone se pondrá en contacto para confirmar los siguientes pasos y el pago.</p>
                    <button type="button" class="boton-principal" id="aceptarSolicitudRecibida">Aceptar</button>
                </div>`;
            document.body.appendChild(overlay);
            document.getElementById('aceptarSolicitudRecibida').addEventListener('click', function () {
                window.location.href = '../index.html';
            });
        } catch (error) {
            if (mensajeRegistro) mensajeRegistro.textContent = error.message || 'No pudimos registrar la solicitud. Revisa los datos e inténtalo otra vez.';
            else alert(error.message || 'No pudimos registrar la solicitud.');
        } finally {
            if (boton) { boton.disabled = false; boton.textContent = 'Enviar solicitud de membresía'; }
        }
    });
})();
