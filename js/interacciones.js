// Interacciones sencillas de FitZone V2.
document.addEventListener("DOMContentLoaded", function () {
    // Submenús: aparecen al pasar el mouse y también con teclado.
    const ruta = window.location.pathname;
    const esInicio = ruta.endsWith("/index.html") || ruta.endsWith("/");
    const prefijo = esInicio ? "" : "";
    const menus = {
        "Inicio": esInicio ? [
            ["Servicios", "#servicios"], ["Planes", "#planes"], ["Entrenadores", "#entrenadores"], ["Opiniones", "#valoraciones"]
        ] : [["Ir a Inicio", "../index.html"], ["Servicios", "../index.html#servicios"], ["Planes", "../index.html#planes"]],
        "Planes": [["Planes", "#planes-lista"], ["Conoce FitZone", "#conoce-fitzone"], ["Preguntas frecuentes", "#faq"]],
        "Entrenadores": [["Equipo", "#equipo"], ["Certificaciones", "#certificaciones"], ["Filosofía", "#filosofia"]],
        "Clases": [["Clases disponibles", "#clases-disponibles"], ["Nuevas clases", "#nuevas-clases"]],
        "Contacto": [["Información", "#informacion"], ["Ubicación", "#ubicacion"], ["Preguntas frecuentes", "#preguntas"]],
        "Dashboard": [["Resumen", "#resumen"], ["API pública", "#api"], ["Usuarios", "#usuarios"], ["Entrenadores", "#entrenadores-admin"], ["Clases", "#clases-admin"]]
    };

    document.querySelectorAll(".nav-link").forEach(function (enlace) {
        const texto = enlace.textContent.trim();
        const item = enlace.parentElement;
        const datos = menus[texto];
        if (!item || !datos || item.querySelector(".nav-ayuda")) return;
        const ayuda = document.createElement("div");
        ayuda.className = "nav-ayuda";
        datos.forEach(function (dato) {
            const a = document.createElement("a");
            a.href = dato[1];
            a.textContent = dato[0];
            a.className = "nav-ayuda-link";
            ayuda.appendChild(a);
        });
        item.classList.add("nav-item-con-ayuda");
        item.appendChild(ayuda);
    });

    // Carrusel de servicios.
    const carrusel = document.querySelector(".servicios-carrusel");
    const anterior = document.getElementById("servicioAnterior");
    const siguiente = document.getElementById("servicioSiguiente");
    if (carrusel) {
        if (anterior) anterior.addEventListener("click", function(){ carrusel.scrollBy({left:-340, behavior:"smooth"}); });
        if (siguiente) siguiente.addEventListener("click", function(){ carrusel.scrollBy({left:340, behavior:"smooth"}); });
    }

    // Detalle de servicio.
    const modal = document.getElementById("modalServicio");
    if (modal) {
        const titulo = document.getElementById("modalServicioTitulo");
        const texto = document.getElementById("modalServicioTexto");
        document.querySelectorAll(".tarjeta-servicio").forEach(function (tarjeta) {
            tarjeta.setAttribute("tabindex", "0");
            function abrir(){
                titulo.textContent = tarjeta.dataset.titulo || "Servicio FitZone";
                texto.textContent = tarjeta.dataset.descripcion || "Conoce este servicio de FitZone.";
                modal.classList.add("abierto"); document.body.style.overflow = "hidden";
            }
            tarjeta.addEventListener("click", abrir);
            tarjeta.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){e.preventDefault();abrir();} });
        });
        function cerrar(){modal.classList.remove("abierto");document.body.style.overflow="";}
        document.querySelectorAll("[data-cerrar-modal]").forEach(function(b){b.addEventListener("click",cerrar);});
        modal.addEventListener("click",function(e){if(e.target===modal)cerrar();});
        document.addEventListener("keydown",function(e){if(e.key==="Escape")cerrar();});
    }

    // Aparición suave de secciones.
    document.querySelectorAll("main section").forEach(function(section){section.classList.add("reveal");});

    // Valoraciones de entrenadores.
    const lista = document.getElementById("listaValoraciones");
    const boton = document.getElementById("botonValoracion");
    if (lista && boton) {
        const iniciales = [
            {nombre:"Ervin Howell",correo:"Shanna@melissa.tv",entrenador:"Carlos Gómez",estrellas:5,comentario:"El acompañamiento fue excelente y ahora entreno con mucha más disciplina."},
            {nombre:"Deckow-Crist",correo:"cristina@fitzone.local",entrenador:"Elena Ríos",estrellas:5,comentario:"Me explicó cada ejercicio con paciencia y me ayudó a mejorar mi técnica."},
            {nombre:"Clementina DuBuque",correo:"clementina@fitzone.local",entrenador:"David Silva",estrellas:4,comentario:"Las rutinas son dinámicas y se nota el seguimiento durante las clases."}
        ];
        function obtener(){
            try{return JSON.parse(localStorage.getItem("fitzoneValoraciones")) || iniciales;}catch(e){return iniciales;}
        }
        function pintar(){
            const datos=obtener(); lista.innerHTML="";
            datos.forEach(function(v){
                const card=document.createElement("article"); card.className="tarjeta-testimonio";
                card.innerHTML='<div class="estrellas-valoracion">'+"★".repeat(Number(v.estrellas))+"☆".repeat(5-Number(v.estrellas))+"</div>"+
                    '<p class="comentario-testimonio">"'+v.comentario+'"</p>'+
                    '<h3 class="usuario-testimonio">'+v.nombre+'</h3>'+
                    '<p class="texto-tarjeta">'+v.correo+' · Valoró a <strong>'+v.entrenador+'</strong></p>';
                lista.appendChild(card);
            });
        }
        pintar();
        boton.addEventListener("click",function(){
            const nombre=document.getElementById("valoracionNombre").value.trim();
            const entrenador=document.getElementById("valoracionEntrenador").value;
            const estrellas=document.getElementById("valoracionEstrellas").value;
            const comentario=document.getElementById("valoracionComentario").value.trim();
            const mensaje=document.getElementById("mensajeValoracion");
            if(!nombre || !comentario){mensaje.textContent="Completa tu nombre y comentario.";return;}
            const datos=obtener(); datos.unshift({nombre:nombre,correo:"Miembro FitZone",entrenador:entrenador,estrellas:Number(estrellas),comentario:comentario});
            localStorage.setItem("fitzoneValoraciones",JSON.stringify(datos));
            pintar(); mensaje.textContent="✓ Valoración publicada correctamente.";
            document.getElementById("valoracionNombre").value="";document.getElementById("valoracionComentario").value="";
        });
    }
});
