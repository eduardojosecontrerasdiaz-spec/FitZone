/* CRUD de Servicios FitZone. Usa LocalStorage para sincronizar Dashboard e Inicio. */
(function () {
    const CLAVE = "servicios";
    const SERVICIOS_INICIALES = [
        {
            id: 1,
            titulo: "Zona de Pesas",
            descripcion: "Equipamiento completo para hipertrofia y trabajo de fuerza libre.",
            detalle: "Entrenamiento de fuerza con pesas libres y máquinas para desarrollar fuerza, hipertrofia y técnica segura.",
            foto: "sinss.png"
        },
        {
            id: 2,
            titulo: "Cardio & Resistencia",
            descripcion: "Cintas, caminadoras y bicicletas de última generación.",
            detalle: "Trabajo cardiovascular progresivo con caminadoras, bicicletas y rutinas diseñadas para mejorar resistencia y rendimiento.",
            foto: "Spinning.png"
        },
        {
            id: 3,
            titulo: "Clases Grupales",
            descripcion: "Spinning, Yoga, Pilates y CrossFit dirigidos por profesionales.",
            detalle: "Sesiones dirigidas para entrenar acompañado, mantener la motivación y trabajar diferentes capacidades físicas.",
            foto: "yoga.png"
        },
        {
            id: 4,
            titulo: "Asesoría Personal",
            descripcion: "Planes y rutinas adaptadas 100% a tus necesidades específicas.",
            detalle: "Acompañamiento individual con objetivos, rutinas y recomendaciones adaptadas al progreso de cada persona.",
            foto: "crossFit.png"
        }
    ];

    function obtenerServicios() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE));
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            return [];
        }
    }

    function guardarServicios(servicios) {
        localStorage.setItem(CLAVE, JSON.stringify(servicios));
    }

    function inicializarServicios() {
        const actuales = obtenerServicios();
        if (actuales.length === 0) {
            guardarServicios(SERVICIOS_INICIALES);
            return SERVICIOS_INICIALES.slice();
        }
        return actuales;
    }

    function rutaFoto(foto, esDashboard) {
        if (!foto) return (esDashboard ? "../" : "") + "assets/images/crossFit.png";
        if (foto.startsWith("data:") || foto.startsWith("http://") || foto.startsWith("https://")) return foto;
        if (foto.startsWith("../") || foto.startsWith("assets/")) return esDashboard ? (foto.startsWith("assets/") ? "../" + foto : foto) : foto.replace(/^\.\.\//, "");
        return (esDashboard ? "../" : "") + "assets/images/" + foto;
    }

    function escapar(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderizarInicio() {
        const carrusel = document.querySelector(".servicios-carrusel");
        if (!carrusel) return;

        const servicios = inicializarServicios();
        carrusel.innerHTML = "";

        servicios.forEach(function (servicio) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-servicio";
            tarjeta.tabIndex = 0;
            tarjeta.dataset.titulo = servicio.titulo;
            tarjeta.dataset.descripcion = servicio.detalle || servicio.descripcion;
            tarjeta.innerHTML = `
                <img src="${rutaFoto(servicio.foto, false)}" alt="${escapar(servicio.titulo)}" class="imagen-tarjeta">
                <h3 class="titulo-tarjeta">${escapar(servicio.titulo)}</h3>
                <p class="texto-tarjeta">${escapar(servicio.descripcion)}</p>
            `;
            carrusel.appendChild(tarjeta);
        });
    }

    function renderizarDashboard() {
        const contenedor = document.getElementById("listaServiciosDashboard");
        if (!contenedor) return;

        const servicios = inicializarServicios();
        contenedor.innerHTML = "";

        if (servicios.length === 0) {
            contenedor.innerHTML = '<article class="tarjeta-vacio"><h3>No hay servicios registrados</h3><p>Agrega el primer servicio para mostrarlo en Inicio.</p></article>';
            return;
        }

        servicios.forEach(function (servicio) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-servicio";
            tarjeta.innerHTML = `
                <img src="${rutaFoto(servicio.foto, true)}" alt="${escapar(servicio.titulo)}" class="imagen-tarjeta">
                <h3 class="titulo-tarjeta">${escapar(servicio.titulo)}</h3>
                <p class="texto-tarjeta">${escapar(servicio.descripcion)}</p>
                <p class="texto-tarjeta"><strong>Detalle:</strong> ${escapar(servicio.detalle)}</p>
                <div class="acciones-gestion">
                    <button type="button" class="boton-accion boton-editar-servicio">Editar</button>
                    <button type="button" class="boton-accion boton-eliminar-servicio">Eliminar</button>
                </div>
            `;
            contenedor.appendChild(tarjeta);

            tarjeta.querySelector(".boton-editar-servicio").addEventListener("click", function () {
                abrirFormularioServicio(servicio);
            });
            tarjeta.querySelector(".boton-eliminar-servicio").addEventListener("click", function () {
                if (!confirm("¿Eliminar el servicio " + servicio.titulo + "?")) return;
                const restantes = obtenerServicios().filter(function (item) { return item.id !== servicio.id; });
                guardarServicios(restantes);
                renderizarDashboard();
            });
        });
    }

    function abrirFormularioServicio(servicio) {
        const editar = !!servicio;
        const existente = document.getElementById("formularioServicio");
        if (existente) existente.remove();

        const formulario = document.createElement("div");
        formulario.id = "formularioServicio";
        formulario.className = "formulario-entrenador-dashboard";
        formulario.innerHTML = `
            <div class="formulario-entrenador-caja">
                <h2>${editar ? "Editar servicio" : "Agregar servicio"}</h2>
                <label>Nombre del servicio</label>
                <input id="servicioTitulo" type="text" value="${escapar(editar ? servicio.titulo : "")}" placeholder="Ej. Zona de Pesas">
                <label>Descripción corta</label>
                <textarea id="servicioDescripcion" placeholder="Descripción que aparecerá en Inicio">${escapar(editar ? servicio.descripcion : "")}</textarea>
                <label>Información del servicio</label>
                <textarea id="servicioDetalle" placeholder="Explica qué ofrece este servicio">${escapar(editar ? servicio.detalle : "")}</textarea>
                <label>Fotografía ${editar ? "(opcional para conservar la actual)" : ""}</label>
                <input id="servicioFoto" type="file" accept="image/*">
                <div>
                    <button id="guardarServicio" type="button" class="boton-principal">${editar ? "Guardar cambios" : "Agregar servicio"}</button>
                    <button id="cerrarFormularioServicio" type="button" class="boton-accion">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(formulario);

        document.getElementById("cerrarFormularioServicio").addEventListener("click", function () {
            formulario.remove();
        });

        document.getElementById("guardarServicio").addEventListener("click", function () {
            const titulo = document.getElementById("servicioTitulo").value.trim();
            const descripcion = document.getElementById("servicioDescripcion").value.trim();
            const detalle = document.getElementById("servicioDetalle").value.trim();
            const archivo = document.getElementById("servicioFoto").files[0];

            if (!titulo || !descripcion || !detalle) {
                alert("Completa el nombre, la descripción y la información del servicio.");
                return;
            }

            function guardar(foto) {
                const servicios = obtenerServicios();
                if (editar) {
                    servicio.titulo = titulo;
                    servicio.descripcion = descripcion;
                    servicio.detalle = detalle;
                    if (foto) servicio.foto = foto;
                } else {
                    servicios.push({ id: Date.now(), titulo, descripcion, detalle, foto: foto || "crossFit.png" });
                }
                guardarServicios(servicios);
                formulario.remove();
                renderizarDashboard();
                alert(editar ? "Servicio actualizado correctamente." : "Servicio agregado correctamente.");
            }

            if (archivo) {
                const lector = new FileReader();
                lector.onload = function () { guardar(lector.result); };
                lector.readAsDataURL(archivo);
            } else if (editar) {
                guardar(servicio.foto);
            } else {
                guardar("crossFit.png");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector(".servicios-carrusel")) renderizarInicio();
        if (document.getElementById("listaServiciosDashboard")) {
            renderizarDashboard();
            const boton = document.getElementById("botonAgregarServicio");
            if (boton) boton.addEventListener("click", function () { abrirFormularioServicio(); });
        }
    });
})();
