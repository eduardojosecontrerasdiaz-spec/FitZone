// api.js
// Consulta una API pública y muestra los datos en tarjetas compactas.

function cargarUsuariosApi() {
    fetch("https://jsonplaceholder.typicode.com/users")
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo consultar la API");
            }
            return respuesta.json();
        })
        .then(function(usuarios) {
            const contenedor = document.getElementById("listaUsuariosApi");

            if (!contenedor) {
                return;
            }

            contenedor.innerHTML = "";

            usuarios.slice(0, 6).forEach(function(usuario) {
                const tarjeta = document.createElement("article");
                tarjeta.className = "tarjeta-api-usuario";
                tarjeta.innerHTML = `
                    <div class="avatar-api">${usuario.name.charAt(0)}</div>
                    <div class="datos-api">
                        <h3>${usuario.name}</h3>
                        <p>${usuario.email}</p>
                        <span>${usuario.company.name}</span>
                    </div>
                `;
                contenedor.appendChild(tarjeta);
            });
        })
        .catch(function(error) {
            const contenedor = document.getElementById("listaUsuariosApi");

            if (contenedor) {
                contenedor.innerHTML = '<p class="mensaje-api-error">No se pudieron cargar los usuarios de la API.</p>';
            }

            console.log("No se pudo consultar la API:", error);
        });
}

cargarUsuariosApi();
