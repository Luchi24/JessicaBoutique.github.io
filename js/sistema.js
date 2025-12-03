// Sistema principal de Jessica Boutique
const Sistema = (function() {
    // Estado global
    const estado = {
        paginaActual: 'panel',
        modoOscuro: false,
        cargando: false,
        datosCargados: false
    };

    // Inicializar sistema
    function inicializar() {
        cargarConfiguracion();
        inicializarNavegacion();
        inicializarEventosGlobales();
        inicializarTema();
        
        console.log('Sistema Jessica Boutique inicializado');
    }

    // Cargar configuración
    function cargarConfiguracion() {
        const config = SistemaDatos.obtenerConfiguracion();
        estado.modoOscuro = config.tema === 'oscuro';
        estado.datosCargados = true;
    }

    // Inicializar navegación
    function inicializarNavegacion() {
        // Toggle del menú móvil
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('show');
            });
            
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.navbar') && navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                }
            });
        }
        
        // Actualizar enlace activo
        actualizarEnlaceActivo();
    }

    // Actualizar enlace activo en la navegación
    function actualizarEnlaceActivo() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Inicializar eventos globales
    function inicializarEventosGlobales() {
        // Detectar cambios en el tema
        const temaSelect = document.getElementById('selectTema');
        if (temaSelect) {
            temaSelect.addEventListener('change', cambiarTema);
        }
        
        // Manejar errores no capturados
        window.addEventListener('error', manejarError);
        window.addEventListener('unhandledrejection', manejarErrorPromesa);
    }

    // Inicializar tema
    function inicializarTema() {
        if (estado.modoOscuro) {
            document.body.classList.add('modo-oscuro');
        } else {
            document.body.classList.remove('modo-oscuro');
        }
        
        // Actualizar select si existe
        const temaSelect = document.getElementById('selectTema');
        if (temaSelect) {
            temaSelect.value = estado.modoOscuro ? 'oscuro' : 'claro';
        }
    }

    // Cambiar tema
    function cambiarTema() {
        const temaSelect = document.getElementById('selectTema');
        if (!temaSelect) return;
        
        const nuevoTema = temaSelect.value;
        estado.modoOscuro = nuevoTema === 'oscuro';
        
        // Actualizar en interfaz
        inicializarTema();
        
        // Guardar en configuración
        const config = SistemaDatos.obtenerConfiguracion();
        config.tema = nuevoTema;
        SistemaDatos.guardarConfiguracion(config);
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
                z-index: 2000;
                max-width: 400px;
            `;
            document.body.appendChild(contenedor);
        }
        
        // Crear mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `alert alert-${tipo}`;
        mensajeDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${obtenerIconoTipo(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
            <button class="btn btn-sm" onclick="this.parentElement.remove()" style="margin-left: auto;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Estilos adicionales
        mensajeDiv.style.cssText += `
            margin-bottom: 10px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        contenedor.appendChild(mensajeDiv);
        
        // Auto-remover después de la duración
        if (duracion > 0) {
            setTimeout(() => {
                if (mensajeDiv.parentElement) {
                    mensajeDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => mensajeDiv.remove(), 300);
                }
            }, duracion);
        }
        
        // Agregar animaciones CSS si no existen
        if (!document.querySelector('#estilos-animaciones-mensajes')) {
            const estilos = document.createElement('style');
            estilos.id = 'estilos-animaciones-mensajes';
            estilos.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(estilos);
        }
    }

    // Obtener icono según tipo de mensaje
    function obtenerIconoTipo(tipo) {
        const iconos = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    // Mostrar loader
    function mostrarLoader(mensaje = 'Cargando...') {
        estado.cargando = true;
        
        // Crear loader si no existe
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
                <div class="loader"></div>
                <p style="margin-top: 20px; font-size: 1.1rem;">${mensaje}</p>
            `;
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

    // Manejar errores
    function manejarError(error) {
        console.error('Error del sistema:', error);
        mostrarMensaje('error', `Error: ${error.message}`);
    }

    // Manejar errores de promesas
    function manejarErrorPromesa(event) {
        console.error('Error de promesa:', event.reason);
        mostrarMensaje('error', `Error: ${event.reason.message || 'Error desconocido'}`);
    }

    // Formatear moneda
    function formatearMoneda(cantidad) {
        const config = SistemaDatos.obtenerConfiguracion();
        return `${config.moneda} ${cantidad.toFixed(2)}`;
    }

    // Formatear fecha
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Validar DNI
    function validarDNI(dni) {
        if (!dni) return false;
        dni = dni.trim();
        return /^\d{8}$/.test(dni);
    }

    // Validar teléfono
    function validarTelefono(telefono) {
        if (!telefono) return false;
        telefono = telefono.trim();
        return /^\d{9}$/.test(telefono);
    }

    // Validar email
    function validarEmail(email) {
        if (!email) return true; // Email opcional
        email = email.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Exportar datos
    async function exportarDatosSistema() {
        try {
            mostrarLoader('Exportando datos...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular proceso
            SistemaDatos.exportarDatos();
            mostrarMensaje('success', 'Datos exportados correctamente');
        } catch (error) {
            mostrarMensaje('error', 'Error al exportar datos');
            console.error(error);
        } finally {
            ocultarLoader();
        }
    }

    // Importar datos
    async function importarDatosSistema(archivo) {
        try {
            mostrarLoader('Importando datos...');
            await SistemaDatos.importarDatos(archivo);
            mostrarMensaje('success', 'Datos importados correctamente');
            
            // Recargar la página para aplicar cambios
            setTimeout(() => window.location.reload(), 1500);
            
            return true;
        } catch (error) {
            mostrarMensaje('error', `Error al importar: ${error.message}`);
            return false;
        } finally {
            ocultarLoader();
        }
    }

    // Inicializar al cargar la página
    document.addEventListener('DOMContentLoaded', inicializar);

    // API pública
    return {
        mostrarMensaje,
        mostrarLoader,
        ocultarLoader,
        formatearMoneda,
        formatearFecha,
        validarDNI,
        validarTelefono,
        validarEmail,
        exportarDatosSistema,
        importarDatosSistema,
        cambiarTema,
        obtenerEstado: () => ({ ...estado })
    };
})();

// Hacer funciones disponibles globalmente para HTML
window.mostrarMensaje = Sistema.mostrarMensaje;
window.formatearMoneda = Sistema.formatearMoneda;
window.formatearFecha = Sistema.formatearFecha;