let graficoHoy = null;

function inicializarDashboard() {
    actualizarFecha();
    crearGraficoHoy();
    actualizarDashboard();
    setInterval(actualizarDashboard, 60000); // Actualizar cada minuto
}

function actualizarFecha() {
    const fecha = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fecha-actual').textContent = fecha.toLocaleDateString('es-PE', opciones);
}

function crearGraficoHoy() {
    const ctx = document.getElementById('grafico-hoy');
    if (!ctx) return;
    
    graficoHoy = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
            datasets: [{
                label: 'Ventas (S/.)',
                data: Array(14).fill(0),
                backgroundColor: 'rgba(233, 30, 99, 0.2)',
                borderColor: 'rgba(233, 30, 99, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'S/. ' + value;
                        }
                    }
                }
            }
        }
    });
}

function actualizarDashboard() {
    const totalProductos = datos.productos.length;
    document.getElementById('total-productos').textContent = totalProductos;
    
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
    
    const ventasHoy = datos.ventas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        return fechaVenta >= inicioHoy && fechaVenta <= finHoy;
    });
    
    const ventasHoyCantidad = ventasHoy.length;
    const ventasHoyMonto = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const gananciasHoy = ventasHoy.reduce((sum, v) => {
        const gananciaVenta = v.items.reduce((sumItems, item) => {
            const producto = datos.productos[item.productoIndex];
            const costo = producto ? (producto.precioCompra || producto.precio * 0.6) * item.cantidad : 0;
            return sumItems + (item.subtotal - costo);
        }, 0);
        return sum + gananciaVenta;
    }, 0);
    
    const alertaStock = datos.config.alertaStock || 3;
    const stockBajo = datos.productos.filter(p => p.cantidad < alertaStock).length;
    
    document.getElementById('ventas-hoy').textContent = ventasHoyCantidad;
    document.getElementById('monto-hoy').textContent = `S/. ${ventasHoyMonto.toFixed(2)}`;
    document.getElementById('ganancias-hoy').textContent = `S/. ${gananciasHoy.toFixed(2)}`;
    document.getElementById('stock-bajo').textContent = stockBajo;
    document.getElementById('alerta-stock').textContent = alertaStock;
    
    actualizarGraficoHoy(ventasHoy);
    actualizarTopProductos();
    actualizarAlertas(stockBajo, ventasHoyCantidad);
    actualizarActividadReciente();
}

function actualizarGraficoHoy(ventasHoy) {
    if (!graficoHoy) return;
    
    const horasVentas = Array(14).fill(0); // 8:00 - 21:00
    
    ventasHoy.forEach(venta => {
        const horaVenta = new Date(venta.fecha).getHours();
        const indice = horaVenta - 8; // 8:00 = índice 0
        if (indice >= 0 && indice < 14) {
            horasVentas[indice] += venta.total;
        }
    });
    
    graficoHoy.data.datasets[0].data = horasVentas;
    graficoHoy.update();
}

function actualizarTopProductos() {
    const container = document.getElementById('top-productos');
    if (!container) return;
    
    const ultimasVentas = datos.ventas.slice(-50); // Últimas 50 ventas
    const productosVendidos = {};
    
    ultimasVentas.forEach(venta => {
        venta.items.forEach(item => {
            if (!productosVendidos[item.nombre]) {
                productosVendidos[item.nombre] = 0;
            }
            productosVendidos[item.nombre] += item.cantidad;
        });
    });
    
    const topProductos = Object.entries(productosVendidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (topProductos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">No hay ventas recientes</p>';
        return;
    }
    
    topProductos.forEach(([nombre, cantidad], index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.8rem';
        div.style.background = '#fafafa';
        div.style.borderRadius = '8px';
        div.style.transition = 'transform 0.2s';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 30px; height: 30px; background: ${getColorPorPosicion(index)}; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${index + 1}
                </div>
                <div>
                    <div style="font-weight: 500;">${nombre}</div>
                    <small style="color: #666; font-size: 0.85rem;">${cantidad} unidades</small>
                </div>
            </div>
            <i class="fas fa-chevron-right" style="color: #999;"></i>
        `;
        
        div.addEventListener('click', () => {
            // Aquí podrías redirigir a una vista detallada del producto
            mostrarNotificacion(`Ver detalles de ${nombre}`, 'info');
        });
        
        container.appendChild(div);
    });
}

function getColorPorPosicion(index) {
    const colores = ['#e91e63', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
    return colores[index] || '#666';
}

function actualizarAlertas(stockBajo, ventasHoy) {
    const container = document.getElementById('alertas-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const alertas = [];
    
    // Alerta de stock bajo
    if (stockBajo > 0) {
        alertas.push({
            tipo: 'warning',
            icono: 'exclamation-triangle',
            mensaje: `${stockBajo} producto(s) con stock bajo`,
            accion: 'inventario.html'
        });
    }
    
    // Alerta si no hay ventas hoy
    const hoy = new Date();
    const hora = hoy.getHours();
    if (ventasHoy === 0 && hora >= 12) {
        alertas.push({
            tipo: 'info',
            icono: 'shopping-cart',
            mensaje: 'No hay ventas registradas hoy',
            accion: 'ventas.html'
        });
    }
    
    // Alerta de productos agotados
    const productosAgotados = datos.productos.filter(p => p.cantidad === 0).length;
    if (productosAgotados > 0) {
        alertas.push({
            tipo: 'danger',
            icono: 'times-circle',
            mensaje: `${productosAgotados} producto(s) agotados`,
            accion: 'inventario.html'
        });
    }
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: #4caf50; margin-bottom: 1rem;"></i>
                <p>¡Todo en orden!</p>
                <small>No hay alertas pendientes</small>
            </div>
        `;
        return;
    }
    
    alertas.forEach(alerta => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '1rem';
        div.style.padding = '1rem';
        div.style.background = getColorFondoAlerta(alerta.tipo);
        div.style.borderRadius = '8px';
        div.style.borderLeft = `4px solid ${getColorAlerta(alerta.tipo)}`;
        
        div.innerHTML = `
            <i class="fas fa-${alerta.icono}" style="color: ${getColorAlerta(alerta.tipo)}; font-size: 1.2rem;"></i>
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 500;">${alerta.mensaje}</p>
            </div>
            ${alerta.accion ? `<a href="${alerta.accion}" style="color: ${getColorAlerta(alerta.tipo)};"><i class="fas fa-arrow-right"></i></a>` : ''}
        `;
        
        container.appendChild(div);
    });
}

function getColorAlerta(tipo) {
    const colores = {
        'warning': '#ff9800',
        'danger': '#f44336',
        'info': '#2196f3',
        'success': '#4caf50'
    };
    return colores[tipo] || '#666';
}

function getColorFondoAlerta(tipo) {
    const colores = {
        'warning': '#fff3e0',
        'danger': '#ffebee',
        'info': '#e3f2fd',
        'success': '#e8f5e9'
    };
    return colores[tipo] || '#fafafa';
}

function actualizarActividadReciente() {
    const container = document.getElementById('actividad-reciente');
    if (!container) return;
    
    const ultimasVentas = [...datos.ventas]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 3);
    
    container.innerHTML = '';
    
    if (ultimasVentas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">No hay actividad reciente</p>';
        return;
    }
    
    ultimasVentas.forEach(venta => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '1rem';
        div.style.borderBottom = '1px solid #eee';
        
        const fecha = new Date(venta.fecha);
        const tiempoTranscurrido = calcularTiempoTranscurrido(fecha);
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; background: #e8f5e9; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-shopping-cart" style="color: #4caf50;"></i>
                </div>
                <div>
                    <div style="font-weight: 500;">Venta a ${venta.cliente}</div>
                    <small style="color: #666;">${tiempoTranscurrido}</small>
                </div>
            </div>
            <div style="font-weight: bold; color: #e91e63;">
                S/. ${venta.total.toFixed(2)}
            </div>
        `;
        
        container.appendChild(div);
    });
}

function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const diferencia = ahora - fecha;
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 60) {
        return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
        return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
        return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    }
}

if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
}