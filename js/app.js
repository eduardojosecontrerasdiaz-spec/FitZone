// Formulario de contacto: validar, enviar a la API y confirmar únicamente cuando se guarde.
(function () {
    const formularios = document.querySelectorAll('.formulario-contacto');

    formularios.forEach(function (formulario) {
        if (formulario.id === 'formAdmin') return;
        formulario.addEventListener('submit', async function (evento) {
            evento.preventDefault();
            const nombre = document.getElementById('nombre');
            const correo = document.getElementById('correo');
            const telefono = document.getElementById('telefono');
            const asunto = document.getElementById('asunto');
            const mensaje = document.getElementById('mensaje');
            if (!nombre || !correo || !mensaje) return;

            const datos = {
                nombre: nombre.value.trim(),
                correo: correo.value.trim(),
                telefono: telefono ? telefono.value.trim() : '',
                asunto: asunto ? asunto.value.trim() : 'Consulta desde la página principal',
                mensaje: mensaje.value.trim()
            };
            if (datos.nombre.length < 3) return alert('El nombre debe tener mínimo 3 caracteres.');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) return alert('Escribe un correo electrónico válido.');
            if (datos.telefono.length < 7) return alert('Escribe un teléfono válido.');
            if (datos.asunto.length < 3) return alert('Escribe un asunto.');
            if (datos.mensaje.length < 10) return alert('El mensaje debe tener mínimo 10 caracteres.');

            const boton = formulario.querySelector('button[type="submit"]');
            const textoOriginal = boton ? boton.textContent : '';
            if (boton) { boton.disabled = true; boton.textContent = 'Enviando…'; }
            try {
                await window.FitZoneAPI.sendContact(datos);
                alert('¡Mensaje recibido correctamente! FitZone podrá consultarlo desde su base de datos.');
                formulario.reset();
            } catch (error) {
                alert(error.message || 'No se pudo enviar el mensaje. Revisa tu conexión e inténtalo otra vez.');
            } finally {
                if (boton) { boton.disabled = false; boton.textContent = textoOriginal; }
            }
        });
    });
})();
