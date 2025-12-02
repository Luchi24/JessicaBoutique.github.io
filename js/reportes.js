// Variables globales para gráficos
let graficoTendencia = null;
let graficoCategorias = null;

// Inicializar página de reportes
function inicializarReportes() {
    cargarDatosReportes();
    inicializarGraficos();
    inicializarEventosReportes();
}

function inicializarEventosReportes() {
    // Cambiar entre fechas personalizadas
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const fechasPersonalizadas = document.getElementById('fechas-personalizadas');
    
    if (filtroPeriodo && fechasPersonalizadas) {
        filtroPeriodo.addEventListener('change', function() {
            if (this.value === 'personalizado') {
                fechasPersonalizadas.style.display = 'flex';
            } else {
                fechasPersonalizadas.style.display = 'none';
                cargarDatosReportes();
            }
        });
    }
    
    // Fechas por defecto
    const fechaHasta = document.getElementById('fecha-hasta');
    const fechaDesde = document.getElementById('fecha-desde');
    
    if (fechaHasta) {
        const hoy = new Date();
        fechaHasta.value = hoy.toISOString().split('T')[0];
    }
    
    if (fechaDesde) {
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        fechaDesde.value = hace30Dias.toISOString().split('T')[0];
    }
}

function cambiarPeriodo() {
    cargarDatosReportes();
}

function aplicarFiltroPersonalizado() {
    cargarDatosReportes();
}

// Cargar datos para reportes
function cargarDatosReportes() {
    const periodo = document.getElementById('filtro-periodo').value;
    let fechaInicio, fechaFin;
    
    const hoy = new Date();
    
    switch(periodo) {
        case 'hoy':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
            break;
            
        case 'semana':
            const primerDiaSemana = hoy.getDate() - hoy.getDay();
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), primerDiaSemana);
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), primerDiaSemana + 6, 23, 59, 59);
            break;
            
        case 'mes':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
            break;
            
        case 'trimestre':
            const trimestre = Math.floor(hoy.getMonth() / 3);
            fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1);
            fechaFin = new Date(hoy.getFullYear(), (trimestre + 1) * 3, 0, 23, 59, 59);
            break;
            
        case 'anio':
            fechaInicio = new Date(hoy.getFullYear(), 0, 1);
            fechaFin = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);
            break;
            
        case 'personalizado':
            const fechaDesde = document.getElementById('fecha-desde').value;
            const fechaHasta = document.getElementById('fecha-hasta').value;
            
            if (!fechaDesde || !fechaHasta) {
                mostrarNotificacion('Selecciona ambas fechas', 'error');
                return;
            }
            
            fechaInicio = new Date(fechaDesde);
            fechaFin = new Date(fechaHasta);
            fechaFin.setHours(23, 59, 59);
            break;
            
        default:
            fechaInicio = new Date(0);
            fechaFin = new Date();
    }
    
    // Filtrar ventas por periodo
    const ventasFiltradas = datos.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });
    
    // Actualizar resumen
    actualizarResumenReportes(ventasFiltradas);
    
    // Actualizar tabla
    actualizarTablaVentas(ventasFiltradas);
    
    // Actualizar estadísticas
    actualizarEstadisticasAvanzadas(ventasFiltradas);
    
    // Actualizar gráficos
    actualizarGraficos(ventasFiltradas);
    
    // Actualizar informe de inventario
    actualizarInformeInventario();
}

function actualizarResumenReportes(ventas) {
    // Calcular totales
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const gananciaTotal = ventas.reduce((sum, v) => sum + v.gananciaTotal, 0);
    const productosVendidos = ventas.reduce((sum, v) => 
        sum + v.items.reduce((sumItems, item) => sumItems + item.cantidad, 0), 0);
    
    // Clientes únicos
    const clientesUnicos = new Set(ventas.map(v => v.cliente.nombre)).size;
    
    // Margen de ganancia
    const margenGanancia = totalVentas > 0 ? ((gananciaTotal / totalVentas) * 100) : 0;
    
    // Actualizar elementos del DOM
    const ventasTotalesElement = document.getElementById('ventas-totales');
    const ventasCantidadElement = document.getElementById('ventas-cantidad');
    const gananciaReporteElement = document.getElementById('ganancia-reporte');
    const margenGananciaElement = document.getElementById('margen-ganancia');
    const productosVendidosElement = document.getElementById('productos-vendidos');
    const clientesAtendidosElement = document.getElementById('clientes-atendidos');
    
    if (ventasTotalesElement) ventasTotalesElement.textContent = `S/. ${totalVentas.toFixed(2)}`;
    if (ventasCantidadElement) ventasCantidadElement.textContent = `${ventas.length} ventas`;
    if (gananciaReporteElement) gananciaReporteElement.textContent = `S/. ${gananciaTotal.toFixed(2)}`;
    if (margenGananciaElement) margenGananciaElement.textContent = `${margenGanancia.toFixed(1)}% margen`;
    if (productosVendidosElement) productosVendidosElement.textContent = productosVendidos;
    if (clientesAtendidosElement) clientesAtendidosElement.textContent = clientesUnicos;
}

function actualizarTablaVentas(ventas) {
    const listaVentas = document.getElementById('lista-ventas-reporte');
    if (!listaVentas) return;
    
    listaVentas.innerHTML = '';
    
    // Ordenar por fecha (más reciente primero)
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const hora = new Date(venta.fecha).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const cantidadTotal = venta.items.reduce((sum, item) => sum + item.cantidad, 0);
        const productosLista = venta.items.slice(0, 2).map(item => item.nombre).join(', ');
        const productosExtra = venta.items.length > 2 ? ` +${venta.items.length - 2} más` : '';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${venta.id}</td>
            <td>
                <div>${fecha}</div>
                <small>${hora}</small>
            </td>
            <td>${venta.cliente.nombre}</td>
            <td>${productosLista}${productosExtra}</td>
            <td>${cantidadTotal}</td>
            <td>S/. ${venta.total.toFixed(2)}</td>
            <td style="color: var(--verde);">S/. ${venta.gananciaTotal.toFixed(2)}</td>
            <td>
                <span class="badge" style="background: ${getColorMetodoPago(venta.metodoPago)}">
                    ${venta.metodoPago}
                </span>
            </td>
            <td>
                <button class="btn-editar" onclick="verDetalleVenta(${venta.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        listaVentas.appendChild(fila);
    });
}

function getColorMetodoPago(metodo) {
    const colores = {
        'efectivo': '#4caf50',
        'tarjeta': '#2196f3',
        'transferencia': '#9c27b0'
    };
    return colores[metodo] || '#757575';
}

function verDetalleVenta(idVenta) {
    const venta = datos.ventas.find(v => v.id === idVenta);
    if (!venta) return;
    
    const modalBody = document.getElementById('modal-detalle-venta-body');
    if (!modalBody) return;
    
    // Reutilizar la función de mostrar comprobante desde ventas.js
    if (typeof mostrarComprobante === 'function') {
        mostrarComprobante(venta);
    } else {
        // Fallback si la función no está disponible
        modalBody.innerHTML = `
            <div class="info-venta">
                <p><strong>Venta #:</strong> ${venta.id}</p>
                <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-PE')}</p>
                <p><strong>Cliente:</strong> ${venta.cliente.nombre}</p>
                <p><strong>Total:</strong> S/. ${venta.total.toFixed(2)}</p>
                <p><strong>Ganancia:</strong> S/. ${venta.gananciaTotal.toFixed(2)}</p>
            </div>
            <button class="btn-principal" onclick="cerrarModal('modal-detalle-venta')" style="margin-top: 1rem;">
                Cerrar
            </button>
        `;
        
        document.getElementById('modal-detalle-venta').style.display = 'flex';
    }
}

// Inicializar gráficos
function inicializarGraficos() {
    const ctxTendencia = document.getElementById('grafico-tendencia');
    const ctxCategorias = document.getElementById('grafico-categorias');
    
    if (ctxTendencia) {
        graficoTendencia = new Chart(ctxTendencia, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ventas (S/.)',
                    data: [],
                    borderColor: 'rgb(233, 30, 99)',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
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
    
    if (ctxCategorias) {
        graficoCategorias = new Chart(ctxCategorias, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgb(233, 30, 99)',
                        'rgb(156, 39, 176)',
                        'rgb(33, 150, 243)',
                        'rgb(76, 175, 80)',
                        'rgb(255, 193, 7)',
                        'rgb(255, 87, 34)',
                        'rgb(96, 125, 139)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
}

function actualizarGraficos(ventas) {
    actualizarGraficoTendencia(ventas);
    actualizarGraficoCategorias(ventas);
}

function actualizarGraficoTendencia() {
    const tipo = document.getElementById('filtro-tendencia').value;
    const ventasFiltradas = obtenerVentasParaGraficoTendencia(tipo);
    
    if (!graficoTendencia || !ventasFiltradas) return;
    
    const { labels, datos } = procesarDatosTendencia(ventasFiltradas, tipo);
    
    graficoTendencia.data.labels = labels;
    graficoTendencia.data.datasets[0].data = datos;
    graficoTendencia.update();
}

function obtenerVentasParaGraficoTendencia(tipo) {
    const periodo = document.getElementById('filtro-periodo').value;
    let fechaInicio, fechaFin;
    
    const hoy = new Date();
    
    switch(tipo) {
        case 'diario':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7);
            fechaFin = new Date();
            break;
        case 'semanal':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 30);
            fechaFin = new Date();
            break;
        case 'mensual':
            fechaInicio = new Date(hoy.getFullYear(), 0, 1);
            fechaFin = new Date();
            break;
        default:
            fechaInicio = new Date(0);
            fechaFin = new Date();
    }
    
    return datos.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });
}

function procesarDatosTendencia(ventas, tipo) {
    const datosAgrupados = {};
    const hoy = new Date();
    
    // Inicializar datos según el tipo
    if (tipo === 'diario') {
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            const clave = fecha.toLocaleDateString('es-PE', { weekday: 'short' });
            datosAgrupados[clave] = 0;
        }
    } else if (tipo === 'semanal') {
        for (let i = 3; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - (i * 7));
            const semana = `Sem ${Math.ceil(fecha.getDate() / 7)}`;
            datosAgrupados[semana] = 0;
        }
    } else if (tipo === 'mensual') {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        meses.slice(0, hoy.getMonth() + 1).forEach(mes => {
            datosAgrupados[mes] = 0;
        });
    }
    
    // Agrupar ventas
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha);
        let clave;
        
        if (tipo === 'diario') {
            clave = fecha.toLocaleDateString('es-PE', { weekday: 'short' });
        } else if (tipo === 'semanal') {
            clave = `Sem ${Math.ceil(fecha.getDate() / 7)}`;
        } else if (tipo === 'mensual') {
            clave = fecha.toLocaleDateString('es-PE', { month: 'short' });
        }
        
        if (datosAgrupados[clave] !== undefined) {
            datosAgrupados[clave] += venta.total;
        }
    });
    
    return {
        labels: Object.keys(datosAgrupados),
        datos: Object.values(datosAgrupados)
    };
}

function actualizarGraficoCategorias(ventas) {
    if (!graficoCategorias) return;
    
    // Calcular ventas por categoría
    const ventasPorCategoria = {};
    
    ventas.forEach(venta => {
        venta.items.forEach(item => {
            // Obtener categoría del producto
            const producto = datos.productos[item.productoIndex];
            if (producto && producto.categoria) {
                const categoria = producto.categoria;
                ventasPorCategoria[categoria] = (ventasPorCategoria[categoria] || 0) + item.subtotal;
            }
        });
    });
    
    // Ordenar por valor y tomar top 5
    const categoriasOrdenadas = Object.entries(ventasPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    graficoCategorias.data.labels = categoriasOrdenadas.map(([categoria]) => categoria);
    graficoCategorias.data.datasets[0].data = categoriasOrdenadas.map(([, valor]) => valor);
    graficoCategorias.update();
}

function actualizarEstadisticasAvanzadas(ventas) {
    actualizarTopProductos(ventas);
    actualizarTopClientes(ventas);
    actualizarHorariosPico(ventas);
}

function actualizarTopProductos(ventas) {
    const topProductosElement = document.getElementById('top-productos');
    if (!topProductosElement) return;
    
    // Contar ventas por producto
    const productosVendidos = {};
    
    ventas.forEach(venta => {
        venta.items.forEach(item => {
            const key = `${item.nombre}`;
            if (!productosVendidos[key]) {
                productosVendidos[key] = {
                    nombre: item.nombre,
                    cantidad: 0,
                    total: 0,
                    ganancia: 0
                };
            }
            productosVendidos[key].cantidad += item.cantidad;
            productosVendidos[key].total += item.subtotal;
            productosVendidos[key].ganancia += (item.precioVenta - item.precioCompra) * item.cantidad;
        });
    });
    
    // Ordenar por cantidad vendida
    const topProductos = Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
    
    topProductosElement.innerHTML = '';
    
    topProductos.forEach((producto, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-top';
        itemDiv.innerHTML = `
            <div class="posicion">${index + 1}</div>
            <div class="info-item">
                <div class="nombre-item">${producto.nombre}</div>
                <div class="detalle-item">${producto.cantidad} unidades</div>
            </div>
            <div class="valor-item">S/. ${producto.total.toFixed(2)}</div>
        `;
        topProductosElement.appendChild(itemDiv);
    });
    
    if (topProductos.length === 0) {
        topProductosElement.innerHTML = '<p style="text-align: center; color: var(--gris-oscuro);">No hay datos</p>';
    }
}

function actualizarTopClientes(ventas) {
    const topClientesElement = document.getElementById('top-clientes');
    if (!topClientesElement) return;
    
    // Agrupar por cliente
    const clientes = {};
    
    ventas.forEach(venta => {
        const nombreCliente = venta.cliente.nombre;
        if (!clientes[nombreCliente]) {
            clientes[nombreCliente] = {
                nombre: nombreCliente,
                compras: 0,
                total: 0
            };
        }
        clientes[nombreCliente].compras++;
        clientes[nombreCliente].total += venta.total;
    });
    
    // Ordenar por total gastado
    const topClientes = Object.values(clientes)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    
    topClientesElement.innerHTML = '';
    
    topClientes.forEach((cliente, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-top';
        itemDiv.innerHTML = `
            <div class="posicion">${index + 1}</div>
            <div class="info-item">
                <div class="nombre-item">${cliente.nombre}</div>
                <div class="detalle-item">${cliente.compras} compras</div>
            </div>
            <div class="valor-item">S/. ${cliente.total.toFixed(2)}</div>
        `;
        topClientesElement.appendChild(itemDiv);
    });
    
    if (topClientes.length === 0) {
        topClientesElement.innerHTML = '<p style="text-align: center; color: var(--gris-oscuro);">No hay datos</p>';
    }
}

function actualizarHorariosPico(ventas) {
    const horariosPicoElement = document.getElementById('horarios-pico');
    if (!horariosPicoElement) return;
    
    // Agrupar por hora
    const horas = {};
    
    for (let i = 9; i <= 21; i++) {
        horas[`${i}:00`] = 0;
    }
    
    ventas.forEach(venta => {
        const horaVenta = new Date(venta.fecha).getHours();
        const horaRedondeada = `${horaVenta}:00`;
        
        if (horas[horaRedondeada] !== undefined) {
            horas[horaRedondeada] += venta.total;
        }
    });
    
    // Convertir a array y ordenar
    const horasOrdenadas = Object.entries(horas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    horariosPicoElement.innerHTML = '';
    
    horasOrdenadas.forEach(([hora, total]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-top';
        itemDiv.innerHTML = `
            <div class="info-item">
                <div class="nombre-item">${hora}</div>
                <div class="detalle-item">Hora pico</div>
            </div>
            <div class="valor-item">S/. ${total.toFixed(2)}</div>
        `;
        horariosPicoElement.appendChild(itemDiv);
    });
    
    if (horasOrdenadas.length === 0) {
        horariosPicoElement.innerHTML = '<p style="text-align: center; color: var(--gris-oscuro);">No hay datos</p>';
    }
}

function actualizarInformeInventario() {
    // Productos con stock
    const productosConStock = datos.productos.filter(p => p.cantidad > 0).length;
    const stockBajo = datos.productos.filter(p => p.cantidad < 5 && p.cantidad > 0).length;
    const productosAgotados = datos.productos.filter(p => p.cantidad === 0).length;
    const valorInventario = datos.productos.reduce((sum, p) => 
        sum + (p.precioCompra * p.cantidad), 0);
    
    // Actualizar elementos
    const productosConStockElement = document.getElementById('productos-con-stock');
    const stockBajoElement = document.getElementById('stock-bajo-reporte');
    const productosAgotadosElement = document.getElementById('productos-agotados');
    const valorInventarioElement = document.getElementById('valor-inventario');
    
    if (productosConStockElement) productosConStockElement.textContent = productosConStock;
    if (stockBajoElement) {
        stockBajoElement.textContent = stockBajo;
        const indicador = stockBajoElement.closest('.indicador');
        if (indicador && stockBajo > 0) {
            indicador.classList.add('critico');
        } else if (indicador) {
            indicador.classList.remove('critico');
        }
    }
    if (productosAgotadosElement) productosAgotadosElement.textContent = productosAgotados;
    if (valorInventarioElement) valorInventarioElement.textContent = `S/. ${valorInventario.toFixed(2)}`;
}

// Exportar funciones
function exportarReporteExcel() {
    // Crear datos para exportar
    const periodo = document.getElementById('filtro-periodo').value;
    const ventasFiltradas = obtenerVentasFiltradas(periodo);
    
    if (ventasFiltradas.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    // Crear contenido CSV
    let csv = 'ID,Fecha,Cliente,Productos,Cantidad,Subtotal,IGV,Total,Ganancia,Método\n';
    
    ventasFiltradas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-PE');
        const productos = venta.items.map(item => 
            `${item.nombre} (${item.cantidad}x S/.${item.precioVenta})`
        ).join('; ');
        const cantidadTotal = venta.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        csv += `${venta.id},"${fecha}","${venta.cliente.nombre}","${productos}",${cantidadTotal},${venta.subtotal},${venta.igv},${venta.total},${venta.gananciaTotal},${venta.metodoPago}\n`;
    });
    
    // Crear archivo y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-ventas-${periodo}-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion('Reporte exportado exitosamente', 'exito');
}

function obtenerVentasFiltradas(periodo) {
    const hoy = new Date();
    let fechaInicio, fechaFin;
    
    switch(periodo) {
        case 'hoy':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
            break;
        case 'semana':
            const primerDiaSemana = hoy.getDate() - hoy.getDay();
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), primerDiaSemana);
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), primerDiaSemana + 6, 23, 59, 59);
            break;
        case 'mes':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
            break;
        default:
            fechaInicio = new Date(0);
            fechaFin = new Date();
    }
    
    return datos.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });
}

function imprimirReporte() {
    mostrarNotificacion('La función de impresión está en desarrollo', 'info');
    // En una implementación completa, aquí se generaría un PDF
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarReportes);
} else {
    inicializarReportes();
}