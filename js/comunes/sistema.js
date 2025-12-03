// js/comunes/sistema.js
const Sistema = (function() {
    // Estado del sistema
    const estado = {
        modoOscuro: false,
        cargando: false
    };

    // Inicializar el sistema
    function inicializar() {
        console.log('Inicializando sistema...');
        
        // Inicializar navegación móvil
        inicializarNavegacionMovil();
        
        // Inicializar tema
        inicializarTema();
        
        // Inicializar eventos globales
        inicializarEventosGlobales();
        
        // Marcar enlace activo
        marcarEnlaceActivo();
        
        console.log('Sistema inicializado');
    }

    // Inicializar navegación móvil (botón hamburguesa)
    function inicializarNavegacionMovil() {
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
        }
    }

    // Marcar enlace activo en la navegación
    function marcarEnlaceActivo() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Inicializar tema claro/oscuro
    function inicializarTema() {
        // Verificar preferencia guardada
        const temaGuardado = localStorage.getItem('tema');
        if (temaGuardado === 'oscuro') {
            estado.modoOscuro = true;
            document.body.classList.add('modo-oscuro');
        } else {
            estado.modoOscuro = false;
            document.body.classList.remove('modo-oscuro');
        }
        
        // Configurar el selector de tema si existe
        const selectTema = document.getElementById('selectTema');
        if (selectTema) {
            selectTema.value = temaGuardado || 'claro';
            selectTema.addEventListener('change', function() {
                cambiarTema(this.value);
            });
        }
    }

    // Cambiar tema
    function cambiarTema(tema) {
        if (tema === 'oscuro') {
            document.body.classList.add('modo-oscuro');
            estado.modoOscuro = true;
        } else {
            document.body.classList.remove('modo-oscuro');
            estado.modoOscuro = false;
        }
        
        localStorage.setItem('tema', tema);
    }

    // Inicializar eventos globales
    function inicializarEventosGlobales() {
        // Inicializar tooltips de Bootstrap si está disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
        
        // Inicializar popovers de Bootstrap si está disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
            const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
            popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
        }
    }

    // Mostrar mensaje al usuario
    function mostrarMensaje(tipo, mensaje, duracion = 5000) {
        // Crear contenedor si no existe
        let contenedor = document.getElementById('mensajes-sistema');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'mensajes-sistema';
            contenedor.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(contenedor);
        }
        
        // Crear el mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `alert alert-${tipo} mensaje-sistema`;
        mensajeDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${obtenerIconoTipo(tipo)} me-2"></i>
                <span>${mensaje}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        // Estilos básicos para el mensaje (si no hay Bootstrap)
        if (typeof bootstrap === 'undefined') {
            mensajeDiv.style.cssText = `
                padding: 12px 16px;
                margin-bottom: 10px;
                border-radius: 8px;
                border-left: 4px solid ${obtenerColorTipo(tipo)};
                background-color: ${obtenerFondoTipo(tipo)};
                color: ${obtenerTextoColorTipo(tipo)};
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
            `;
            
            // Agregar animación si no existe
            if (!document.querySelector('#estilos-animaciones')) {
                const estilos = document.createElement('style');
                estilos.id = 'estilos-animaciones';
                estilos.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(estilos);
            }
        }
        
        contenedor.appendChild(mensajeDiv);
        
        // Auto-remover después de la duración
        if (duracion > 0) {
            setTimeout(() => {
                if (mensajeDiv.parentElement) {
                    mensajeDiv.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => mensajeDiv.remove(), 300);
                }
            }, duracion);
        }
        
        return mensajeDiv;
    }

    // Funciones auxiliares para los mensajes
    function obtenerIconoTipo(tipo) {
        const iconos = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return iconos[tipo] || 'fa-info-circle';
    }

    function obtenerColorTipo(tipo) {
        const colores = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        return colores[tipo] || '#17a2b8';
    }

    function obtenerFondoTipo(tipo) {
        const fondos = {
            'success': '#d4edda',
            'error': '#f8d7da',
            'warning': '#fff3cd',
            'info': '#d1ecf1'
        };
        return fondos[tipo] || '#d1ecf1';
    }

    function obtenerTextoColorTipo(tipo) {
        const colores = {
            'success': '#155724',
            'error': '#721c24',
            'warning': '#856404',
            'info': '#0c5460'
        };
        return colores[tipo] || '#0c5460';
    }

    // Mostrar loader
    function mostrarLoader(mensaje = 'Cargando...') {
        estado.cargando = true;
        
        let loader = document.getElementById('loader-global');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loader-global';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
            `;
            
            loader.innerHTML = `
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite;"></div>
                <p style="margin-top: 20px; font-size: 1.1rem;">${mensaje}</p>
            `;
            
            // Agregar animación
            if (!document.querySelector('#estilos-spinner')) {
                const estilos = document.createElement('style');
                estilos.id = 'estilos-spinner';
                estilos.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(estilos);
            }
            
            document.body.appendChild(loader);
        } else {
            loader.style.display = 'flex';
        }
    }

    // Ocultar loader
    function ocultarLoader() {
        estado.cargando = false;
        const loader = document.getElementById('loader-global');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Inicializar al cargar la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // API pública
    return {
        mostrarMensaje,
        mostrarLoader,
        ocultarLoader,
        cambiarTema,
        obtenerEstado: () => ({ ...estado })
    };
})();

// Hacer disponible globalmente
window.Sistema = Sistema;