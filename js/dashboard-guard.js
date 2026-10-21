// Evita mostrar el panel a sesiones sin token. La API verifica el token en cada operación.
if (!sessionStorage.getItem('fitzoneAdminToken')) {
    window.location.replace('admin.html');
}
