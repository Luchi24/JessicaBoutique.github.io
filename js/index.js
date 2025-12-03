// JavaScript específico para el Panel de Control
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de Control cargado');
    
    // Inicializar dashboard
    inicializarDashboard();
    
    // Configurar eventos específicos
    document.getElementById('btnRecargar').addEventListener('click', function() {
        recargarDashboard();
    });
    
    // Actualizar cada 30 segundos
    setInterval(actualizarDashboard, 30000);
});

function inicializarDashboard() {
    // Cargar datos del dashboard
    const stats = obtenerEstadisticas();
    
    // Actualizar tarjetas
    actualizarTarjeta('totalProductos', stats.totalProductos);
    actualizarTarjeta('ventasHoy', `S/. ${stats.ventasHoy.toFixed(2)}`);
    actualizarTarjeta('stockBajo', stats.stockBajo);
    actualizarTarjeta('productoTendencia', stats.productoTop || '-');
    
    // Cargar últimas ventas
    cargarUltimasVentas();
    
    // Cargar productos con stock bajo
    cargarProductosStockBajo();
}

function obtenerEstadisticas() {
    const productos = SistemaDatos.obtenerProductos();
    const ventas = SistemaDatos.obtenerVentas();
    const hoy = new Date().toISOString().split('T')[0];
    
    // Calcular estadísticas
    const ventasHoy = ventas.filter(v => v.fecha === hoy)
        .reduce((total, venta) => total + venta.total, 0);
    
    const stockBajo = productos.filter(p => p.estado === 'lowstock').length;
    
    return {
        totalProductos: productos.length,
        ventasHoy: ventasHoy,
        stockBajo: stockBajo,
        productoTop: 'Vestido Lila' // Simulado
    };
}

function actualizarTarjeta(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

function recargarDashboard() {
    mostrarCargando();
    setTimeout(() => {
        inicializarDashboard();
        ocultarCargando();
        mostrarNotificacion('success', 'Dashboard actualizado');
    }, 500);
}

function mostrarCargando() {
    // Implementar loader
}

function ocultarCargando() {
    // Ocultar loader
}

function mostrarNotificacion(tipo, mensaje) {
    // Implementar notificaciones
}