// Reportes y Estadísticas - Jessica Boutique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Módulo de Reportes cargado');
    
    // Inicializar reportes
    inicializarReportes();
    
    // Configurar eventos
    configurarEventosReportes();
});

// Inicializar reportes
function inicializarReportes() {
    // Configurar fechas por defecto
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    document.getElementById('fechaInicio').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaFin').value = hoy.toISOString().split('T')[0];
    
    // Actualizar texto del período
    actualizarTextoPeriodo();
    
    // Generar reporte inicial
    generarReporte();
}

// Configurar eventos de reportes
function configurarEventosReportes() {
    // Generar reporte
    document.getElementById('generarReporte').addEventListener('click', generarReporte);
    
    // Exportar reporte
    document.getElementById('exportarReporte').addEventListener('click', exportarReporte);
    
    // Imprimir reporte
    document.getElementById('imprimirReporte').addEventListener('click', imprimirReporte);
    
    // Descargar PDF
    document.getElementById('descargarReporte').addEventListener('click', descargarPDF);
    
    // Cambio de período
    document.getElementById('periodoReporte').addEventListener('change', function() {
        const personalizado = this.value === 'personalizado';
        document.getElementById('fechaInicioContainer').style.display = personalizado ? 'block' : 'none';
        document.getElementById('fechaFinContainer').style.display = personalizado ? 'block' : 'none';
        actualizarTextoPeriodo();
    });
    
    // Cambio en gráfico de ventas
    document.getElementById('graficoVentasPeriodo').addEventListener('change', actualizarGraficaVentas);
    
    // Fechas personalizadas
    document.getElementById('fechaInicio').addEventListener('change', actualizarTextoPeriodo);
    document.getElementById('fechaFin').addEventListener('change', actualizarTextoPeriodo);
}

// Actualizar texto del período
function actualizarTextoPeriodo() {
    const periodo = document.getElementById('periodoReporte').value;
    let texto = '';
    
    switch(periodo) {
        case 'hoy':
            texto = 'Hoy';
            break;
        case 'semana':
            texto = 'Esta semana';
            break;
        case 'mes':
            texto = 'Este mes';
            break;
        case 'anio':
            texto = 'Este año';
            break;
        case 'personalizado':
            const inicio = document.getElementById('fechaInicio').value;
            const fin = document.getElementById('fechaFin').value;
            if (inicio && fin) {
                texto = `Desde ${formatearFecha(inicio)} hasta ${formatearFecha(fin)}`;
            } else {
                texto = 'Período personalizado';
            }
            break;
    }
    
    document.getElementById('periodoReporteTexto').textContent = `Período: ${texto}`;
    document.getElementById('fechaGeneracion').textContent = `Generado el: ${new Date().toLocaleDateString('es-PE')}`;
}

// Formatear fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Generar reporte completo
function generarReporte() {
    try {
        mostrarCargandoReporte();
        
        // Obtener parámetros
        const periodo = document.getElementById('periodoReporte').value;
        const tipo = document.getElementById('tipoReporte').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // Obtener datos
        const datos = SistemaDatos.obtenerDatos();
        const ventas = filtrarVentasPorPeriodo(periodo, fechaInicio, fechaFin);
        
        // Calcular métricas
        const metricas = calcularMetricas(ventas, datos);
        
        // Actualizar interfaz
        actualizarMetricas(metricas);
        actualizarTablasReporte(ventas, datos);
        actualizarGraficaVentas();
        actualizarGraficaCategorias(ventas, datos);
        actualizarReporteDetallado(ventas, datos, periodo, fechaInicio, fechaFin);
        
        ocultarCargandoReporte();
        mostrarMensaje('success', 'Reporte generado correctamente');
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        ocultarCargandoReporte();
        mostrarMensaje('error', 'Error al generar reporte');
    }
}

// Filtrar ventas por período
function filtrarVentasPorPeriodo(periodo, fechaInicio, fechaFin) {
    let ventas = SistemaDatos.obtenerVentas();
    const hoy = new Date();
    
    switch(periodo) {
        case 'hoy':
            const hoyStr = hoy.toISOString().split('T')[0];
            return ventas.filter(v => v.fecha === hoyStr);
            
        case 'semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            return ventas.filter(v => new Date(v.fecha) >= inicioSemana);
            
        case 'mes':
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            return ventas.filter(v => new Date(v.fecha) >= inicioMes);
            
        case 'anio':
            const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
            return ventas.filter(v => new Date(v.fecha) >= inicioAnio);
            
        case 'personalizado':
            if (fechaInicio && fechaFin) {
                return ventas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= new Date(fechaInicio) && 
                           fechaVenta <= new Date(fechaFin + 'T23:59:59');
                });
            }
            return ventas;
            
        default:
            return ventas;
    }
}

// Calcular métricas
function calcularMetricas(ventas, datos) {
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalTransacciones = ventas.length;
    
    // Calcular ganancias
    let ganancias = 0;
    ventas.forEach(venta => {
        venta.productos.forEach(item => {
            const producto = datos.productos.find(p => p.id === item.productoId);
            if (producto) {
                ganancias += (item.precio - producto.precioCompra) * item.cantidad;
            }
        });
    });
    
    // Calcular crecimiento (simulado)
    const crecimientoVentas = calcularCrecimientoVentas(ventas);
    const crecimientoGanancias = calcularCrecimientoGanancias(ventas, datos);
    
    // Productos vendidos
    let productosVendidos = 0;
    ventas.forEach(venta => {
        venta.productos.forEach(item => {
            productosVendidos += item.cantidad;
        });
    });
    
    // Clientes únicos
    const clientesUnicos = new Set(ventas.map(v => v.clienteId)).size;
    
    return {
        totalVentas,
        ganancias,
        totalTransacciones,
        productosVendidos,
        clientesUnicos,
        crecimientoVentas,
        crecimientoGanancias,
        crecimientoClientes: Math.round(Math.random() * 20) // Simulado
    };
}

// Calcular crecimiento de ventas (simulado)
function calcularCrecimientoVentas(ventas) {
    // En una implementación real, compararías con período anterior
    return Math.round(Math.random() * 30) - 10; // Entre -10% y +20%
}

// Calcular crecimiento de ganancias (simulado)
function calcularCrecimientoGanancias(ventas, datos) {
    // En una implementación real, compararías con período anterior
    return Math.round(Math.random() * 25) - 5; // Entre -5% y +20%
}

// Actualizar métricas en interfaz
function actualizarMetricas(metricas) {
    // Ventas
    document.getElementById('metricasVentas').textContent = `S/. ${metricas.totalVentas.toFixed(2)}`;
    const tendenciaVentas = document.getElementById('tendenciaVentas');
    tendenciaVentas.textContent = `${metricas.crecimientoVentas >= 0 ? '+' : ''}${metricas.crecimientoVentas}%`;
    tendenciaVentas.className = `metrica-tendencia ${metricas.crecimientoVentas >= 0 ? 'positivo' : 'negativo'}`;
    tendenciaVentas.innerHTML = `${metricas.crecimientoVentas >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'} ${metricas.crecimientoVentas}%`;
    
    // Ganancias
    document.getElementById('metricasGanancias').textContent = `S/. ${metricas.ganancias.toFixed(2)}`;
    const tendenciaGanancias = document.getElementById('tendenciaGanancias');
    tendenciaGanancias.textContent = `${metricas.crecimientoGanancias >= 0 ? '+' : ''}${metricas.crecimientoGanancias}%`;
    tendenciaGanancias.className = `metrica-tendencia ${metricas.crecimientoGanancias >= 0 ? 'positivo' : 'negativo'}`;
    tendenciaGanancias.innerHTML = `${metricas.crecimientoGanancias >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'} ${metricas.crecimientoGanancias}%`;
    
    // Clientes
    document.getElementById('metricasClientes').textContent = metricas.clientesUnicos;
    const tendenciaClientes = document.getElementById('tendenciaClientes');
    tendenciaClientes.textContent = `${metricas.crecimientoClientes >= 0 ? '+' : ''}${metricas.crecimientoClientes}%`;
    tendenciaClientes.className = `metrica-tendencia ${metricas.crecimientoClientes >= 0 ? 'positivo' : 'negativo'}`;
    tendenciaClientes.innerHTML = `${metricas.crecimientoClientes >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'} ${metricas.crecimientoClientes}%`;
    
    // Productos vendidos
    document.getElementById('metricasProductosVendidos').textContent = metricas.productosVendidos;
    const tendenciaProductos = document.getElementById('tendenciaProductos');
    tendenciaProductos.textContent = '+15%'; // Simulado
    tendenciaProductos.className = 'metrica-tendencia positivo';
}

// Actualizar tablas de reporte
function actualizarTablasReporte(ventas, datos) {
    actualizarTablaProductosTop(ventas, datos);
    actualizarTablaClientesTop(ventas, datos);
}

// Actualizar tabla de productos top
function actualizarTablaProductosTop(ventas, datos) {
    const tbody = document.getElementById('tablaProductosTop');
    tbody.innerHTML = '';
    
    // Agrupar productos vendidos
    const productosVendidos = {};
    
    ventas.forEach(venta => {
        venta.productos.forEach(item => {
            if (!productosVendidos[item.productoId]) {
                productosVendidos[item.productoId] = {
                    cantidad: 0,
                    total: 0
                };
            }
            productosVendidos[item.productoId].cantidad += item.cantidad;
            productosVendidos[item.productoId].total += item.precio * item.cantidad;
        });
    });
    
    // Convertir a array y ordenar
    const productosArray = Object.entries(productosVendidos).map(([productoId, datos]) => {
        const producto = datos.productos.find(p => p.id === parseInt(productoId));
        return {
            producto,
            ...datos
        };
    }).filter(item => item.producto);
    
    productosArray.sort((a, b) => b.cantidad - a.cantidad);
    
    // Mostrar top 5
    productosArray.slice(0, 5).forEach(item => {
        const row = document.createElement('tr');
        const tendencia = Math.random() > 0.5 ? 'alta' : 'media';
        
        row.innerHTML = `
            <td>${item.producto.nombre}</td>
            <td>${item.producto.categoria}</td>
            <td>${item.cantidad}</td>
            <td>S/. ${item.total.toFixed(2)}</td>
            <td>
                <span class="tendencia-${tendencia}">
                    <i class="fas fa-${tendencia === 'alta' ? 'arrow-up' : 'minus'}"></i>
                    ${tendencia === 'alta' ? 'Alta' : 'Media'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (productosArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay datos de productos vendidos</td>
            </tr>
        `;
    }
}

// Actualizar tabla de clientes top
function actualizarTablaClientesTop(ventas, datos) {
    const tbody = document.getElementById('tablaClientesTop');
    tbody.innerHTML = '';
    
    // Agrupar compras por cliente
    const comprasPorCliente = {};
    
    ventas.forEach(venta => {
        if (!comprasPorCliente[venta.clienteId]) {
            comprasPorCliente[venta.clienteId] = {
                compras: 0,
                total: 0,
                ultimaCompra: venta.fecha
            };
        }
        comprasPorCliente[venta.clienteId].compras++;
        comprasPorCliente[venta.clienteId].total += venta.total;
        if (new Date(venta.fecha) > new Date(comprasPorCliente[venta.clienteId].ultimaCompra)) {
            comprasPorCliente[venta.clienteId].ultimaCompra = venta.fecha;
        }
    });
    
    // Convertir a array y ordenar
    const clientesArray = Object.entries(comprasPorCliente).map(([clienteId, datos]) => {
        const cliente = datos.clientes.find(c => c.id === parseInt(clienteId));
        return {
            cliente: cliente || { nombre: `Cliente ${clienteId}`, dni: 'N/A' },
            ...datos
        };
    });
    
    clientesArray.sort((a, b) => b.total - a.total);
    
    // Mostrar top 5
    clientesArray.slice(0, 5).forEach(item => {
        const row = document.createElement('tr');
        const clasificacion = item.compras > 10 ? 'VIP' : item.compras > 5 ? 'Frecuente' : 'Ocasional';
        
        row.innerHTML = `
            <td>${item.cliente.nombre}</td>
            <td>${item.compras}</td>
            <td>S/. ${item.total.toFixed(2)}</td>
            <td>${formatearFecha(item.ultimaCompra)}</td>
            <td>
                <span class="clasificacion-${clasificacion.toLowerCase()}">
                    ${clasificacion}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (clientesArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay datos de clientes</td>
            </tr>
        `;
    }
}

// Actualizar gráfica de ventas
function actualizarGraficaVentas() {
    const canvas = document.getElementById('graficaVentas');
    const periodo = parseInt(document.getElementById('graficoVentasPeriodo').value) || 7;
    
    // Generar datos de ejemplo
    const datos = generarDatosVentas(periodo);
    dibujarGraficaVentas(canvas, datos);
}

// Generar datos de ventas para gráfica
function generarDatosVentas(dias) {
    const datos = [];
    const hoy = new Date();
    
    for (let i = dias - 1; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        
        // Datos simulados
        const ventas = Math.floor(Math.random() * 1000) + 500;
        datos.push({
            fecha: fecha.toLocaleDateString('es-PE', { weekday: 'short' }),
            ventas: ventas
        });
    }
    
    return datos;
}

// Dibujar gráfica de ventas
function dibujarGraficaVentas(contenedor, datos) {
    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = contenedor.clientWidth;
    canvas.height = 300;
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    
    contenedor.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Configurar gráfica
    const padding = 40;
    const ancho = canvas.width - padding * 2;
    const alto = canvas.height - padding * 2;
    
    // Encontrar máximo
    const maxVentas = Math.max(...datos.map(d => d.ventas));
    
    // Dibujar fondo
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar ejes
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Eje Y
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    
    // Eje X
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Dibujar líneas de guía
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // Guías horizontales
    for (let i = 1; i <= 5; i++) {
        const y = padding + (alto * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Etiquetas del eje Y
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const valor = (maxVentas * i / 5).toFixed(0);
        const y = canvas.height - padding - (alto * i / 5);
        ctx.fillText(`S/. ${valor}`, padding - 5, y + 4);
    }
    
    // Dibujar línea de ventas
    ctx.beginPath();
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    const espacio = ancho / (datos.length - 1);
    
    datos.forEach((dato, i) => {
        const x = padding + i * espacio;
        const y = canvas.height - padding - (dato.ventas / maxVentas) * alto;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Dibujar puntos
    ctx.fillStyle = '#9c27b0';
    
    datos.forEach((dato, i) => {
        const x = padding + i * espacio;
        const y = canvas.height - padding - (dato.ventas / maxVentas) * alto;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Etiquetas del eje X
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    datos.forEach((dato, i) => {
        const x = padding + i * espacio;
        const y = canvas.height - padding + 20;
        ctx.fillText(dato.fecha, x, y);
    });
}

// Actualizar gráfica de categorías
function actualizarGraficaCategorias(ventas, datos) {
    const contenedor = document.getElementById('graficaCategorias');
    
    // Agrupar ventas por categoría
    const ventasPorCategoria = {};
    
    ventas.forEach(venta => {
        venta.productos.forEach(item => {
            const producto = datos.productos.find(p => p.id === item.productoId);
            if (producto) {
                if (!ventasPorCategoria[producto.categoria]) {
                    ventasPorCategoria[producto.categoria] = 0;
                }
                ventasPorCategoria[producto.categoria] += item.precio * item.cantidad;
            }
        });
    });
    
    // Convertir a array
    const categoriasArray = Object.entries(ventasPorCategoria).map(([categoria, total]) => ({
        categoria,
        total
    }));
    
    // Dibujar gráfica
    dibujarGraficaCategorias(contenedor, categoriasArray);
}

// Dibujar gráfica de categorías
function dibujarGraficaCategorias(contenedor, datos) {
    if (datos.length === 0) {
        contenedor.innerHTML = `
            <div class="grafica-mensaje">
                <i class="fas fa-chart-pie"></i>
                <p>No hay datos de ventas por categoría</p>
            </div>
        `;
        return;
    }
    
    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = contenedor.clientWidth;
    canvas.height = 300;
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    
    contenedor.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Colores para las categorías
    const colores = ['#ff66b2', '#9c27b0', '#c8a2c8', '#4caf50', '#2196f3', '#ff9800', '#f44336'];
    
    // Calcular total
    const total = datos.reduce((sum, d) => sum + d.total, 0);
    
    // Dibujar gráfico de pastel
    let anguloInicio = 0;
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;
    const radio = Math.min(canvas.width, canvas.height) * 0.4;
    
    datos.forEach((dato, i) => {
        const angulo = (dato.total / total) * Math.PI * 2;
        
        // Dibujar segmento
        ctx.beginPath();
        ctx.fillStyle = colores[i % colores.length];
        ctx.moveTo(centroX, centroY);
        ctx.arc(centroX, centroY, radio, anguloInicio, anguloInicio + angulo);
        ctx.closePath();
        ctx.fill();
        
        // Dibujar borde
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Calcular posición de la etiqueta
        const anguloMedio = anguloInicio + angulo / 2;
        const etiquetaX = centroX + Math.cos(anguloMedio) * (radio * 0.7);
        const etiquetaY = centroY + Math.sin(anguloMedio) * (radio * 0.7);
        
        // Dibujar etiqueta
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round((dato.total / total) * 100)}%`, etiquetaX, etiquetaY);
        
        anguloInicio += angulo;
    });
    
    // Dibujar leyenda
    const leyendaY = centroY + radio + 30;
    const espacioLeyenda = 100;
    
    datos.forEach((dato, i) => {
        const x = (i % 3) * espacioLeyenda + 50;
        const y = leyendaY + Math.floor(i / 3) * 30;
        
        // Cuadro de color
        ctx.fillStyle = colores[i % colores.length];
        ctx.fillRect(x, y - 10, 15, 15);
        
        // Texto
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${dato.categoria} (S/. ${dato.total.toFixed(2)})`, x + 20, y - 2);
    });
}

// Actualizar reporte detallado
function actualizarReporteDetallado(ventas, datos, periodo, fechaInicio, fechaFin) {
    // Resumen ejecutivo
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    let ganancias = 0;
    ventas.forEach(venta => {
        venta.productos.forEach(item => {
            const producto = datos.productos.find(p => p.id === item.productoId);
            if (producto) {
                ganancias += (item.precio - producto.precioCompra) * item.cantidad;
            }
        });
    });
    
    const clientesUnicos = new Set(ventas.map(v => v.clienteId)).size;
    
    document.getElementById('resumenTotalVentas').textContent = `S/. ${totalVentas.toFixed(2)}`;
    document.getElementById('resumenTotalGanancias').textContent = `S/. ${ganancias.toFixed(2)}`;
    document.getElementById('resumenTransacciones').textContent = ventas.length;
    document.getElementById('resumenClientes').textContent = clientesUnicos;
    
    // Detalle de ventas
    const tbody = document.getElementById('detalleVentasReporte');
    tbody.innerHTML = '';
    
    ventas.slice(0, 10).forEach(venta => {
        const cliente = datos.clientes.find(c => c.id === venta.clienteId);
        const productosCount = venta.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatearFecha(venta.fecha)}</td>
            <td>${cliente?.nombre || 'Cliente no registrado'}</td>
            <td>${venta.productos.length} productos</td>
            <td>${productosCount}</td>
            <td>S/. ${venta.total.toFixed(2)}</td>
            <td>${venta.metodoPago || 'Efectivo'}</td>
        `;
        tbody.appendChild(row);
    });
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay ventas en este período</td>
            </tr>
        `;
    }
    
    // Análisis y recomendaciones
    actualizarAnalisisRecomendaciones(ventas, datos);
}

// Actualizar análisis y recomendaciones
function actualizarAnalisisRecomendaciones(ventas, datos) {
    const contenedor = document.getElementById('analisisRecomendaciones');
    
    if (ventas.length === 0) {
        contenedor.innerHTML = '<p>No hay datos suficientes para generar análisis.</p>';
        return;
    }
    
    // Análisis simple
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const promedioVenta = totalVentas / ventas.length;
    
    let analisisHTML = `
        <div class="analisis-item">
            <h4><i class="fas fa-chart-line"></i> Análisis del Período</h4>
            <ul>
                <li>Total de ventas: <strong>S/. ${totalVentas.toFixed(2)}</strong></li>
                <li>Número de transacciones: <strong>${ventas.length}</strong></li>
                <li>Ticket promedio: <strong>S/. ${promedioVenta.toFixed(2)}</strong></li>
            </ul>
        </div>
        
        <div class="analisis-item">
            <h4><i class="fas fa-lightbulb"></i> Recomendaciones</h4>
    `;
    
    // Recomendaciones basadas en datos simples
    if (promedioVenta < 100) {
        analisisHTML += `<p><i class="fas fa-arrow-up"></i> Considera aumentar el ticket promedio mediante combos o upselling.</p>`;
    }
    
    if (ventas.length < 10) {
        analisisHTML += `<p><i class="fas fa-bullhorn"></i> Podrías implementar promociones para aumentar el volumen de ventas.</p>`;
    }
    
    // Verificar productos con stock bajo
    const productosBajoStock = datos.productos.filter(p => p.estado === 'lowstock');
    if (productosBajoStock.length > 0) {
        analisisHTML += `<p><i class="fas fa-exclamation-triangle"></i> <strong>${productosBajoStock.length}</strong> productos tienen stock bajo. Considera reponerlos pronto.</p>`;
    }
    
    analisisHTML += `</div>`;
    
    contenedor.innerHTML = analisisHTML;
}

// Exportar reporte
function exportarReporte() {
    try {
        const datos = {
            fecha: new Date().toISOString(),
            tipo: document.getElementById('tipoReporte').value,
            periodo: document.getElementById('periodoReporteTexto').textContent,
            reporte: obtenerDatosReporte()
        };
        
        const datosStr = JSON.stringify(datos, null, 2);
        const blob = new Blob([datosStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-jessica-boutique-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarMensaje('success', 'Reporte exportado correctamente');
        
    } catch (error) {
        console.error('Error al exportar reporte:', error);
        mostrarMensaje('error', 'Error al exportar reporte');
    }
}

// Obtener datos del reporte
function obtenerDatosReporte() {
    // Esta función recopila todos los datos del reporte actual
    return {
        metricas: {
            ventas: document.getElementById('metricasVentas').textContent,
            ganancias: document.getElementById('metricasGanancias').textContent,
            clientes: document.getElementById('metricasClientes').textContent
        },
        // Agregar más datos según sea necesario
    };
}

// Imprimir reporte
function imprimirReporte() {
    const contenido = document.getElementById('reporteDetallado');
    const ventana = window.open('', '_blank');
    
    ventana.document.write(`
        <html>
        <head>
            <title>Reporte Jessica Boutique</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2, h3 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                .resumen-item { margin: 10px 0; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${contenedor.innerHTML}
        </body>
        </html>
    `);
    
    ventana.document.close();
    ventana.print();
}

// Descargar PDF (simulado)
function descargarPDF() {
    mostrarMensaje('info', 'La funcionalidad de PDF está en desarrollo. Por ahora, usa la opción de exportar JSON.');
    // En una implementación real, usarías una librería como jsPDF
}

// Mostrar cargando
function mostrarCargandoReporte() {
    const btnGenerar = document.getElementById('generarReporte');
    if (btnGenerar) {
        btnGenerar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        btnGenerar.disabled = true;
    }
}

// Ocultar cargando
function ocultarCargandoReporte() {
    const btnGenerar = document.getElementById('generarReporte');
    if (btnGenerar) {
        btnGenerar.innerHTML = '<i class="fas fa-chart-line"></i> Generar Reporte';
        btnGenerar.disabled = false;
    }
}

// Mostrar mensaje
function mostrarMensaje(tipo, mensaje) {
    if (window.Sistema && Sistema.mostrarMensaje) {
        Sistema.mostrarMensaje(tipo, mensaje);
        return;
    }
    
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}