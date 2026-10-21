// Acciones de sesión del Dashboard.
(function () {
    const salir = document.getElementById('cerrarAdmin');
    if (salir) {
        salir.addEventListener('click', function () {
            if (window.FitZoneAPI) window.FitZoneAPI.logout();
            else {
                sessionStorage.removeItem('fitzoneAdminToken');
                sessionStorage.removeItem('fitzoneAdmin');
            }
            window.location.href = '../index.html';
        });
    }

    if (window.FitZoneAPI && window.FitZoneAPI.isAdminAuthenticated()) {
        window.FitZoneAPI.verifySession().catch(function () {
            window.FitZoneAPI.logout();
            window.location.replace('admin.html');
        });
    }
})();
