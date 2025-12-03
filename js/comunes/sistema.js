// Sistema principal - Jessica Boutique
const Sistema = (function() {
    // Estado del sistema
    const estado = {
        modoOscuro: false,
        cargando: false,
        inicializado: false
    };

    // Inicializar sistema
    function inicializar() {
        if (estado.inicializado) return;
        
        console.log('Inicializando sistema Jessica Boutique...');
        
        // Cargar configuración
        cargarConfiguracion();
        
        // Aplicar tema
        aplicarTema();
        
        // Configurar eventos del tema
        configurarEventosTema();
        
        estado.inicializado = true;
        console.log('Sistema inicializado correctamente');
    }

    // Cargar configuración
    function cargarConfiguracion() {
        try {
            const config = SistemaDatos.obtenerConfiguracion();
            estado.modoOscuro = config.tema === 'oscuro';
        } catch (error) {
            console.warn('Error al cargar configuración:', error);
        }
    }

    // Aplicar tema actual
    function aplicarTema() {
        if (estado.modoOscuro) {
            document.body.classList.add('modo-oscuro');
        } else {
            document.body.classList.remove('modo-oscuro');
        }
    }

    // Configurar eventos del tema
    function configurarEventosTema() {
        const temaSelect = document.getElementById('temaSistema');
        if (temaSelect) {
            temaSelect.value = estado.modoOscuro ? 'oscuro' : 'claro';
            temaSelect.addEventListener('change', cambiarTema);
        }
    }

    // Cambiar tema
    function cambiarTema() {
        const temaSelect = document.getElementById('temaSistema');
        if (!temaSelect) return;
        
        const nuevoTema = temaSelect.value;
        estado.modoOscuro = nuevoTema === 'oscuro';
        
        // Aplicar en interfaz
        aplicarTema();
        
        // Guardar en configuración
        const config = SistemaDatos.obtenerConfiguracion();
        config.tema = nuevoTema;
        SistemaDatos.guardarConfiguracion(config);
        
        Utils.mostrarNotificacion(`Tema cambiado a ${nuevoTema}`, 'success');
    }

    // Mostrar loader
    function mostrarLoader(mensaje = 'Cargando...') {
        if (estado.cargando) return;
        
        estado.cargando = true;
        
        // Crear loader si no existe
        let loader = document.getElementById('loader-sistema');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loader-sistema';
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
            
            loader.innerHTML = `
                <div class="spinner-sistema"></div>
                <p style="margin-top: 20px; font-size: 1.1rem; font-weight: 500;">${mensaje}</p>
            `;
            document.body.appendChild(loader);
            
            // Agregar estilos para el spinner
            if (!document.querySelector('#estilos-loader-sistema')) {
                const style = document.createElement('style');
                style.id = 'estilos-loader-sistema';
                style.textContent = `
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
                document.head.appendChild(style);
            }
        } else {
            loader.style.display = 'flex';
        }
    }

    // Ocultar loader
    function ocultarLoader() {
        estado.cargando = false;
        const loader = document.getElementById('loader-sistema');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Confirmar acción
    function confirmarAccion(mensaje, titulo = 'Confirmar') {
        return new Promise((resolve) => {
            const modalId = 'modal-confirmacion-' + Date.now();
            const modalHTML = `
                <div id="${modalId}" class="modal" style="display: flex;">
                    <div class="modal-contenido" style="max-width: 400px;">
                        <div class="modal-header">
                            <h3>${titulo}</h3>
                            <button class="btn-cerrar-modal">&times;</button>
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

    // Exportar datos del sistema
    async function exportarDatos() {
        try {
            mostrarLoader('Exportando datos...');
            await new Promise(resolve => setTimeout(resolve, 500));
            SistemaDatos.exportarDatos();
            Utils.mostrarNotificacion('Datos exportados correctamente', 'success');
            return true;
        } catch (error) {
            console.error('Error al exportar datos:', error);
            Utils.mostrarNotificacion('Error al exportar datos', 'error');
            return false;
        } finally {
            ocultarLoader();
        }
    }

    // Importar datos del sistema
    async function importarDatos(archivo) {
        try {
            if (!archivo || archivo.type !== 'application/json') {
                throw new Error('Archivo no válido. Debe ser un archivo JSON.');
            }
            
            mostrarLoader('Importando datos...');
            await SistemaDatos.importarDatos(archivo);
            Utils.mostrarNotificacion('Datos importados correctamente', 'success');
            
            // Recargar página después de 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            Utils.mostrarNotificacion(`Error al importar: ${error.message}`, 'error');
            return false;
        } finally {
            ocultarLoader();
        }
    }

    // Obtener estadísticas rápidas
    function obtenerEstadisticasRapidas() {
        try {
            return SistemaDatos.obtenerEstadisticas();
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalProductos: 0,
                valorInventario: 0,
                stockBajo: 0,
                agotados: 0,
                ventasHoy: 0,
                productoMasVendido: 'Sin datos',
                ventasProductoTop: 0
            };
        }
    }

    // Inicializar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // API pública
    return {
        // Estado
        obtenerEstado: () => ({ ...estado }),
        
        // Tema
        cambiarTema,
        
        // Loaders
        mostrarLoader,
        ocultarLoader,
        
        // Utilidades
        confirmarAccion,
        exportarDatos,
        importarDatos,
        obtenerEstadisticasRapidas
    };
})();

// Hacer disponible globalmente
window.Sistema = Sistema;