window.FitZoneDashboardMembersLoaded = false;

// USUARIOS
// ==============================

function guardarUsuarios() {
    const filas = document.querySelectorAll(".tabla-admin tbody tr");
    const usuarios = [];

    filas.forEach(function(fila) {
        const celdas = fila.querySelectorAll("td");
        if (celdas.length >= 4) {
            usuarios.push({
                id: fila.dataset.memberId ? Number(fila.dataset.memberId) : null,
                nombre: celdas[0].textContent.trim(),
                correo: celdas[1].textContent.trim(),
                plan: celdas[2].textContent.trim(),
                estado: celdas[3].textContent.trim()
            });
        }
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    if (window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated()) {
        if (!window.FitZoneDashboardMembersLoaded) {
            window.FitZoneAPI.reportSyncError("No se pudieron sincronizar los miembros porque no se logró cargar primero la lista del servidor. Recarga el Dashboard antes de volver a guardar.");
            return;
        }
        window.FitZoneAPI.saveMembers(usuarios).catch(function(error) {
            window.FitZoneAPI.reportSyncError("No se pudieron guardar los miembros en PostgreSQL: " + error.message);
        });
    }
}

function agregarFilaUsuario(usuario) {
    const fila = document.createElement("tr");
    if (usuario.id) fila.dataset.memberId = String(usuario.id);
    const claseEstado = usuario.estado === "Activo" ? "insignia-activo" : (usuario.estado === "Pendiente" ? "insignia-pendiente" : "insignia-inactivo");
    [usuario.nombre, usuario.correo, usuario.plan].forEach(function(valor) {
        const celda = document.createElement("td");
        celda.textContent = valor || "";
        fila.appendChild(celda);
    });
    const celdaEstado = document.createElement("td");
    const insignia = document.createElement("span");
    insignia.className = "insignia " + claseEstado;
    insignia.textContent = usuario.estado || "Activo";
    celdaEstado.appendChild(insignia);
    fila.appendChild(celdaEstado);

    const celdaAcciones = document.createElement("td");
    const editar = document.createElement("button");
    editar.type = "button"; editar.className = "boton-accion boton-editar"; editar.textContent = "Editar";
    const eliminar = document.createElement("button");
    eliminar.type = "button"; eliminar.className = "boton-accion boton-eliminar"; eliminar.textContent = "Eliminar";
    celdaAcciones.append(editar, eliminar);
    fila.appendChild(celdaAcciones);
    tablaUsuarios.appendChild(fila);
    prepararBotonesUsuario(fila);
    actualizarResumen();
}

function prepararBotonesUsuario(fila) {
    fila.querySelector(".boton-eliminar").onclick = function() {
        const nombre = fila.cells[0].textContent.trim();

        if (confirm("¿Seguro que quieres eliminar a " + nombre + "?")) {
            fila.remove();
            guardarUsuarios();
            actualizarResumen();
        }
    };

    fila.querySelector(".boton-editar").onclick = function() {
        const usuarioActual = {
            nombre: fila.cells[0].textContent.trim(),
            correo: fila.cells[1].textContent.trim(),
            plan: fila.cells[2].textContent.trim(),
            estado: fila.cells[3].textContent.trim()
        };

        abrirFormularioUsuario("editar", usuarioActual, function(usuario) {
            fila.cells[0].textContent = usuario.nombre;
            fila.cells[1].textContent = usuario.correo;
            fila.cells[2].textContent = usuario.plan;

            const insignia = fila.cells[3].querySelector("span");
            insignia.textContent = usuario.estado;
            insignia.className = usuario.estado === "Activo"
                ? "insignia insignia-activo"
                : (usuario.estado === "Pendiente" ? "insignia insignia-pendiente" : "insignia insignia-inactivo");

            guardarUsuarios();
            actualizarResumen();
        });
    };
}

function abrirFormularioUsuario(tipo, usuario, alGuardar) {
    cerrarFormulario("formularioUsuario");

    const formulario = document.createElement("div");
    formulario.id = "formularioUsuario";
    formulario.className = "formulario-entrenador-dashboard";

    formulario.innerHTML = `
        <div class="formulario-entrenador-caja">
            <h2>${tipo === "editar" ? "Editar usuario" : "Agregar usuario"}</h2>

            <label>Nombre completo</label>
            <input id="usuarioNombre" type="text" value="${escaparHTMLFitZone(usuario.nombre || "")}" placeholder="Nombre completo">

            <label>Correo</label>
            <input id="usuarioCorreo" type="email" value="${escaparHTMLFitZone(usuario.correo || "")}" placeholder="Correo electrónico">

            <label>Plan</label>
            <select id="usuarioPlan">
                <option ${usuario.plan === "Básico" ? "selected" : ""}>Básico</option>
                <option ${usuario.plan === "Premium" ? "selected" : ""}>Premium</option>
                <option ${usuario.plan === "Profesional" ? "selected" : ""}>Profesional</option>
            </select>

            <label>Estado</label>
            <select id="usuarioEstado">
                <option ${usuario.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                <option ${usuario.estado === "Activo" ? "selected" : ""}>Activo</option>
                <option ${usuario.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
            </select>

            <div>
                <button id="guardarUsuario" type="button" class="boton-principal">
                    ${tipo === "editar" ? "Guardar cambios" : "Agregar usuario"}
                </button>
                <button id="cerrarFormularioUsuario" type="button" class="boton-accion">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(formulario);

    document.getElementById("cerrarFormularioUsuario").addEventListener("click", function() {
        formulario.remove();
    });

    document.getElementById("guardarUsuario").addEventListener("click", function() {
        const nombre = document.getElementById("usuarioNombre").value.trim();
        const correo = document.getElementById("usuarioCorreo").value.trim();
        const plan = document.getElementById("usuarioPlan").value;
        const estado = document.getElementById("usuarioEstado").value;

        if (!nombre || !correo) {
            alert("Completa el nombre y el correo.");
            return;
        }

        alGuardar({
            nombre: nombre,
            correo: correo,
            plan: plan,
            estado: estado
        });

        formulario.remove();

        if (tipo === "nuevo") {
            alert("Usuario agregado correctamente.");
        } else {
            alert("Usuario actualizado correctamente.");
        }
    });
}

function iniciarUsuariosDesdeLocal() {
    const usuariosGuardados = obtenerLista("usuarios");
    if (usuariosGuardados.length === 0) {
        document.querySelectorAll(".tabla-admin tbody tr").forEach(function(fila) {
            prepararBotonesUsuario(fila);
        });
        guardarUsuarios();
    } else {
        tablaUsuarios.innerHTML = "";
        usuariosGuardados.forEach(function(usuario) { agregarFilaUsuario(usuario); });
    }
}

async function cargarMiembrosDelServidor() {
    const miembrosLocales = obtenerLista("usuarios");
    try {
        let miembros = await window.FitZoneAPI.getMembers();

        // Si es una base recién creada y el navegador conserva registros antiguos,
        // se pide autorización antes de importar o reemplazar esos datos locales.
        if (miembros.length === 0 && miembrosLocales.length > 0) {
            const importar = confirm(
                "La base de datos todavía no tiene miembros, pero este navegador conserva " +
                miembrosLocales.length + " registro(s). ¿Quieres importarlos a PostgreSQL ahora? " +
                "Si eliges Cancelar, se conservarán en este navegador y no se borrarán."
            );

            if (!importar) {
                window.FitZoneDashboardMembersLoaded = false;
                tablaUsuarios.replaceChildren();
                miembrosLocales.forEach(function(usuario) { agregarFilaUsuario(usuario); });
                actualizarResumen();
                window.FitZoneAPI.reportSyncError(
                    "Los miembros locales se conservaron. No se enviarán cambios al servidor hasta que se importen."
                );
                return;
            }

            await window.FitZoneAPI.saveMembers(miembrosLocales);
            miembros = await window.FitZoneAPI.getMembers();
        }

        window.FitZoneDashboardMembersLoaded = true;
        tablaUsuarios.replaceChildren();
        localStorage.setItem("usuarios", JSON.stringify(miembros));
        miembros.forEach(function(usuario) { agregarFilaUsuario(usuario); });
        actualizarResumen();
    } catch (error) {
        console.warn("No se pudieron cargar los miembros del servidor; se conservan los datos locales.", error.message);
        iniciarUsuariosDesdeLocal();
        window.FitZoneAPI.reportSyncError(
            "No se pudieron sincronizar los miembros. Se conservan los datos del navegador; revisa la conexión y recarga."
        );
    }
}

if (tablaUsuarios) {
    if (window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated()) {
        cargarMiembrosDelServidor();
    } else {
        iniciarUsuariosDesdeLocal();
    }
}

if (buscador) {
    buscador.addEventListener("input", function() {
        const texto = buscador.value.toLowerCase();

        document.querySelectorAll(".tabla-admin tbody tr").forEach(function(fila) {
            fila.style.display = fila.textContent.toLowerCase().includes(texto) ? "" : "none";
        });
    });
}

if (botonAgregarUsuario) {
    botonAgregarUsuario.addEventListener("click", function() {
        abrirFormularioUsuario("nuevo", {
            nombre: "",
            correo: "",
            plan: "Básico",
            estado: "Activo"
        }, function(usuario) {
            agregarFilaUsuario(usuario);
            guardarUsuarios();
        });
    });
}

// ==============================
