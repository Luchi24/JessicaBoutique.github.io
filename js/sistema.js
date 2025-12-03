// Sistema principal de Jessica Boutique
const Sistema = (function() {
    // Estado global del sistema
    const estado = {
        modoOscuro: false,
        cargando: false,
        datosInicializados: false
    };

    // Inicializar sistema
    function inicializar() {
        console.log('Inicializando sistema Jessica Boutique...');
        
        // Cargar configuración desde localStorage
        cargarConfiguracion();
        
        // Aplicar tema
        aplicarTema();
        
        // Inicializar eventos globales
        inicializarEventosGlobales();
        
        // Marcar como inicializado
        estado.datosInicializados = true;
        
        console.log('Sistema inicializado correctamente');
    }

    // Cargar configuración del sistema
    function cargarConfiguracion() {
        try {
            const datos = SistemaDatos.obtenerDatos();
            if (datos && datos.configuracion) {
                estado.modoOscuro = datos.configuracion.tema === 'oscuro';
            }
        } catch (error) {
            console.warn('Error al cargar configuración:', error);
            estado.modoOscuro = false;
        }
    }

    // Inicializar eventos globales
    function inicializarEventosGlobales() {
        // Detectar cambios en el tema
        const temaSelect = document.getElementById('selectTema');
        if (temaSelect) {
            temaSelect.value = estado.modoOscuro ? 'oscuro' : 'claro';
            temaSelect.addEventListener('change', cambiarTema);
        }
        
        // Detectar clics en enlaces externos
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href && !e.target.href.includes(window.location.hostname)) {
                e.preventDefault();
                mostrarMensaje('info', 'Redirigiendo a sitio externo...');
                setTimeout(() => window.open(e.target.href, '_blank'), 500);
            }
        });
    }

    // Aplicar tema actual
    function aplicarTema() {
        if (estado.modoOscuro) {
            document.body.classList.add('modo-oscuro');
        } else {
            document.body.classList.remove('modo-oscuro');
        }
        
        // Actualizar icono del tema si existe
        const iconoTema = document.getElementById('iconoTema');
        if (iconoTema) {
            iconoTema.className = estado.modoOscuro ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Cambiar tema claro/oscuro
    function cambiarTema() {
        const temaSelect = document.getElementById('selectTema');
        if (!temaSelect) return;
        
        const nuevoTema = temaSelect.value;
        estado.modoOscuro = nuevoTema === 'oscuro';
        
        // Aplicar en interfaz
        aplicarTema();
        
        // Guardar en configuración
        const config = SistemaDatos.obtenerConfiguracion();
        config.tema = nuevoTema;
        SistemaDatos.guardarConfiguracion(config);
        
        mostrarMensaje('success', `Tema cambiado a ${nuevoTema}`);
    }

    // Mostrar mensaje al usuario
    function mostrarMensaje(tipo, mensaje, duracion = 5000) {
        // Validar tipo de mensaje
        const tiposValidos = ['success', 'error', 'warning', 'info'];
        if (!tiposValidos.includes(tipo)) {
            tipo = 'info';
        }
        
        // Crear contenedor de mensajes si no existe
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
            
            // Agregar estilos para los mensajes
            if (!document.querySelector('#estilos-mensajes')) {
                const estilos = document.createElement('style');
                estilos.id = 'estilos-mensajes';
                estilos.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                    .mensaje-sistema {
                        animation: slideInRight 0.3s ease;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        padding: 12px 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        min-width: 300px;
                        max-width: 400px;
                    }
                    .mensaje-success {
                        background-color: #d4edda;
                        color: #155724;
                        border-left: 4px solid #28a745;
                    }
                    .mensaje-error {
                        background-color: #f8d7da;
                        color: #721c24;
                        border-left: 4px solid #dc3545;
                    }
                    .mensaje-warning {
                        background-color: #fff3cd;
                        color: #856404;
                        border-left: 4px solid #ffc107;
                    }
                    .mensaje-info {
                        background-color: #d1ecf1;
                        color: #0c5460;
                        border-left: 4px solid #17a2b8;
                    }
                `;
                document.head.appendChild(estilos);
            }
        }
        
        // Crear elemento del mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje-sistema mensaje-${tipo}`;
        mensajeDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <i class="fas ${obtenerIconoTipo(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
            <button type="button" class="btn-cerrar" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 10px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Agregar evento para cerrar
        const btnCerrar = mensajeDiv.querySelector('.btn-cerrar');
        btnCerrar.addEventListener('click', function() {
            cerrarMensaje(mensajeDiv);
        });
        
        // Agregar al contenedor
        contenedor.appendChild(mensajeDiv);
        
        // Auto-cerrar después del tiempo especificado
        if (duracion > 0) {
            setTimeout(() => {
                cerrarMensaje(mensajeDiv);
            }, duracion);
        }
        
        return mensajeDiv;
    }

    // Cerrar mensaje específico
    function cerrarMensaje(elementoMensaje) {
        if (elementoMensaje && elementoMensaje.parentElement) {
            elementoMensaje.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (elementoMensaje.parentElement) {
                    elementoMensaje.parentElement.removeChild(elementoMensaje);
                }
            }, 300);
        }
    }

    // Obtener icono según tipo de mensaje
    function obtenerIconoTipo(tipo) {
        const iconos = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return iconos[tipo] || 'fa-info-circle';
    }

    // Mostrar loader
    function mostrarLoader(mensaje = 'Cargando...') {
        if (estado.cargando) return;
        
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
                z-index: 99999;
                color: white;
            `;
            
            // Agregar estilos para el spinner
            if (!document.querySelector('#estilos-loader')) {
                const estilos = document.createElement('style');
                estilos.id = 'estilos-loader';
                estilos.textContent = `
                    .spinner-sistema {
                        width: 50px;
                        height: 50px;
                        border: 5px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        border-top-color: var(--color-rosa, #ff66b2);
                        animation: spin 1s ease-in-out infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(estilos);
            }
            
            loader.innerHTML = `
                <div class="spinner-sistema"></div>
                <p style="margin-top: 20px; font-size: 1.1rem; font-weight: 500;">${mensaje}</p>
            `;
            document.body.appendChild(loader);
        } else {
            loader.style.display = 'flex';
            // Actualizar mensaje
            const mensajeElem = loader.querySelector('p');
            if (mensajeElem) {
                mensajeElem.textContent = mensaje;
            }
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

    // Formatear moneda
    function formatearMoneda(cantidad) {
        if (typeof cantidad !== 'number') {
            cantidad = parseFloat(cantidad) || 0;
        }
        
        const config = SistemaDatos.obtenerConfiguracion();
        return `${config.moneda} ${cantidad.toFixed(2)}`;
    }

    // Formatear fecha
    function formatearFecha(fechaISO, formato = 'completo') {
        if (!fechaISO) return '';
        
        const fecha = new Date(fechaISO);
        
        if (isNaN(fecha.getTime())) {
            return fechaISO; // Devolver original si no es fecha válida
        }
        
        const opciones = {
            dia: '2-digit',
            mes: '2-digit',
            anio: 'numeric'
        };
        
        if (formato === 'completo') {
            opciones.hour = '2-digit';
            opciones.minute = '2-digit';
        }
        
        return fecha.toLocaleDateString('es-PE', opciones);
    }

    // Validar DNI peruano
    function validarDNI(dni) {
        if (!dni) return false;
        dni = dni.toString().trim();
        
        // Validar formato: 8 dígitos
        if (!/^\d{8}$/.test(dni)) {
            return false;
        }
        
        // Validar dígito verificador (algoritmo peruano simplificado)
        const digitos = dni.split('').map(Number);
        const suma = digitos.reduce((acc, val) => acc + val, 0);
        
        // Algoritmo básico de validación
        return suma > 0;
    }

    // Validar teléfono peruano
    function validarTelefono(telefono) {
        if (!telefono) return false;
        telefono = telefono.toString().trim();
        
        // Formato: 9 dígitos, comenzando con 9
        return /^9\d{8}$/.test(telefono);
    }

    // Validar email
    function validarEmail(email) {
        if (!email) return true; // Email opcional
        
        email = email.trim();
        if (email === '') return true;
        
        // Expresión regular básica para email
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validar RUC peruano (simplificado)
    function validarRUC(ruc) {
        if (!ruc) return false;
        ruc = ruc.toString().trim();
        
        // Formato: 11 dígitos
        return /^\d{11}$/.test(ruc);
    }

    // Exportar datos del sistema
    async function exportarDatosSistema() {
        try {
            mostrarLoader('Exportando datos...');
            
            // Pequeña pausa para mejor experiencia de usuario
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const exito = SistemaDatos.exportarDatos();
            
            if (exito) {
                mostrarMensaje('success', 'Datos exportados correctamente', 3000);
            }
            
            return exito;
        } catch (error) {
            console.error('Error al exportar datos:', error);
            mostrarMensaje('error', `Error al exportar: ${error.message}`);
            return false;
        } finally {
            ocultarLoader();
        }
    }

    // Importar datos del sistema
    async function importarDatosSistema(archivo) {
        try {
            if (!archivo || archivo.type !== 'application/json') {
                throw new Error('Archivo no válido. Debe ser un archivo JSON.');
            }
            
            mostrarLoader('Importando datos...');
            
            const exito = await SistemaDatos.importarDatos(archivo);
            
            if (exito) {
                mostrarMensaje('success', 'Datos importados correctamente. Recargando...', 3000);
                
                // Recargar página después de 2 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
            
            return exito;
        } catch (error) {
            console.error('Error al importar datos:', error);
            mostrarMensaje('error', `Error al importar: ${error.message}`);
            return false;
        } finally {
            ocultarLoader();
        }
    }

    // Confirmar acción (reemplaza confirm() nativo)
    function confirmarAccion(mensaje, titulo = 'Confirmar') {
        return new Promise((resolve) => {
            // Crear modal de confirmación
            const modalId = 'modal-confirmacion-' + Date.now();
            const modalHTML = `
                <div id="${modalId}" class="modal" style="display: flex;">
                    <div class="modal-content" style="max-width: 400px;">
                        <div class="modal-header">
                            <h3>${titulo}</h3>
                            <button class="btn btn-sm btn-cerrar-modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>${mensaje}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary btn-cancelar">Cancelar</button>
                            <button class="btn btn-primary btn-confirmar">Aceptar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar al DOM
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);
            
            const modal = document.getElementById(modalId);
            
            // Configurar eventos
            const btnCerrar = modal.querySelector('.btn-cerrar-modal');
            const btnCancelar = modal.querySelector('.btn-cancelar');
            const btnConfirmar = modal.querySelector('.btn-confirmar');
            
            const cerrarModal = (resultado) => {
                modal.remove();
                resolve(resultado);
            };
            
            btnCerrar.addEventListener('click', () => cerrarModal(false));
            btnCancelar.addEventListener('click', () => cerrarModal(false));
            btnConfirmar.addEventListener('click', () => cerrarModal(true));
            
            // Cerrar al hacer clic fuera
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    cerrarModal(false);
                }
            });
            
            // Enfocar botón de cancelar por defecto
            btnCancelar.focus();
        });
    }

    // Generar PDF (función placeholder)
    function generarPDF(datos, nombreArchivo = 'reporte') {
        mostrarMensaje('info', 'Función de generación de PDF en desarrollo');
        
        // En una implementación real, usaríamos una librería como jsPDF
        // Por ahora, simplemente exportamos a JSON
        return exportarDatosSistema();
    }

    // Copiar al portapapeles
    function copiarAlPortapapeles(texto) {
        return new Promise((resolve, reject) => {
            try {
                // Método moderno
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(texto)
                        .then(() => {
                            mostrarMensaje('success', 'Copiado al portapapeles');
                            resolve(true);
                        })
                        .catch(reject);
                } else {
                    // Método fallback para navegadores antiguos
                    const textarea = document.createElement('textarea');
                    textarea.value = texto;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    
                    const exito = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    
                    if (exito) {
                        mostrarMensaje('success', 'Copiado al portapapeles');
                        resolve(true);
                    } else {
                        reject(new Error('No se pudo copiar al portapapeles'));
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Obtener estadísticas rápidas
    function obtenerEstadisticasRapidas() {
        try {
            const datos = SistemaDatos.obtenerDatos();
            const productos = datos.productos || [];
            const ventas = datos.ventas || [];
            
            const hoy = new Date().toISOString().split('T')[0];
            const ventasHoy = ventas.filter(v => v.fecha === hoy);
            
            return {
                totalProductos: productos.length,
                totalVentas: ventas.length,
                ventasHoy: ventasHoy.length,
                totalVendidoHoy: ventasHoy.reduce((sum, v) => sum + v.total, 0),
                productosBajoStock: productos.filter(p => p.estado === 'lowstock').length,
                productosAgotados: productos.filter(p => p.estado === 'outofstock').length
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalProductos: 0,
                totalVentas: 0,
                ventasHoy: 0,
                totalVendidoHoy: 0,
                productosBajoStock: 0,
                productosAgotados: 0
            };
        }
    }

    // Inicializar al cargar la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // API pública del sistema
    return {
        // Estado
        obtenerEstado: () => ({ ...estado }),
        
        // Tema
        cambiarTema,
        
        // Mensajes y loaders
        mostrarMensaje,
        cerrarMensaje,
        mostrarLoader,
        ocultarLoader,
        
        // Formateo
        formatearMoneda,
        formatearFecha,
        
        // Validación
        validarDNI,
        validarTelefono,
        validarEmail,
        validarRUC,
        
        // Datos
        exportarDatosSistema,
        importarDatosSistema,
        
        // Utilidades
        confirmarAccion,
        generarPDF,
        copiarAlPortapapeles,
        obtenerEstadisticasRapidas
    };
})();

// Hacer funciones disponibles globalmente para uso en HTML
window.Sistema = Sistema;
window.mostrarMensaje = Sistema.mostrarMensaje;
window.formatearMoneda = Sistema.formatearMoneda;
window.formatearFecha = Sistema.formatearFecha;
window.mostrarLoader = Sistema.mostrarLoader;
window.ocultarLoader = Sistema.ocultarLoader;
window.validarDNI = Sistema.validarDNI;
window.validarTelefono = Sistema.validarTelefono;
window.validarEmail = Sistema.validarEmail;

// Función de conveniencia para confirmar acciones
window.confirmar = async function(mensaje, titulo) {
    return await Sistema.confirmarAccion(mensaje, titulo);
};

// Función para inicializar selectores de tema
window.inicializarSelectoresTema = function() {
    const temaSelect = document.getElementById('selectTema');
    if (temaSelect) {
        const config = SistemaDatos.obtenerConfiguracion();
        temaSelect.value = config.tema || 'claro';
        temaSelect.addEventListener('change', Sistema.cambiarTema);
    }
};

// Función para formatear números como moneda peruana
window.formatearPEN = function(cantidad) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(cantidad);
};

// Inicialización automática de componentes comunes
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap (si no existe)
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Inicializar popovers de Bootstrap (si no existe)
    if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
    
    // Configurar navegación activa
    const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (href === paginaActual) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }
    });
    
    // Configurar botones de cerrar para modales
    document.querySelectorAll('[data-dismiss="modal"]').forEach(boton => {
        boton.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});