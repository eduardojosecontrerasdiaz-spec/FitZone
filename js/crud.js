// crud.js
// Gestión sencilla de usuarios, entrenadores y clases.

const tablaUsuarios = document.querySelector(".tabla-admin tbody");
const buscador = document.querySelector(".campo-texto");
const botonAgregarUsuario = document.getElementById("botonAgregarUsuario");
const botonAgregarEntrenadorPrincipal = document.getElementById("botonAgregarEntrenadorPrincipal");
const botonAgregarClasePrincipal = document.getElementById("botonAgregarClasePrincipal");

// ==============================
// USUARIOS
// ==============================

function guardarUsuarios() {
    const filas = document.querySelectorAll(".tabla-admin tbody tr");
    const usuarios = [];

    filas.forEach(function(fila) {
        const celdas = fila.querySelectorAll("td");

        if (celdas.length >= 4) {
            usuarios.push({
                nombre: celdas[0].textContent.trim(),
                correo: celdas[1].textContent.trim(),
                plan: celdas[2].textContent.trim(),
                estado: celdas[3].textContent.trim()
            });
        }
    });

    guardarLista("usuarios", usuarios);
}

function agregarFilaUsuario(usuario) {
    const fila = document.createElement("tr");
    const claseEstado = usuario.estado === "Activo" ? "insignia-activo" : "insignia-inactivo";

    fila.innerHTML = `
        <td>${usuario.nombre}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.plan}</td>
        <td><span class="insignia ${claseEstado}">${usuario.estado}</span></td>
        <td>
            <button type="button" class="boton-accion boton-editar">Editar</button>
            <button type="button" class="boton-accion boton-eliminar">Eliminar</button>
        </td>
    `;

    tablaUsuarios.appendChild(fila);
    prepararBotonesUsuario(fila);
    actualizarResumen();
}

function prepararBotonesUsuario(fila) {
    fila.querySelector(".boton-eliminar").addEventListener("click", function() {
        const nombre = fila.cells[0].textContent;

        if (confirm("¿Seguro que quieres eliminar a " + nombre + "?")) {
            fila.remove();
            guardarUsuarios();
        }
    });

    fila.querySelector(".boton-editar").addEventListener("click", function() {
        abrirFormularioUsuario("editar", {
            nombre: fila.cells[0].textContent,
            correo: fila.cells[1].textContent,
            plan: fila.cells[2].textContent,
            estado: fila.cells[3].textContent.trim()
        }, function(usuario) {
            fila.cells[0].textContent = usuario.nombre;
            fila.cells[1].textContent = usuario.correo;
            fila.cells[2].textContent = usuario.plan;

            const insignia = fila.cells[3].querySelector("span");
            insignia.textContent = usuario.estado;
            insignia.className = usuario.estado === "Activo"
                ? "insignia insignia-activo"
                : "insignia insignia-inactivo";

            guardarUsuarios();
            actualizarResumen();
        });
    });
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
            <input id="usuarioNombre" type="text" value="${usuario.nombre || ""}" placeholder="Nombre completo">

            <label>Correo</label>
            <input id="usuarioCorreo" type="email" value="${usuario.correo || ""}" placeholder="Correo electrónico">

            <label>Plan</label>
            <select id="usuarioPlan">
                <option ${usuario.plan === "Básico" ? "selected" : ""}>Básico</option>
                <option ${usuario.plan === "Premium" ? "selected" : ""}>Premium</option>
                <option ${usuario.plan === "Profesional" ? "selected" : ""}>Profesional</option>
            </select>

            <label>Estado</label>
            <select id="usuarioEstado">
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

if (tablaUsuarios) {
    const usuariosGuardados = obtenerLista("usuarios");

    if (usuariosGuardados.length === 0) {
        document.querySelectorAll(".tabla-admin tbody tr").forEach(function(fila) {
            prepararBotonesUsuario(fila);
        });
        guardarUsuarios();
    } else {
        tablaUsuarios.innerHTML = "";
        usuariosGuardados.forEach(function(usuario) {
            agregarFilaUsuario(usuario);
        });
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
            <input id="nuevoEntrenadorNombre" type="text" value="${entrenador ? entrenador.nombre : ""}" placeholder="Nombre completo">

            <label>Especialidad</label>
            <input id="nuevoEntrenadorEspecialidad" type="text" value="${entrenador ? entrenador.especialidad : ""}" placeholder="Especialidad">

            <label>Experiencia</label>
            <input id="nuevoEntrenadorExperiencia" type="text" value="${entrenador ? entrenador.experiencia : ""}" placeholder="Experiencia">

            <label>Descripción</label>
            <textarea id="nuevoEntrenadorDescripcion" placeholder="Descripción">${entrenador ? entrenador.descripcion : ""}</textarea>

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
                entrenador.nombre = nombre;
                entrenador.especialidad = especialidad;
                entrenador.experiencia = experiencia;
                entrenador.descripcion = descripcion;

                if (foto) {
                    entrenador.foto = foto;
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
                foto: "../assets/images/Elena.png"
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
            <img src="${entrenador.foto}" alt="${entrenador.nombre}">
            <h3 class="nombre-entrenador">${entrenador.nombre}</h3>
            <p class="especialidad-entrenador">${entrenador.especialidad}</p>
            <p><strong>Experiencia:</strong> ${entrenador.experiencia}</p>
            <p class="texto-tarjeta">${entrenador.descripcion}</p>
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
    cargarEntrenadoresIniciales();
    mostrarEntrenadoresDashboard();
}

// ==============================
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
    formulario.className = "formulario-entrenador-dashboard";

    formulario.innerHTML = `
        <div class="formulario-entrenador-caja">
            <h2>${editar ? "Editar clase" : "Agregar clase"}</h2>

            <label>Nombre de la clase</label>
            <input id="nuevaClaseNombre" type="text" value="${clase ? clase.nombre : ""}" placeholder="Nombre de la clase">

            <label>Nivel</label>
            <input id="nuevaClaseNivel" type="text" value="${clase ? clase.nivel : ""}" placeholder="Nivel">

            <label>Duración</label>
            <input id="nuevaClaseDuracion" type="text" value="${clase ? clase.duracion : ""}" placeholder="Ej. 60 minutos">

            <label>Horario</label>
            <input id="nuevaClaseHorario" type="text" value="${clase ? clase.horario : ""}" placeholder="Horario">

            <label>Instructor</label>
            <input id="nuevaClaseInstructor" type="text" value="${clase ? clase.instructor : ""}" placeholder="Instructor">

            <label>Descripción</label>
            <textarea id="nuevaClaseDescripcion" placeholder="Descripción">${clase ? clase.descripcion : ""}</textarea>

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
                clase.nombre = nombre;
                clase.nivel = nivel;
                clase.duracion = duracion;
                clase.horario = horario;
                clase.instructor = instructor;
                clase.descripcion = descripcion;

                if (foto) {
                    clase.foto = foto;
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
            <img src="${clase.foto}" alt="${clase.nombre}">
            <h3 class="nombre-entrenador">${clase.nombre}</h3>
            <p><strong>Nivel:</strong> ${clase.nivel}</p>
            <p><strong>Horario:</strong> ${clase.horario}</p>
            <p><strong>Instructor:</strong> ${clase.instructor}</p>
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

mostrarClasesDashboard();

// ==============================
// CERRAR FORMULARIOS
// ==============================

function cerrarFormulario(id) {
    const formulario = document.getElementById(id);

    if (formulario) {
        formulario.remove();
    }
}

// ==============================
// CONTADORES Y PROGRESO
// ==============================

function actualizarResumen() {
    const usuarios = obtenerLista("usuarios");
    const entrenadores = obtenerLista("entrenadores");
    const clasesNuevas = obtenerLista("clases");

    const contadorUsuarios = document.getElementById("contadorUsuarios");
    const contadorPlanes = document.getElementById("contadorPlanes");
    const contadorClases = document.getElementById("contadorClases");
    const contadorEntrenadores = document.getElementById("contadorEntrenadores");
    const barraProgreso = document.getElementById("barraProgreso");
    const textoProgreso = document.getElementById("textoProgreso");

    const usuariosActivos = usuarios.filter(function(usuario) {
        return usuario.estado === "Activo";
    }).length;

    if (contadorUsuarios) contadorUsuarios.textContent = usuarios.length;
    if (contadorPlanes) contadorPlanes.textContent = usuariosActivos;
    if (contadorClases) contadorClases.textContent = 3 + clasesNuevas.length;
    if (contadorEntrenadores) contadorEntrenadores.textContent = entrenadores.length;

    if (barraProgreso && textoProgreso) {
        const porcentaje = Math.min((usuariosActivos / 300) * 100, 100);
        barraProgreso.style.width = porcentaje + "%";
        textoProgreso.textContent = Math.round(porcentaje) + "% de la meta de 300 usuarios activos";
    }
}

actualizarResumen();
