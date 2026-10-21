// ENTRENADORES
// ==============================

if (botonAgregarEntrenadorPrincipal) {
    botonAgregarEntrenadorPrincipal.addEventListener("click", function() {
        abrirFormularioEntrenador();
    });
}

function abrirFormularioEntrenador(entrenador, alGuardar) {
    cerrarFormulario("formularioEntrenador");

    const editar = !!entrenador;
    const formulario = document.createElement("div");
    formulario.id = "formularioEntrenador";
    formulario.className = "formulario-entrenador-dashboard";

    formulario.innerHTML = `
        <div class="formulario-entrenador-caja">
            <h2>${editar ? "Editar entrenador" : "Agregar entrenador"}</h2>

            <label>Nombre completo</label>
            <input id="nuevoEntrenadorNombre" type="text" value="${escaparHTMLFitZone(entrenador ? entrenador.nombre : "")}" placeholder="Nombre completo">

            <label>Especialidad</label>
            <input id="nuevoEntrenadorEspecialidad" type="text" value="${escaparHTMLFitZone(entrenador ? entrenador.especialidad : "")}" placeholder="Especialidad">

            <label>Experiencia</label>
            <input id="nuevoEntrenadorExperiencia" type="text" value="${escaparHTMLFitZone(entrenador ? entrenador.experiencia : "")}" placeholder="Experiencia">

            <label>Descripción</label>
            <textarea id="nuevoEntrenadorDescripcion" placeholder="Descripción">${escaparHTMLFitZone(entrenador ? entrenador.descripcion : "")}</textarea>

            <label>Foto ${editar ? "(opcional, selecciona otra si quieres cambiarla)" : ""}</label>
            <input id="nuevoEntrenadorFoto" type="file" accept="image/*">

            <div>
                <button id="guardarEntrenador" type="button" class="boton-principal">
                    ${editar ? "Guardar cambios" : "Guardar entrenador"}
                </button>
                <button id="cerrarFormularioEntrenador" type="button" class="boton-accion">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(formulario);

    document.getElementById("cerrarFormularioEntrenador").addEventListener("click", function() {
        formulario.remove();
    });

    document.getElementById("guardarEntrenador").addEventListener("click", function() {
        const nombre = document.getElementById("nuevoEntrenadorNombre").value.trim();
        const especialidad = document.getElementById("nuevoEntrenadorEspecialidad").value.trim();
        const experiencia = document.getElementById("nuevoEntrenadorExperiencia").value.trim();
        const descripcion = document.getElementById("nuevoEntrenadorDescripcion").value.trim();
        const archivo = document.getElementById("nuevoEntrenadorFoto").files[0];

        if (!nombre || !especialidad || !experiencia || !descripcion) {
            alert("Completa todos los campos.");
            return;
        }

        function guardarEntrenadorConFoto(foto) {
            const entrenadores = obtenerLista("entrenadores");

            if (editar) {
                const indice = entrenadores.findIndex(function (item) { return item.id === entrenador.id; });
                if (indice === -1) {
                    alert("No se encontró el entrenador que intentas editar.");
                    return;
                }

                entrenadores[indice].nombre = nombre;
                entrenadores[indice].especialidad = especialidad;
                entrenadores[indice].experiencia = experiencia;
                entrenadores[indice].descripcion = descripcion;

                if (foto) {
                    entrenadores[indice].foto = foto;
                }
            } else {
                entrenadores.push({
                    id: Date.now(),
                    nombre: nombre,
                    especialidad: especialidad,
                    experiencia: experiencia,
                    descripcion: descripcion,
                    foto: foto
                });
            }

            guardarLista("entrenadores", entrenadores);
            formulario.remove();
            mostrarEntrenadoresDashboard();
            alert(editar ? "Entrenador actualizado correctamente." : "Entrenador agregado correctamente.");
        }

        if (archivo) {
            const lector = new FileReader();
            lector.onload = function() {
                guardarEntrenadorConFoto(lector.result);
            };
            lector.readAsDataURL(archivo);
        } else if (editar) {
            guardarEntrenadorConFoto(entrenador.foto);
        } else {
            alert("Selecciona una foto.");
        }
    });
}

function cargarEntrenadoresIniciales() {
    const entrenadores = obtenerLista("entrenadores");

    if (entrenadores.length === 0 && obtenerDato("entrenadoresInicializados") !== "si") {
        const iniciales = [
            {
                id: 1,
                nombre: "Carlos Gómez",
                especialidad: "Especialista en Musculación",
                experiencia: "6 años",
                descripcion: "Enfocado en hipertrofia muscular, fuerza máxima y biomecánica aplicada al entrenamiento libre.",
                foto: "../assets/images/carlos.png"
            },
            {
                id: 2,
                nombre: "Ana Martínez",
                especialidad: "Instructora de Yoga y Pilates",
                experiencia: "8 años",
                descripcion: "Experta en movilidad articular, corrección postural y control respiratorio para mejorar el bienestar integral.",
                foto: "../assets/images/ana.png"
            },
            {
                id: 3,
                nombre: "David Silva",
                especialidad: "Coach de CrossFit y Cardio",
                experiencia: "5 años",
                descripcion: "Especializado en acondicionamiento metabólico, entrenamientos de alta intensidad (HIIT) y resistencia.",
                foto: "../assets/images/david.png"
            },
            {
                id: 4,
                nombre: "Elena Ríos",
                especialidad: "Nutrición y Readaptación",
                experiencia: "7 años",
                descripcion: "Apasionada por la readaptación funcional tras lesiones y la optimización del rendimiento mediante hábitos saludables.",
                foto: "../assets/images/elena.png"
            }
        ];

        guardarLista("entrenadores", iniciales);
        guardarDato("entrenadoresInicializados", "si");
    }
}

function mostrarEntrenadoresDashboard() {
    const contenedor = document.getElementById("listaEntrenadoresDashboard");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    obtenerLista("entrenadores").forEach(function(entrenador) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-entrenador";

        tarjeta.innerHTML = `
            <img src="${normalizarRutaImagen(entrenador.foto)}" alt="${escaparHTMLFitZone(entrenador.nombre)}">
            <h3 class="nombre-entrenador">${escaparHTMLFitZone(entrenador.nombre)}</h3>
            <p class="especialidad-entrenador">${escaparHTMLFitZone(entrenador.especialidad)}</p>
            <p><strong>Experiencia:</strong> ${escaparHTMLFitZone(entrenador.experiencia)}</p>
            <p class="texto-tarjeta">${escaparHTMLFitZone(entrenador.descripcion)}</p>
            <div class="acciones-gestion">
                <button type="button" class="boton-accion boton-editar-entrenador">Editar</button>
                <button type="button" class="boton-accion boton-eliminar-entrenador">Eliminar</button>
            </div>
        `;

        contenedor.appendChild(tarjeta);
        prepararBotonesEntrenador(tarjeta, entrenador.id);
    });

    actualizarResumen();
}

function prepararBotonesEntrenador(tarjeta, id) {
    tarjeta.querySelector(".boton-eliminar-entrenador").addEventListener("click", function() {
        const entrenadores = obtenerLista("entrenadores");
        const entrenador = entrenadores.find(function(item) { return item.id === id; });

        if (entrenador && confirm("¿Eliminar a " + entrenador.nombre + "?")) {
            const nuevos = entrenadores.filter(function(item) { return item.id !== id; });
            guardarLista("entrenadores", nuevos);
            mostrarEntrenadoresDashboard();
        }
    });

    tarjeta.querySelector(".boton-editar-entrenador").addEventListener("click", function() {
        const entrenador = obtenerLista("entrenadores").find(function(item) { return item.id === id; });
        if (entrenador) abrirFormularioEntrenador(entrenador);
    });
}

if (tablaUsuarios) {
    const iniciarEntrenadoresDashboard = function() {
        cargarEntrenadoresIniciales();
        mostrarEntrenadoresDashboard();
    };
    if (window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated()) {
        window.FitZoneRemoteCollections = window.FitZoneRemoteCollections || {};
        window.FitZoneAPI.getAdminCollection("entrenadores").then(function(remotos) {
            window.FitZoneRemoteCollections.entrenadores = true;
            if (Array.isArray(remotos)) {
                localStorage.setItem("entrenadores", JSON.stringify(remotos));
                localStorage.setItem("entrenadoresInicializados", "si");
            } else {
                iniciarEntrenadoresDashboard();
                const actuales = obtenerLista("entrenadores");
                return window.FitZoneAPI.saveCollection("entrenadores", actuales).then(function() { mostrarEntrenadoresDashboard(); });
            }
            mostrarEntrenadoresDashboard();
        }).catch(function(error) {
            window.FitZoneRemoteCollections = window.FitZoneRemoteCollections || {};
            window.FitZoneRemoteCollections.entrenadores = false;
            console.warn("No se pudieron cargar entrenadores del servidor; se usa la copia local.", error.message);
            iniciarEntrenadoresDashboard();
        });
    } else {
        iniciarEntrenadoresDashboard();
    }
}

// ==============================
