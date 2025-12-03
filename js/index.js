// Panel de Control - JavaScript específico
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de Control - Inicializando...');
    
    // Inicializar dashboard
    inicializarDashboard();
    
    // Configurar actualización automática cada 30 segundos
    setInterval(inicializarDashboard, 30000);
});

function inicializarDashboard() {
    // Obtener estadísticas
    const estadisticas = obtenerEstadisticasDashboard();
    
    // Actualizar tarjetas
    actualizarTarjetas(estadisticas);
    
    // Actualizar últimas ventas
    actualizarUltimasVentas();
    
    // Actualizar productos con stock bajo
    actualizarProductosStockBajo();
}

function obtenerEstadisticasDashboard() {
    // Obtener datos
    const productos = SistemaDatos.obtenerProductos();
    const ventas = SistemaDatos.obtenerVentas();
    const clientes = SistemaDatos.obtenerClientes();
    
    // Calcular ventas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = ventas.filter(v => v.fecha === hoy);
    const totalVentasHoy = ventasHoy.reduce((total, venta) => total + venta.total, 0);
    
    // Calcular productos con stock bajo
    const productosStockBajo = productos.filter(p => p.estado === 'lowstock');
    
    // Calcular producto más vendido (simplificado)
    let productoMasVendido = 'Ninguno';
    if (ventas.length > 0) {
        // En un sistema real, aquí contaríamos las ventas por producto
        productoMasVendido = 'Vestido Lila'; // Ejemplo
    }
    
    return {
        totalProductos: productos.length,
        totalVentasHoy: totalVentasHoy,
        totalStockBajo: productosStockBajo.length,
        productoMasVendido: productoMasVendido,
        totalClientes: clientes.length
    };
}

function actualizarTarjetas(estadisticas) {
    // Productos en stock
    const elTotalProductos = document.getElementById('totalProductos');
    if (elTotalProductos) elTotalProductos.textContent = estadisticas.totalProductos;
    
    // Ventas del día
    const elVentasDia = document.getElementById('ventasDia');
    if (elVentasDia) elVentasDia.textContent = `S/. ${estadisticas.totalVentasHoy.toFixed(2)}`;
    
    // Stock bajo
    const elStockBajo = document.getElementById('stockBajo');
    if (elStockBajo) elStockBajo.textContent = estadisticas.totalStockBajo;
    
    // Recomendación de stock
    const elRecomendacionStock = document.getElementById('recomendacionStock');
    if (elRecomendacionStock) {
        if (estadisticas.totalStockBajo > 0) {
            elRecomendacionStock.textContent = 'Revisar productos con stock bajo';
        } else {
            elRecomendacionStock.textContent = 'Sin productos por agotarse';
        }
    }
    
    // Producto en tendencia
    const elProductoTendencia = document.getElementById('productoTendencia');
    if (elProductoTendencia) elProductoTendencia.textContent = estadisticas.productoMasVendido;
    
    // Ventas producto tendencia
    const elVentasProductoTendencia = document.getElementById('ventasProductoTendencia');
    if (elVentasProductoTendencia) {
        elVentasProductoTendencia.textContent = estadisticas.totalProductos > 0 ? 
            'Datos de ventas disponibles' : 'Sin datos suficientes';
    }
}

function actualizarUltimasVentas() {
    const tbody = document.getElementById('ultimasVentas');
    if (!tbody) return;
    
    // Obtener últimas 5 ventas
    const ventas = SistemaDatos.obtenerVentas();
    const ultimasVentas = ventas.slice(-5).reverse();
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (ultimasVentas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No hay ventas registradas</td>
            </tr>
        `;
        return;
    }
    
    // Agregar cada venta
    ultimasVentas.forEach(venta => {
        const cliente = SistemaDatos.obtenerClientes().find(c => c.id === venta.clienteId);
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${cliente ? cliente.nombre : 'Cliente no encontrado'}</td>
            <td>${venta.productos ? venta.productos.length : 0} productos</td>
            <td>S/. ${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
            <td>${venta.fecha || 'Fecha no disponible'}</td>
        `;
        
        tbody.appendChild(fila);
    });
}

function actualizarProductosStockBajo() {
    const tbody = document.getElementById('productosStockBajo');
    if (!tbody) return;
    
    // Obtener productos con stock bajo
    const productos = SistemaDatos.obtenerProductos();
    const productosBajo = productos.filter(p => p.estado === 'lowstock').slice(0, 5);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (productosBajo.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay productos con stock bajo</td>
            </tr>
        `;
        return;
    }
    
    // Agregar cada producto
    productosBajo.forEach(producto => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${producto.nombre || 'Sin nombre'}</td>
            <td>${producto.categoria || 'Sin categoría'}</td>
            <td>${producto.stock || 0}</td>
            <td>${producto.stockMinimo || 5}</td>
            <td>
                <a href="agregar-producto.html?id=${producto.id}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit"></i> Reponer
                </a>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}