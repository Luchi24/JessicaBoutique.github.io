// Manejo de eventos globales
document.addEventListener('DOMContentLoaded', function() {
    // Navegación móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar') && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });
    }
    
    // Actualizar enlaces activos
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', mostrarTooltip);
        el.addEventListener('mouseleave', ocultarTooltip);
    });
});

function mostrarTooltip(e) {
    const target = e.target;
    const texto = target.getAttribute('title');
    
    if (!texto) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = texto;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = target.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
    
    target._tooltip = tooltip;
}

function ocultarTooltip(e) {
    const target = e.target;
    if (target._tooltip) {
        target._tooltip.remove();
        delete target._tooltip;
    }
}