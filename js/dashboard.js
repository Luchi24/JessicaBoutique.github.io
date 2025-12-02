function inicializarDashboard() {
    actualizarDashboard();
    inicializarEventosDashboard();
    configurarActualizacionAutomatica();
}

function inicializarEventosDashboard() {
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', function() {
            const titulo = this.querySelector('h3').textContent;
            console.log(`Navegando a: ${titulo}`);
        });
    });
}

function configurarActualizacionAutomatica() {
    setInterval(actualizarDashboard, 30000);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            actualizarDashboard();
        }
    });
}

function actualizarDashboard() {
    actualizarEstadisticasPrincipales();
    actualizarAlertas();
    actualizarEstadisticasDetalladas();
    actualizarUltimaActividad();
}

function actualizarEstadisticasPrincipales() {
    const totalProductos = datos.productos.length;
    const productosElement = document.getElementById('dashboard-total-productos');
    if (productosElement) {
        productosElement.textContent = totalProductos;
        productosElement.style.color = totalProductos === 0 ? 'var(--rojo)' : 'var(--rosa-principal)';
    }
    
    const hoy = new Date().toLocaleDateString('es-PE');
    const ventasHoy = datos.ventas.filter(v => 
        new Date(v.fecha).toLocaleDateString('es-PE') === hoy
    );
    
    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const ventasHoyElement = document.getElementById('dashboard-ventas-hoy');
    if (ventasHoyElement) {
        ventasHoyElement.textContent = `S/. ${totalVentasHoy.toFixed(2)}`;
        ventasHoyElement.style.color = ventasHoy.length === 0 ? 'var(--gris-oscuro)' : 'var(--rosa-principal)';
    }
    
    const gananciaHoy = ventasHoy.reduce((sum, v) => sum + v.gananciaTotal, 0);
    const gananciasElement = document.getElementById('dashboard-ganancias');
    if (gananciasElement) {
        gananciasElement.textContent = `S/. ${gananciaHoy.toFixed(2)}`;
        gananciasElement.style.color = gananciaHoy === 0 ? 'var(--gris-oscuro)' : 'var(--verde)';
    }
}

function actualizarAlertas() {
    const container = document.getElementById('alertas-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const alertas = [];
    
    const productosBajoStock = datos.productos.filter(p => p.cantidad < 5);
    if (productosBajoStock.length > 0) {
        const productosCriticos = productosBajoStock.filter(p => p.cantidad === 0);
        const esCritico = productosCriticos.length > 0;
        
        alertas.push({
            tipo: esCritico ? 'critica' : 'media',
            titulo: `${productosBajoStock.length} producto(s) con stock bajo`,
            descripcion: productosBajoStock.slice(0, 3).map(p => `${p.nombre} (${p.cantidad})`).join(', ') + 
                        (productosBajoStock.length > 3 ? '...' : ''),
            accion: 'inventario.html',
            icono: esCritico ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'
        });
    }
    
    const hoy = new Date().toLocaleDateString('es-PE');
    const ventasHoy = datos.ventas.filter(v => 
        new Date(v.fecha).toLocaleDateString('es-PE') === hoy
    );
    
    if (ventasHoy.length === 0) {
        alertas.push({
            tipo: 'media',
            titulo: 'Sin ventas hoy',
            descripcion: 'Aún no se han registrado ventas en el día',
            accion: 'ventas.html',
            icono: 'fa-chart-line'
        });
    }
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 90);
    
    const productosAntiguos = datos.productos.filter(p => {
        if (!p.fechaCreacion) {
            return p.cantidad > 0 && Math.random() > 0.7;
        }
        return new Date(p.fechaCreacion) < fechaLimite;
    }).slice(0, 5);
    
    if (productosAntiguos.length > 0) {
        alertas.push({
            tipo: 'media',
            titulo: `${productosAntiguos.length} producto(s) en inventario por mucho tiempo`,
            descripcion: 'Considera revisar rotación de inventario',
            accion: 'inventario.html',
            icono: 'fa-clock'
        });
    }
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="alerta-item" style="border-left-color: var(--verde);">
                <div class="alerta-contenido">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Todo en orden</strong>
                        <p>No hay alertas pendientes</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        alertas.forEach(alerta => {
            const alertaDiv = document.createElement('div');
            alertaDiv.className = `alerta-item ${alerta.tipo}`;
            
            alertaDiv.innerHTML = `
                <div class="alerta-contenido">
                    <i class="fas ${alerta.icono}"></i>
                    <div>
                        <strong>${alerta.titulo}</strong>
                        <p>${alerta.descripcion}</p>
                    </div>
                </div>
                ${alerta.accion ? `<a href="${alerta.accion}" class="btn-alerta">Ver</a>` : ''}
            `;
            
            container.appendChild(alertaDiv);
        });
    }
}

function actualizarEstadisticasDetalladas() {
    const stockBajo = datos.productos.filter(p => p.cantidad < 5).length;
    const stockBajoElement = document.getElementById('stat-stock-bajo');
    if (stockBajoElement) {
        stockBajoElement.textContent = stockBajo;
        stockBajoElement.style.color = stockBajo > 0 ? 'var(--rojo)' : 'var(--verde)';
    }
    
    const ultimaSemana = new Date();
    ultimaSemana.setDate(ultimaSemana.getDate() - 7);
    
    const ventasRecientes = datos.ventas.filter(v => new Date(v.fecha) > ultimaSemana);
    const topProducto = obtenerProductoMasVendido(ventasRecientes);
    const topProductoElement = document.getElementById('stat-top-producto');
    
    if (topProductoElement) {
        if (topProducto) {
            topProductoElement.textContent = `${topProducto.nombre} (${topProducto.cantidad})`;
            topProductoElement.title = `${topProducto.cantidad} unidades vendidas`;
        } else {
            topProductoElement.textContent = 'Sin datos';
            topProductoElement.title = 'No hay ventas recientes';
        }
    }
    
    const topCategoria = obtenerCategoriaMasVendida(ventasRecientes);
    const topCategoriaElement = document.getElementById('stat-top-categoria');
    
    if (topCategoriaElement) {
        if (topCategoria) {
            topCategoriaElement.textContent = topCategoria.categoria;
            topCategoriaElement.title = `S/. ${topCategoria.total.toFixed(2)} en ventas`;
        } else {
            topCategoriaElement.textContent = 'Sin datos';
        }
    }
}

function obtenerProductoMasVendido(ventas) {
    const productosVendidos = {};
    
    ventas.forEach(venta => {
        venta.items.forEach(item => {
            if (!productosVendidos[item.nombre]) {
                productosVendidos[item.nombre] = {
                    nombre: item.nombre,
                    cantidad: 0,
                    total: 0
                };
            }
            productosVendidos[item.nombre].cantidad += item.cantidad;
            productosVendidos[item.nombre].total += item.subtotal;
        });
    });
    
    const productosArray = Object.values(productosVendidos);
    if (productosArray.length === 0) return null;
    
    return productosArray.sort((a, b) => b.cantidad - a.cantidad)[0];
}

function obtenerCategoriaMasVendida(ventas) {
    const categoriasVendidas = {};
    
    ventas.forEach(venta => {
        venta.items.forEach(item => {
            const producto = datos.productos[item.productoIndex];
            if (producto && producto.categoria) {
                const categoria = producto.categoria;
                if (!categoriasVendidas[categoria]) {
                    categoriasVendidas[categoria] = {
                        categoria: categoria,
                        cantidad: 0,
                        total: 0
                    };
                }
                categoriasVendidas[categoria].cantidad += item.cantidad;
                categoriasVendidas[categoria].total += item.subtotal;
            }
        });
    });
    
    const categoriasArray = Object.values(categoriasVendidas);
    if (categoriasArray.length === 0) return null;
    
    return categoriasArray.sort((a, b) => b.total - a.total)[0];
}

function actualizarUltimaActividad() {
    const ultimaActividadElement = document.getElementById('stat-ultima-actividad');
    if (!ultimaActividadElement) return;
    
    if (datos.ventas.length > 0) {
        const ventasOrdenadas = [...datos.ventas].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        );
        
        const ultimaVenta = ventasOrdenadas[0];
        const fechaVenta = new Date(ultimaVenta.fecha);
        const ahora = new Date();
        const diferenciaHoras = Math.floor((ahora - fechaVenta) / (1000 * 60 * 60));
        
        let texto = '';
        if (diferenciaHoras < 1) {
            texto = 'Hace menos de 1 hora';
        } else if (diferenciaHoras < 24) {
            texto = `Hace ${diferenciaHoras} hora(s)`;
        } else {
            const diferenciaDias = Math.floor(diferenciaHoras / 24);
            texto = `Hace ${diferenciaDias} día(s)`;
        }
        
        ultimaActividadElement.textContent = texto;
        ultimaActividadElement.title = `Cliente: ${ultimaVenta.cliente.nombre} - Total: S/. ${ultimaVenta.total.toFixed(2)}`;
    } else {
        ultimaActividadElement.textContent = 'Sin actividad';
        ultimaActividadElement.title = 'No hay ventas registradas';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('/')) {
            inicializarDashboard();
        }
    });
} else {
    if (window.location.pathname.endsWith('index.html') || 
        window.location.pathname.endsWith('/')) {
        inicializarDashboard();
    }
}