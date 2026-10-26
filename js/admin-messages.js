// Consulta y gestión sencilla de mensajes guardados en MySQL.
(function () {
    const contenedor = document.getElementById('listaMensajesAdmin');
    const estado = document.getElementById('estadoMensajesAdmin');
    const botonActualizar = document.getElementById('recargarMensajes');
    if (!contenedor || !window.FitZoneAPI) return;

    function crearTexto(tag, className, value) {
        const nodo = document.createElement(tag);
        if (className) nodo.className = className;
        nodo.textContent = value == null ? '' : String(value);
        return nodo;
    }

    async function cargarMensajes() {
        contenedor.replaceChildren();
        estado.textContent = 'Cargando mensajes…';
        if (botonActualizar) botonActualizar.disabled = true;
        try {
            const mensajes = await window.FitZoneAPI.getMessages();
            estado.textContent = mensajes.length ? (mensajes.length + ' mensaje(s) recibidos.') : 'Todavía no hay mensajes de contacto.';
            if (!mensajes.length) return;

            mensajes.forEach(function (mensaje) {
                const tarjeta = document.createElement('article');
                tarjeta.className = 'tarjeta-mensaje-admin' + (mensaje.leido ? '' : ' mensaje-no-leido');
                const cabecera = document.createElement('div');
                cabecera.className = 'mensaje-admin-cabecera';
                cabecera.append(
                    crearTexto('h3', 'titulo-tarjeta', mensaje.asunto),
                    crearTexto('span', 'insignia ' + (mensaje.leido ? 'insignia-inactivo' : 'insignia-activo'), mensaje.leido ? 'Leído' : 'Nuevo')
                );
                tarjeta.append(cabecera);
                tarjeta.appendChild(crearTexto('p', '', 'De: ' + mensaje.nombre));
                tarjeta.appendChild(crearTexto('p', '', 'Correo: ' + mensaje.correo));
                tarjeta.appendChild(crearTexto('p', '', 'Teléfono: ' + (mensaje.telefono || 'No indicado')));
                const fecha = mensaje.created_at ? new Date(mensaje.created_at).toLocaleString('es-CO') : '';
                tarjeta.appendChild(crearTexto('p', 'fecha-mensaje-admin', fecha));
                tarjeta.appendChild(crearTexto('p', 'texto-mensaje-admin', mensaje.mensaje));

                const acciones = document.createElement('div');
                acciones.className = 'acciones-gestion';
                const botonLeido = document.createElement('button');
                botonLeido.type = 'button'; botonLeido.className = 'boton-accion';
                botonLeido.textContent = mensaje.leido ? 'Marcar como nuevo' : 'Marcar como leído';
                botonLeido.addEventListener('click', async function () {
                    botonLeido.disabled = true;
                    try { await window.FitZoneAPI.markMessageRead(mensaje.id, !mensaje.leido); await cargarMensajes(); }
                    catch (error) { estado.textContent = error.message; botonLeido.disabled = false; }
                });
                const botonEliminar = document.createElement('button');
                botonEliminar.type = 'button'; botonEliminar.className = 'boton-accion boton-eliminar'; botonEliminar.textContent = 'Eliminar';
                botonEliminar.addEventListener('click', async function () {
                    if (!confirm('¿Eliminar este mensaje de forma permanente?')) return;
                    botonEliminar.disabled = true;
                    try { await window.FitZoneAPI.deleteMessage(mensaje.id); await cargarMensajes(); }
                    catch (error) { estado.textContent = error.message; botonEliminar.disabled = false; }
                });
                acciones.append(botonLeido, botonEliminar);
                tarjeta.appendChild(acciones);
                contenedor.appendChild(tarjeta);
            });
        } catch (error) {
            estado.textContent = 'No se pudieron cargar los mensajes: ' + error.message;
        } finally {
            if (botonActualizar) botonActualizar.disabled = false;
        }
    }

    if (botonActualizar) botonActualizar.addEventListener('click', cargarMensajes);
    cargarMensajes();
})();
