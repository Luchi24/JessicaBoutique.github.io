// Manejo de eventos globales - Jessica Boutique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Jessica Boutique - Eventos globales inicializados');
    
    // Navegación móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('show');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar') && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });
        
        // Prevenir que el menú se cierre al hacer clic dentro
        navMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Actualizar enlaces activos
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        // Remover clase active de todos
        link.classList.remove('active');
        
        // Agregar clase active al enlace correspondiente
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === '' && href === 'index.html') {
            link.classList.add('active');
        }
    });
    
    // Inicializar tooltips básicos
    inicializarTooltips();
    
    // Inicializar modales básicos
    inicializarModales();
});

function inicializarTooltips() {
    const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('title') || this.getAttribute('data-tooltip');
            if (tooltipText) {
                // Crear tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-custom';
                tooltip.textContent = tooltipText;
                tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 1000;
                    white-space: nowrap;
                    pointer-events: none;
                `;
                
                document.body.appendChild(tooltip);
                
                // Posicionar tooltip
                const rect = this.getBoundingClientRect();
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
                tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
                
                // Guardar referencia para eliminarlo
                this._tooltip = tooltip;
            }
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
}

function inicializarModales() {
    // Cerrar modales con botón close
    document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modales haciendo clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Abrir modales con atributos data-target
    document.querySelectorAll('[data-toggle="modal"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const modal = document.querySelector(target);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });
}

// Función para mostrar mensajes de error en formularios
function mostrarErrorCampo(campo, mensaje) {
    // Limpiar errores anteriores
    const errorAnterior = campo.parentNode.querySelector('.error-campo');
    if (errorAnterior) {
        errorAnterior.remove();
    }
    
    // Agregar nuevo error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-campo';
    errorDiv.textContent = mensaje;
    errorDiv.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 5px;';
    
    campo.parentNode.appendChild(errorDiv);
    campo.style.borderColor = '#f44336';
    
    // Remover error al escribir
    campo.addEventListener('input', function limpiarError() {
        errorDiv.remove();
        campo.style.borderColor = '';
        campo.removeEventListener('input', limpiarError);
    });
}

// Función para validar campos requeridos
function validarCamposRequeridos(formulario) {
    let valido = true;
    const camposRequeridos = formulario.querySelectorAll('[required]');
    
    camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
            mostrarErrorCampo(campo, 'Este campo es requerido');
            valido = false;
            
            if (valido === false) {
                campo.focus();
            }
        }
    });
    
    return valido;
}

// Función para formatear moneda peruana
function formatearMonedaPeruana(monto) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(monto);
}

// Función para formatear fecha
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) {
        return fechaISO;
    }
    
    return fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Función para validar DNI peruano
function validarDNI(dni) {
    if (!dni) return false;
    dni = dni.toString().trim();
    return /^\d{8}$/.test(dni);
}

// Función para validar teléfono peruano
function validarTelefono(telefono) {
    if (!telefono) return false;
    telefono = telefono.toString().trim();
    return /^9\d{8}$/.test(telefono);
}

// Exportar funciones útiles
window.mostrarErrorCampo = mostrarErrorCampo;
window.validarCamposRequeridos = validarCamposRequeridos;
window.formatearMonedaPeruana = formatearMonedaPeruana;
window.formatearFecha = formatearFecha;
window.validarDNI = validarDNI;
window.validarTelefono = validarTelefono;