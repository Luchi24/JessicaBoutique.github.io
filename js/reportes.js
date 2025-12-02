let graficoVentas = null;

function inicializarReportes() {
    crearGrafico();
    actualizarReporte();
    
    document.getElementById('periodo').addEventListener('change', actualizarGrafico);
}

function crearGrafico() {
    const ctx = document.getElementById('grafico-ventas');
    if (!ctx) return;
    
    graficoVentas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ventas (S/.)',
                data: [],
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
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

function actualizarReporte() {
    actualizarEstadisticas();
    actualizarGrafico();
    actualizarTopProductos();
    actualizarUltimasVentas();
}

function actualizarGrafico() {
    if (!graficoVentas) return;
    
    const periodo = document.getElementById('periodo').value;
    const { labels, datos } = obtenerDatosGrafico(periodo);
    
    graficoVentas.data.labels = labels;
    graficoVentas.data.datasets[0].data = datos;
    graficoVentas.update();
    
    actualizarEstadisticas();
}

function obtenerDatosGrafico(periodo) {
    const hoy = new Date();
    let ventasFiltradas = [];
    
    switch(periodo) {
        case 'hoy':
            const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
            ventasFiltradas = datos.ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= inicioHoy && fechaVenta <= finHoy;
            });
            break;
            
        case 'semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - 6);
            inicioSemana.setHours(0, 0, 0, 0);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioSemana);
            break;
            
        case 'mes':
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioMes);
            break;
            
        case 'anio':
            const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioAnio);
            break;
    }
    
    return procesarDatos(ventasFiltradas, periodo);
}

function procesarDatos(ventas, periodo) {
    const datosAgrupados = {};
    
    if (ventas.length === 0) {
        return { labels: [], datos: [] };
    }
    
    if (periodo === 'hoy') {
        for (let hora = 8; hora <= 21; hora++) {
            datosAgrupados[`${hora}:00`] = 0;
        }
        
        ventas.forEach(venta => {
            const hora = new Date(venta.fecha).getHours();
            const horaClave = `${hora}:00`;
            if (datosAgrupados[horaClave] !== undefined) {
                datosAgrupados[horaClave] += venta.total;
            }
        });
        
    } else if (periodo === 'semana') {
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const hoy = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            const dia = dias[fecha.getDay()];
            datosAgrupados[dia] = 0;
        }
        
        ventas.forEach(venta => {
            const fechaVenta = new Date(venta.fecha);
            const dia = dias[fechaVenta.getDay()];
            if (datosAgrupados[dia] !== undefined) {
                datosAgrupados[dia] += venta.total;
            }
        });
        
    } else if (periodo === 'mes') {
        const hoy = new Date();
        const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= diasEnMes; i++) {
            datosAgrupados[i] = 0;
        }
        
        ventas.forEach(venta => {
            const fechaVenta = new Date(venta.fecha);
            const dia = fechaVenta.getDate();
            if (datosAgrupados[dia] !== undefined) {
                datosAgrupados[dia] += venta.total;
            }
        });
        
    } else if (periodo === 'anio') {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        meses.forEach(mes => {
            datosAgrupados[mes] = 0;
        });
        
        ventas.forEach(venta => {
            const fechaVenta = new Date(venta.fecha);
            const mes = fechaVenta.getMonth();
            const mesNombre = meses[mes];
            datosAgrupados[mesNombre] += venta.total;
        });
    }
    
    return {
        labels: Object.keys(datosAgrupados),
        datos: Object.values(datosAgrupados)
    };
}

function actualizarEstadisticas() {
    const periodo = document.getElementById('periodo').value;
    const hoy = new Date();
    let ventasFiltradas = [];
    
    switch(periodo) {
        case 'hoy':
            const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
            ventasFiltradas = datos.ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= inicioHoy && fechaVenta <= finHoy;
            });
            break;
        case 'semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - 6);
            inicioSemana.setHours(0, 0, 0, 0);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioSemana);
            break;
        case 'mes':
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioMes);
            break;
        case 'anio':
            const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
            ventasFiltradas = datos.ventas.filter(v => new Date(v.fecha) >= inicioAnio);
            break;
    }
    
    const ventasTotales = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
    const productosVendidos = ventasFiltradas.reduce((sum, v) => 
        sum + v.items.reduce((sumItems, item) => sumItems + item.cantidad, 0), 0);
    const clientesUnicos = new Set(ventasFiltradas.map(v => v.cliente)).size;
    
    document.getElementById('ventas-totales').textContent = `S/. ${ventasTotales.toFixed(2)}`;
    document.getElementById('cantidad-ventas').textContent = ventasFiltradas.length;
    document.getElementById('productos-vendidos').textContent = productosVendidos;
    document.getElementById('total-clientes').textContent = clientesUnicos;
}

function actualizarTopProductos() {
    const container = document.getElementById('top-productos');
    if (!container) return;
    
    const productosVendidos = {};
    
    datos.ventas.forEach(venta => {
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
    
    const topProductos = Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (topProductos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay ventas aún</p>';
        return;
    }
    
    topProductos.forEach((producto, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.8rem';
        div.style.background = '#fafafa';
        div.style.borderRadius = '8px';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 30px; height: 30px; background: #e91e63; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${index + 1}
                </div>
                <div>
                    <div style="font-weight: bold;">${producto.nombre}</div>
                    <small style="color: #666;">${producto.cantidad} unidades</small>
                </div>
            </div>
            <div style="font-weight: bold; color: #4caf50;">
                S/. ${producto.total.toFixed(2)}
            </div>
        `;
        
        container.appendChild(div);
    });
}

function actualizarUltimasVentas() {
    const container = document.getElementById('ultimas-ventas');
    if (!container) return;
    
    const ultimasVentas = [...datos.ventas]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);
    
    container.innerHTML = '';
    
    if (ultimasVentas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay ventas aún</p>';
        return;
    }
    
    ultimasVentas.forEach(venta => {
        const div = document.createElement('div');
        div.style.padding = '1rem';
        div.style.borderBottom = '1px solid #eee';
        
        const fecha = new Date(venta.fecha);
        const fechaStr = fecha.toLocaleDateString('es-PE');
        const horaStr = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                    <strong style="display: block; margin-bottom: 0.2rem;">${venta.cliente}</strong>
                    <small style="color: #666;">${fechaStr} ${horaStr}</small>
                </div>
                <span style="font-weight: bold; color: #e91e63;">S/. ${venta.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 0.85rem; color: #666;">
                ${venta.items.length} producto(s)
            </div>
        `;
        
        container.appendChild(div);
    });
}

function exportarReporte() {
    const periodo = document.getElementById('periodo').value;
    const hoy = new Date();
    
    let csv = 'Fecha,Cliente,Productos,Cantidad,Total\n';
    
    datos.ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-PE');
        const productos = venta.items.map(item => `${item.nombre} (${item.cantidad})`).join(', ');
        const cantidadTotal = venta.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        csv += `"${fecha}","${venta.cliente}","${productos}",${cantidadTotal},${venta.total}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-ventas-${periodo}-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion('Reporte exportado', 'exito');
}