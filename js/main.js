// Datos globales del sistema
let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos'],
    ventas: [],
    config: {
        ultimoIdVenta: 0,
        tasaIGV: 0.18
    }
};

// Funciones generales
function cargarDatos() {
    const guardados = localStorage.getItem('inventario_jessica_v2');
    if (guardados) {
        datos = JSON.parse(guardados);
    }
    // Inicializar componentes según la página actual
    inicializarPagina();
}

function guardarDatos() {
    localStorage.setItem('inventario_jessica_v2', JSON.stringify(datos));
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificaciones = document.getElementById('notificaciones');
    if (!notificaciones) return;
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'exito' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    notificaciones.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Inicializar página actual
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

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', cargarDatos);