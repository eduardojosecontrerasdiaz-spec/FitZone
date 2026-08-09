# Funcionalidades de FitZone

## 1. Navegación

FitZone cuenta con diferentes páginas relacionadas con los servicios del gimnasio.

El usuario puede navegar entre las diferentes secciones mediante los enlaces disponibles en la interfaz.

---

## 2. Planes de membresía

La página de planes presenta las diferentes opciones de membresía disponibles.

El usuario puede consultar información sobre cada plan y acceder al proceso de registro.

La página utiliza componentes de Bootstrap 5.

---

## 3. Registro

El sistema cuenta con un formulario de registro de membresía.

Se reciben datos del usuario y se realizan validaciones para evitar información incompleta o incorrecta.

---

## 4. Clases

FitZone permite consultar las clases disponibles.

El usuario puede acceder a información detallada de una clase seleccionada.

---

## 5. Entrenadores

La aplicación presenta información sobre los entrenadores.

Cada entrenador puede tener un perfil individual con información adicional.

---

## 6. Dashboard

El Dashboard funciona como un panel administrativo.

Desde esta sección se puede gestionar información relacionada con:

* Usuarios.
* Entrenadores.
* Clases.

---

## 7. CRUD

El proyecto implementa las cuatro operaciones básicas de un CRUD:

### Crear

Permite agregar nuevos registros.

### Consultar

Permite visualizar los registros almacenados.

### Editar

Permite modificar información existente.

### Eliminar

Permite eliminar registros.

Estas operaciones utilizan LocalStorage para conservar la información.

---

## 8. LocalStorage

LocalStorage se utiliza como mecanismo de almacenamiento local.

La aplicación puede guardar información en el navegador y recuperarla posteriormente.

Entre los datos gestionados se encuentran registros relacionados con usuarios, entrenadores y clases.

---

## 9. Buscador

El Dashboard incluye un buscador que permite filtrar los registros de usuarios de acuerdo con el texto ingresado.

---

## 10. Validaciones

El proyecto incluye validaciones para diferentes formularios.

Se controlan aspectos como:

* Campos obligatorios.
* Correos electrónicos.
* Contraseñas.
* Datos requeridos.

Los mensajes permiten informar al usuario cuando los datos ingresados no cumplen las condiciones necesarias.

---

## 11. Modo oscuro

FitZone cuenta con un modo oscuro que permite modificar la apariencia visual de la aplicación.

La preferencia del usuario puede conservarse mediante LocalStorage.

---

## 12. Contadores dinámicos

El Dashboard utiliza contadores para presentar un resumen de la información administrada.

---

## 13. Barra de progreso

El Dashboard incorpora una barra de progreso como parte de la interfaz administrativa.

---

## 14. API pública

FitZone consume la API pública JSONPlaceholder.

La información se obtiene mediante `fetch()` y se procesa mediante JavaScript para mostrarla dinámicamente en el Dashboard.

La consulta permite mostrar información de usuarios obtenida desde la API.

---

## 15. Bootstrap 5

Se utilizan diferentes componentes de Bootstrap 5 dentro del proyecto.

Entre ellos:

* Navbar.
* Cards.
* Carousel.
* Modal.
* Toast.
* Accordion.
* Offcanvas.
* Formularios.
* Botones.
* Sistema Grid.

---

## 16. Tailwind CSS

El Dashboard contiene una sección desarrollada con Tailwind CSS.

Esta sección utiliza las clases utilitarias de Tailwind para construir la interfaz.

---

## 17. Diseño Responsive

La aplicación está diseñada para adaptarse a diferentes tamaños de pantalla.

Se utilizan reglas CSS responsive para mejorar la visualización en:

* Computadores.
* Tablets.
* Teléfonos móviles.

---

## 18. Identidad visual

El proyecto utiliza una identidad visual propia basada en una combinación de colores y estilos orientados a la temática deportiva y de gimnasio.

Durante el desarrollo se realizó una segunda etapa de rediseño visual para mejorar:

* Paleta de colores.
* Hero.
* Espaciado.
* Jerarquía visual.
* Tarjetas.
* Botones.
* Formularios.
* Dashboard.
* Footer.
* Diseño responsive.