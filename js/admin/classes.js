// CLASES
// ==============================

if (botonAgregarClasePrincipal) {
    botonAgregarClasePrincipal.addEventListener("click", function() {
        abrirFormularioClase();
    });
}

function abrirFormularioClase(clase, alGuardar) {
    cerrarFormulario("formularioClase");

    const editar = !!clase;
    const formulario = document.createElement("div");
    formulario.id = "formularioClase";
    formulario.className = "formulario-entrenador-dashboard formulario-clase-dashboard";

    formulario.innerHTML = `
        <div class="formulario-entrenador-caja">
            <h2>${editar ? "Editar clase" : "Agregar clase"}</h2>

            <label>Nombre de la clase</label>
            <input id="nuevaClaseNombre" type="text" value="${escaparHTMLFitZone(clase ? clase.nombre : "")}" placeholder="Nombre de la clase">

            <label>Nivel</label>
            <input id="nuevaClaseNivel" type="text" value="${escaparHTMLFitZone(clase ? clase.nivel : "")}" placeholder="Nivel">

            <label>Duración</label>
            <input id="nuevaClaseDuracion" type="text" value="${escaparHTMLFitZone(clase ? clase.duracion : "")}" placeholder="Ej. 60 minutos">

            <label>Horario</label>
            <input id="nuevaClaseHorario" type="text" value="${escaparHTMLFitZone(clase ? clase.horario : "")}" placeholder="Horario">

            <label>Instructor</label>
            <input id="nuevaClaseInstructor" type="text" value="${escaparHTMLFitZone(clase ? clase.instructor : "")}" placeholder="Instructor">

            <label>Descripción</label>
            <textarea id="nuevaClaseDescripcion" placeholder="Descripción">${escaparHTMLFitZone(clase ? clase.descripcion : "")}</textarea>

            <label>Foto ${editar ? "(opcional, selecciona otra si quieres cambiarla)" : ""}</label>
            <input id="nuevaClaseFoto" type="file" accept="image/*">

            <div>
                <button id="guardarClase" type="button" class="boton-principal">
                    ${editar ? "Guardar cambios" : "Guardar clase"}
                </button>
                <button id="cerrarFormularioClase" type="button" class="boton-accion">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(formulario);

    document.getElementById("cerrarFormularioClase").addEventListener("click", function() {
        formulario.remove();
    });

    document.getElementById("guardarClase").addEventListener("click", function() {
        const nombre = document.getElementById("nuevaClaseNombre").value.trim();
        const nivel = document.getElementById("nuevaClaseNivel").value.trim();
        const duracion = document.getElementById("nuevaClaseDuracion").value.trim();
        const horario = document.getElementById("nuevaClaseHorario").value.trim();
        const instructor = document.getElementById("nuevaClaseInstructor").value.trim();
        const descripcion = document.getElementById("nuevaClaseDescripcion").value.trim();
        const archivo = document.getElementById("nuevaClaseFoto").files[0];

        if (!nombre || !nivel || !duracion || !horario || !instructor || !descripcion) {
            alert("Completa todos los campos.");
            return;
        }

        function guardarClaseConFoto(foto) {
            const clases = obtenerLista("clases");

            if (editar) {
                const indice = clases.findIndex(function (item) { return item.id === clase.id; });
                if (indice === -1) {
                    alert("No se encontró la clase que intentas editar.");
                    return;
                }

                clases[indice].nombre = nombre;
                clases[indice].nivel = nivel;
                clases[indice].duracion = duracion;
                clases[indice].horario = horario;
                clases[indice].instructor = instructor;
                clases[indice].descripcion = descripcion;

                if (foto) {
                    clases[indice].foto = foto;
                }
            } else {
                clases.push({
                    id: Date.now(),
                    nombre: nombre,
                    nivel: nivel,
                    duracion: duracion,
                    horario: horario,
                    instructor: instructor,
                    descripcion: descripcion,
                    foto: foto
                });
            }

            guardarLista("clases", clases);
            formulario.remove();
            mostrarClasesDashboard();
            alert(editar ? "Clase actualizada correctamente." : "Clase agregada correctamente.");
        }

        if (archivo) {
            const lector = new FileReader();
            lector.onload = function() {
                guardarClaseConFoto(lector.result);
            };
            lector.readAsDataURL(archivo);
        } else if (editar) {
            guardarClaseConFoto(clase.foto);
        } else {
            alert("Selecciona una foto.");
        }
    });
}

function mostrarClasesDashboard() {
    const contenedor = document.getElementById("listaClasesDashboard");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    obtenerLista("clases").forEach(function(clase) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-entrenador";

        tarjeta.innerHTML = `
            <img src="${normalizarRutaImagen(clase.foto)}" alt="${escaparHTMLFitZone(clase.nombre)}">
            <h3 class="nombre-entrenador">${escaparHTMLFitZone(clase.nombre)}</h3>
            <p><strong>Nivel:</strong> ${escaparHTMLFitZone(clase.nivel)}</p>
            <p><strong>Horario:</strong> ${escaparHTMLFitZone(clase.horario)}</p>
            <p><strong>Instructor:</strong> ${escaparHTMLFitZone(clase.instructor)}</p>
            <div class="acciones-gestion">
                <button type="button" class="boton-accion boton-editar-clase">Editar</button>
                <button type="button" class="boton-accion boton-eliminar-clase">Eliminar</button>
            </div>
        `;

        contenedor.appendChild(tarjeta);
        prepararBotonesClase(tarjeta, clase.id);
    });

    actualizarResumen();
}

function prepararBotonesClase(tarjeta, id) {
    tarjeta.querySelector(".boton-eliminar-clase").addEventListener("click", function() {
        const clases = obtenerLista("clases");
        const clase = clases.find(function(item) { return item.id === id; });

        if (clase && confirm("¿Eliminar la clase " + clase.nombre + "?")) {
            const nuevas = clases.filter(function(item) { return item.id !== id; });
            guardarLista("clases", nuevas);
            mostrarClasesDashboard();
        }
    });

    tarjeta.querySelector(".boton-editar-clase").addEventListener("click", function() {
        const clase = obtenerLista("clases").find(function(item) { return item.id === id; });
        if (clase) abrirFormularioClase(clase);
    });
}

if (tablaUsuarios && window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated()) {
    window.FitZoneRemoteCollections = window.FitZoneRemoteCollections || {};
    window.FitZoneAPI.getAdminCollection("clases").then(function(remotas) {
        window.FitZoneRemoteCollections.clases = true;
        if (Array.isArray(remotas)) {
            localStorage.setItem("clases", JSON.stringify(remotas));
        } else {
            const actuales = obtenerLista("clases");
            return window.FitZoneAPI.saveCollection("clases", actuales).then(function() {
                localStorage.setItem("clases", JSON.stringify(actuales));
            });
        }
    }).then(function() { mostrarClasesDashboard(); }).catch(function(error) {
        window.FitZoneRemoteCollections = window.FitZoneRemoteCollections || {};
        window.FitZoneRemoteCollections.clases = false;
        console.warn("No se pudieron sincronizar clases; se usa la copia local.", error.message);
        mostrarClasesDashboard();
    });
} else {
    mostrarClasesDashboard();
}

// ==============================
