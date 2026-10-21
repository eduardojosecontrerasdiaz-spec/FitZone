// Inicio de sesión: las credenciales se validan exclusivamente en la API.
(function () {
    const formulario = document.getElementById('formAdmin');
    if (!formulario || !window.FitZoneAPI) return;

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        const usuario = document.getElementById('adminUsuario').value.trim();
        const clave = document.getElementById('adminClave').value;
        const mensaje = document.getElementById('mensajeAdmin');
        const boton = formulario.querySelector('button[type="submit"]');
        mensaje.textContent = '';
        boton.disabled = true;

        try {
            await window.FitZoneAPI.login(usuario, clave);
            window.location.href = 'dashboard.html';
        } catch (error) {
            mensaje.textContent = error.status === 429
                ? 'Demasiados intentos. Espera unos minutos antes de volver a intentar.'
                : error.message || 'No fue posible iniciar sesión. Comprueba que el servidor esté disponible.';
            mensaje.style.color = '#b42318';
        } finally {
            boton.disabled = false;
        }
    });
})();
