// Archivo principal - Inicialización de todos los componentes
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Jessica Boutique - Inicializando...');
    
    // 1. Inicializar sistema base
    if (typeof Sistema !== 'undefined') {
        console.log('Sistema base inicializado');
    } else {
        console.error('Error: Sistema no está definido');
    }
    
    // 2. Inicializar datos
    if (typeof SistemaDatos !== 'undefined') {
        console.log('Datos inicializados');
    } else {
        console.error('Error: SistemaDatos no está definido');
    }
    
    // 3. Inicializar navegación y menú
    inicializarNavegacion();
    
    // 4. Inicializar eventos globales
    inicializarEventosGlobales();
    
    // 5. Inicializar componentes específicos por página
    inicializarComponentesPagina();
    
    console.log('Inicialización completada');
});

// Función para inicializar navegación
function inicializarNavegacion() {
    // Toggle del menú móvil
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
    
    // Actualizar enlace activo
    actualizarEnlaceActivo();
}

// Función para actualizar enlace activo
function actualizarEnlaceActivo() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
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
}

// Función para inicializar eventos globales
function inicializarEventosGlobales() {
    // Eventos para modales
    inicializarModales();
    
    // Eventos para tooltips
    inicializarTooltips();
    
    // Eventos para formularios
    inicializarFormularios();
    
    // Eventos para botones de acción
    inicializarBotonesAccion();
}

// Función para inicializar modales
function inicializarModales() {
    // Cerrar modales con botón close
    document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
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

// Función para inicializar tooltips
function inicializarTooltips() {
    const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('title');
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

// Función para inicializar formularios
function inicializarFormularios() {
    // Prevenir envío de formularios sin validar
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Validar campos requeridos
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#f44336';
                    
                    // Crear mensaje de error si no existe
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'Este campo es requerido';
                        errorMsg.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 5px;';
                        field.parentNode.appendChild(errorMsg);
                    }
                } else {
                    field.style.borderColor = '';
                    const errorMsg = field.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                if (typeof Sistema !== 'undefined') {
                    Sistema.mostrarMensaje('error', 'Por favor, complete todos los campos requeridos');
                }
            }
        });
    });
    
    // Limpiar errores al escribir
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', function() {
            this.style.borderColor = '';
            const errorMsg = this.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
        });
    });
}

// Función para inicializar botones de acción
function inicializarBotonesAccion() {
    // Botones de eliminar con confirmación
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        if (!btn.hasAttribute('data-initialized')) {
            btn.setAttribute('data-initialized', 'true');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const mensaje = this.getAttribute('data-confirm') || 
                               '¿Estás seguro de que quieres eliminar este elemento?';
                
                if (confirm(mensaje)) {
                    // Ejecutar acción de eliminación
                    const url = this.getAttribute('href') || 
                               this.getAttribute('data-url');
                    
                    if (url && url !== '#') {
                        window.location.href = url;
                    } else {
                        // Si no hay URL, puede ser una acción AJAX
                        const callback = this.getAttribute('data-callback');
                        if (callback && typeof window[callback] === 'function') {
                            window[callback](this);
                        }
                    }
                }
            });
        }
    });
    
    // Botones de editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        if (!btn.hasAttribute('data-initialized')) {
            btn.setAttribute('data-initialized', 'true');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');
                if (url && url !== '#') {
                    window.location.href = url;
                }
            });
        }
    });
    
    // Botones con acción de recargar
    document.querySelectorAll('[data-action="reload"]').forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.reload();
        });
    });
    
    // Botones con acción de volver
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
        btn.addEventListener('click', function() {
            window.history.back();
        });
    });
}

// Función para inicializar componentes por página
function inicializarComponentesPagina() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            inicializarDashboard();
            break;
        case 'inventario.html':
            inicializarInventario();
            break;
        case 'agregar-producto.html':
            inicializarAgregarProducto();
            break;
        case 'ventas.html':
            inicializarVentas();
            break;
        case 'reportes.html':
            inicializarReportes();
            break;
        case 'gestion.html':
            inicializarGestion();
            break;
    }
}

// Inicializar Dashboard
function inicializarDashboard() {
    console.log('Inicializando dashboard...');
    
    // Si existe la función actualizarDashboard, ejecutarla
    if (typeof actualizarDashboard === 'function') {
        actualizarDashboard();
    }
    
    // Configurar eventos específicos del dashboard
    const btnVerTodasVentas = document.querySelector('a[href="ventas.html"]');
    if (btnVerTodasVentas) {
        btnVerTodasVentas.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'ventas.html';
        });
    }
    
    const btnVerInventario = document.querySelector('a[href="inventario.html?filtro=bajo"]');
    if (btnVerInventario) {
        btnVerInventario.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'inventario.html?filtro=bajo';
        });
    }
}

// Inicializar Inventario
function inicializarInventario() {
    console.log('Inicializando inventario...');
    
    // Configurar botón de nuevo producto
    const btnNuevoProducto = document.querySelector('a[href="agregar-producto.html"]');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'agregar-producto.html';
        });
    }
    
    // Configurar eventos de filtros si existen
    const btnAplicarFiltros = document.getElementById('aplicarFiltros');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', function() {
            if (typeof aplicarFiltrosInventario === 'function') {
                aplicarFiltrosInventario();
            } else {
                console.warn('Función aplicarFiltrosInventario no encontrada');
            }
        });
    }
    
    // Configurar búsqueda con Enter
    const inputBusqueda = document.getElementById('buscarProducto');
    if (inputBusqueda && btnAplicarFiltros) {
        inputBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                btnAplicarFiltros.click();
            }
        });
    }
}

// Inicializar Agregar Producto
function inicializarAgregarProducto() {
    console.log('Inicializando agregar producto...');
    
    // Configurar botón de cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
                window.location.href = 'inventario.html';
            }
        });
    }
    
    // Configurar selectores dinámicos
    const selectCategoria = document.getElementById('categoria');
    const selectTalla = document.getElementById('talla');
    
    if (selectCategoria && selectTalla) {
        selectCategoria.addEventListener('change', function() {
            if (typeof actualizarSelectTallas === 'function') {
                actualizarSelectTallas();
            }
        });
    }
    
    // Configurar botón de agregar combinación
    const btnAgregarCombinacion = document.getElementById('agregarCombinacion');
    if (btnAgregarCombinacion) {
        btnAgregarCombinacion.addEventListener('click', function() {
            if (typeof agregarCombinacion === 'function') {
                agregarCombinacion();
            }
        });
    }
}

// Inicializar Ventas
function inicializarVentas() {
    console.log('Inicializando ventas...');
    
    // Configurar botón de agregar al carrito
    const btnAgregarCarrito = document.getElementById('add-to-cart');
    if (btnAgregarCarrito) {
        btnAgregarCarrito.addEventListener('click', function() {
            if (typeof agregarAlCarrito === 'function') {
                agregarAlCarrito();
            }
        });
    }
    
    // Configurar botón de cancelar venta
    const btnCancelarVenta = document.getElementById('cancel-sale');
    if (btnCancelarVenta) {
        btnCancelarVenta.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cancelar esta venta?')) {
                if (typeof cancelarVenta === 'function') {
                    cancelarVenta();
                }
            }
        });
    }
    
    // Configurar cambio en método de pago
    const selectMetodoPago = document.getElementById('payment-method');
    if (selectMetodoPago) {
        selectMetodoPago.addEventListener('change', function() {
            if (typeof actualizarTotalConComision === 'function') {
                actualizarTotalConComision();
            }
        });
    }
}

// Inicializar Reportes
function inicializarReportes() {
    console.log('Inicializando reportes...');
    
    // Configurar botón de aplicar filtros
    const btnAplicarStats = document.getElementById('apply-stats');
    if (btnAplicarStats) {
        btnAplicarStats.addEventListener('click', function() {
            if (typeof aplicarFiltrosReportes === 'function') {
                aplicarFiltrosReportes();
            }
        });
    }
    
    // Configurar cambio en período
    const selectPeriodo = document.getElementById('stats-period');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', function() {
            const customDateRange = document.getElementById('custom-date-range');
            const customDateTo = document.getElementById('custom-date-to');
            
            if (this.value === 'custom') {
                if (customDateRange) customDateRange.style.display = 'block';
                if (customDateTo) customDateTo.style.display = 'block';
            } else {
                if (customDateRange) customDateRange.style.display = 'none';
                if (customDateTo) customDateTo.style.display = 'none';
            }
        });
    }
}

// Inicializar Gestión
function inicializarGestion() {
    console.log('Inicializando gestión...');
    
    // Configurar botones de agregar
    const btnAddCategory = document.getElementById('add-category');
    const btnAddColor = document.getElementById('add-color');
    const btnAddSize = document.getElementById('add-size');
    const btnAddPantsSize = document.getElementById('add-pants-size');
    
    if (btnAddCategory) {
        btnAddCategory.addEventListener('click', function() {
            if (typeof agregarCategoria === 'function') {
                agregarCategoria();
            }
        });
    }
    
    if (btnAddColor) {
        btnAddColor.addEventListener('click', function() {
            if (typeof agregarColor === 'function') {
                agregarColor();
            }
        });
    }
    
    if (btnAddSize) {
        btnAddSize.addEventListener('click', function() {
            if (typeof agregarTalla === 'function') {
                agregarTalla();
            }
        });
    }
    
    if (btnAddPantsSize) {
        btnAddPantsSize.addEventListener('click', function() {
            if (typeof agregarTallaPantalon === 'function') {
                agregarTallaPantalon();
            }
        });
    }
    
    // Configurar exportación/importación
    const btnExportData = document.getElementById('export-data');
    const btnImportData = document.getElementById('import-data');
    const fileImport = document.getElementById('import-file');
    
    if (btnExportData) {
        btnExportData.addEventListener('click', function() {
            if (typeof Sistema !== 'undefined' && Sistema.exportarDatosSistema) {
                Sistema.exportarDatosSistema();
            }
        });
    }
    
    if (btnImportData && fileImport) {
        btnImportData.addEventListener('click', function() {
            fileImport.click();
        });
        
        fileImport.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                if (typeof Sistema !== 'undefined' && Sistema.importarDatosSistema) {
                    Sistema.importarDatosSistema(e.target.files[0]);
                }
            }
        });
    }
    
    // Configurar cambio de tema
    const selectTema = document.getElementById('theme-mode');
    if (selectTema) {
        // Cargar tema actual
        const config = SistemaDatos.obtenerConfiguracion();
        selectTema.value = config.tema || 'claro';
        
        selectTema.addEventListener('change', function() {
            if (typeof Sistema !== 'undefined' && Sistema.cambiarTema) {
                Sistema.cambiarTema();
            }
        });
    }
}

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
    console.error(mensaje);
    
    // Mostrar mensaje al usuario
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-circle"></i>
            <span>${mensaje}</span>
        </div>
        <button class="btn btn-sm" onclick="this.parentElement.remove()" style="margin-left: auto;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Agregar animaciones CSS
if (!document.querySelector('#animaciones-globales')) {
    const style = document.createElement('style');
    style.id = 'animaciones-globales';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .fade-in {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Exportar funciones globales
window.inicializarNavegacion = inicializarNavegacion;
window.inicializarEventosGlobales = inicializarEventosGlobales;
window.inicializarComponentesPagina = inicializarComponentesPagina;
window.mostrarError = mostrarError;