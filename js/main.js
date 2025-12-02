let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos'],
    ventas: [],
    config: {
        ultimoIdVenta: 0,
        tasaIGV: 0.18,
        alertaStock: 5
    }
};

let notificaciones = {
    confirmaciones: [],
    alertas: []
};

function cargarDatos() {
    const guardados = localStorage.getItem('inventario_jessica_v2');
    
    if (guardados) {
        try {
            datos = JSON.parse(guardados);
        } catch (error) {
            mostrarNotificacion('Error cargando datos. Se usarán datos por defecto.', 'error');
            datosIniciales();
        }
    } else {
        const oldData = localStorage.getItem('inventario_jessica');
        if (oldData) {
            try {
                const old = JSON.parse(oldData);
                datos.productos = old.productos || [];
                datos.colores = old.colores || datos.colores;
                datos.categorias = old.categorias || datos.categorias;
                
                datos.productos.forEach(producto => {
                    if (!producto.precioCompra) {
                        producto.precioCompra = producto.precio * 0.7;
                    }
                });
            } catch (error) {
                datosIniciales();
            }
        } else {
            datosIniciales();
        }
    }
    
    inicializarPagina();
}

function datosIniciales() {
    datos = {
        productos: [],
        colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
        categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos'],
        ventas: [],
        config: {
            ultimoIdVenta: 0,
            tasaIGV: 0.18,
            alertaStock: 5
        }
    };
}

function guardarDatos() {
    localStorage.setItem('inventario_jessica_v2', JSON.stringify(datos));
}

function mostrarConfirmacion(mensaje, opciones = {}) {
    return new Promise((resolve) => {
        const titulo = opciones.titulo || 'Confirmación';
        const tipo = opciones.tipo || 'info';
        const icono = opciones.icono || 'fa-question-circle';
        const textoConfirmar = opciones.textoConfirmar || 'Confirmar';
        const textoCancelar = opciones.textoCancelar || 'Cancelar';
        const peligroso = opciones.peligroso || false;
        
        const modalId = 'modal-confirmacion-' + Date.now();
        const modalHTML = `
            <div id="${modalId}" class="modal" style="display: flex;">
                <div class="modal-contenido">
                    <div class="modal-header ${peligroso ? 'peligro' : ''}">
                        <h3><i class="fas ${icono}"></i> ${titulo}</h3>
                        <button class="btn-cerrar" onclick="cerrarConfirmacion('${modalId}', false)">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 1.5rem; font-size: 1rem;">${mensaje}</p>
                        <div class="botones-confirmacion">
                            <button class="btn-secundario" onclick="cerrarConfirmacion('${modalId}', false)">
                                ${textoCancelar}
                            </button>
                            <button class="btn-principal ${peligroso ? 'peligro' : ''}" onclick="cerrarConfirmacion('${modalId}', true)">
                                ${textoConfirmar}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        notificaciones.confirmaciones.push({
            id: modalId,
            resolve: resolve
        });
    });
}

function cerrarConfirmacion(modalId, resultado) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
        
        const confirmacion = notificaciones.confirmaciones.find(c => c.id === modalId);
        if (confirmacion) {
            confirmacion.resolve(resultado);
            notificaciones.confirmaciones = notificaciones.confirmaciones.filter(c => c.id !== modalId);
        }
    }
}

function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    const notificacionesContainer = document.getElementById('notificaciones');
    if (!notificacionesContainer) return;
    
    const notificacionId = 'notificacion-' + Date.now();
    const notificacion = document.createElement('div');
    notificacion.id = notificacionId;
    notificacion.className = `notificacion ${tipo}`;
    
    const iconos = {
        exito: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        advertencia: 'fa-exclamation-triangle'
    };
    
    notificacion.innerHTML = `
        <i class="fas ${iconos[tipo] || iconos.info}"></i>
        <span>${mensaje}</span>
        <button class="btn-cerrar-notificacion" onclick="cerrarNotificacion('${notificacionId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificacionesContainer.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateY(0)';
    }, 10);
    
    if (duracion > 0) {
        setTimeout(() => {
            cerrarNotificacion(notificacionId);
        }, duracion);
    }
    
    notificaciones.alertas.push(notificacionId);
}

function cerrarNotificacion(id) {
    const notificacion = document.getElementById(id);
    if (notificacion) {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            notificacion.remove();
            notificaciones.alertas = notificaciones.alertas.filter(alertId => alertId !== id);
        }, 300);
    }
}

function inicializarPagina() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    switch(page) {
        case 'inventario.html':
            if (typeof cargarInventario === 'function') cargarInventario();
            break;
        case 'agregar-producto.html':
            if (typeof inicializarAgregar === 'function') inicializarAgregar();
            break;
        case 'ventas.html':
            if (typeof inicializarVentas === 'function') inicializarVentas();
            break;
        case 'reportes.html':
            if (typeof inicializarReportes === 'function') inicializarReportes();
            break;
        case 'gestion.html':
            if (typeof inicializarGestion === 'function') inicializarGestion();
            break;
        default:
            if (typeof inicializarDashboard === 'function') inicializarDashboard();
    }
}

document.addEventListener('DOMContentLoaded', cargarDatos);