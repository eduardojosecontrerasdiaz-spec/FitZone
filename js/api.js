// api.js
// Consulta una API pública y muestra los datos en la página.

function cargarUsuariosApi() {
    fetch("https://jsonplaceholder.typicode.com/users")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(usuarios) {
            const contenedor = document.getElementById("listaUsuariosApi");

            if (!contenedor) {
                return;
            }

            contenedor.innerHTML = "";

            usuarios.slice(0, 6).forEach(function(usuario) {
                const tarjeta = document.createElement("div");
                tarjeta.className = "bg-white p-4 rounded-xl shadow";

                tarjeta.innerHTML = `
                    <h3 class="font-bold text-blue-900">${usuario.name}</h3>
                    <p class="text-gray-600">${usuario.email}</p>
                    <p class="text-gray-500">${usuario.company.name}</p>
                `;

                contenedor.appendChild(tarjeta);
            });
        })
        .catch(function(error) {
            const contenedor = document.getElementById("listaUsuariosApi");

            if (contenedor) {
                contenedor.innerHTML = "<p class='text-red-600'>No se pudieron cargar los datos.</p>";
            }

            console.log("No se pudo consultar la API:", error);
        });
}

cargarUsuariosApi();
