// js/comunes/eventos.js - Versión actualizada
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización básica de eventos
    inicializarEventosBasicos();
});

function inicializarEventosBasicos() {
    // Navegación móvil (ya se hace en sistema.js, pero por si acaso)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu && !navToggle.hasAttribute('data-initialized')) {
        navToggle.setAttribute('data-initialized', 'true');
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar') && navMenu && navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
        }
    });
    
    // Marcar enlace activo
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}