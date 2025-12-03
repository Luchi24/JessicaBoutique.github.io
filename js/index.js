// JavaScript específico para index.html - Panel de Control
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de Control cargado');
    
    // Inicializar dashboard
    inicializarDashboard();
    
    // Configurar actualización automática cada 30 segundos
    setInterval(actualizarDashboard, 30000);
    
    // Configurar botones específicos
    configurarEventosDashboard();
});

function inicializarDashboard() {
    // Cargar estadísticas
    const stats = SistemaDatos.obtenerEstadisticas();
    
    // Actualizar tarjetas
    actualizarTarjeta('totalProductos', stats.totalProductos);
    actualizarTarjeta('ventasDia', `S/. ${stats.ventasHoy.toFixed(2)}`);
    actualizarTarjeta('stockBajo', stats.stockBajo);
    actualizarTarjeta('productoTendencia', stats.productoMasVendido);
    
    // Actualizar recomendación de stock
    actualizarRecomendacionStock(stats);
    
    // Actualizar tabla de últimas ventas
    actualizarUltimasVentas();
    
    // Actualizar tabla de productos con stock bajo
    actualizarProductosStockBajo();
}

function actualizarTarjeta(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

function actualizarRecomendacionStock(stats) {
    const recomendacionElement = document.getElementById('recomendacionStock');
    const productosBajoStock = document.getElementById('ventasProductoTendencia');
    
    if (stats.stockBajo > 0) {
        // Obtener productos con stock bajo
        const productos = SistemaDatos.obtenerProductos();
        const productosBajo = productos.filter(p => p.estado === 'lowstock');
        
        if (productosBajo.length > 0) {
            const nombres = productosBajo.slice(0, 3).map(p => p.nombre).join(', ');
            recomendacionElement.textContent = `Reponer: ${nombres}${productosBajo.length > 3 ? '...' : ''}`;
        }
    } else {
        recomendacionElement.textContent = 'Sin productos por agotarse';
    }
    
    if (stats.ventasProductoTop > 0) {
        productosBajoStock.textContent = `${stats.ventasProductoTop} vendidos`;
    } else {
        productosBajoStock.textContent = 'Sin datos suficientes';
    }
}

function actualizarUltimasVentas() {
    const tbody = document.getElementById('ultimasVentas');
    if (!tbody) return;
    
    const ventas = SistemaDatos.obtenerVentas();
    const ultimasVentas = ventas.slice(-5).reverse();
    
    tbody.innerHTML = '';
    
    if (ultimasVentas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No hay ventas registradas</td>
            </tr>
        `;
        return;
    }
    
    ultimasVentas.forEach(venta => {
        const cliente = SistemaDatos.obtenerClientes().find(c => c.id === venta.clienteId);
        const totalProductos = venta.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente?.nombre || 'Cliente no encontrado'}</td>
            <td>${totalProductos} productos</td>
            <td>S/. ${venta.total.toFixed(2)}</td>
            <td>${Utils.formatearFecha(venta.fecha)}</td>
        `;
        tbody.appendChild(row);
    });
}

function actualizarProductosStockBajo() {
    const tbody = document.getElementById('productosStockBajo');
    if (!tbody) return;
    
    const productos = SistemaDatos.obtenerProductos();
    const productosBajo = productos.filter(p => p.estado === 'lowstock');
    
    tbody.innerHTML = '';
    
    if (productosBajo.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay productos con stock bajo</td>
            </tr>
        `;
        return;
    }
    
    productosBajo.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stock}</td>
            <td>${producto.stockMinimo}</td>
            <td>
                <a href="agregar-producto.html?id=${producto.id}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit"></i> Reponer
                </a>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function configurarEventosDashboard() {
    // Botón para ver todas las ventas
    const btnVerVentas = document.querySelector('a[href="ventas.html"]');
    if (btnVerVentas) {
        btnVerVentas.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'ventas.html';
        });
    }
    
    // Botón para ver productos con stock bajo
    const btnVerStockBajo = document.querySelector('a[href="inventario.html?filtro=bajo"]');
    if (btnVerStockBajo) {
        btnVerStockBajo.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'inventario.html?filtro=bajo';
        });
    }
    
    // Botón para actualizar dashboard manualmente (si existe)
    const btnActualizar = document.getElementById('actualizarDashboard');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', function() {
            actualizarDashboard();
            Utils.mostrarNotificacion('Dashboard actualizado', 'success');
        });
    }
}

// Función para recargar dashboard
function actualizarDashboard() {
    console.log('Actualizando dashboard...');
    inicializarDashboard();
}