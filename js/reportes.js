// Reportes - JavaScript específico
let reporteActual = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Reportes - Inicializando...');
    
    // Configurar eventos
    configurarEventosReportes();
    
    // Cargar reporte inicial
    generarReporteInicial();
});

function configurarEventosReportes() {
    // Generar reporte
    const btnGenerar = document.getElementById('generarReporte');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', function() {
            generarReporte();
        });
    }
    
    // Exportar reporte
    const btnExportar = document.getElementById('exportarReporte');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarReporte();
        });
    }
    
    // Imprimir reporte
    const btnImprimir = document.getElementById('imprimirReporte');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', function() {
            imprimirReporte();
        });
    }
    
    // Descargar PDF
    const btnDescargar = document.getElementById('descargarReporte');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', function() {
            descargarPDF();
        });
    }
    
    // Cambio de período
    const selectPeriodo = document.getElementById('periodoReporte');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', function() {
            mostrarOcultarFechasPersonalizadas();
        });
    }
    
    // Cambio de gráfico de ventas
    const selectGrafico = document.getElementById('graficoVentasPeriodo');
    if (selectGrafico) {
        selectGrafico.addEventListener('change', function() {
            actualizarGraficaVentas();
        });
    }
    
    // Inicializar fechas personalizadas
    mostrarOcultarFechasPersonalizadas();
}

function mostrarOcultarFechasPersonalizadas() {
    const selectPeriodo = document.getElementById('periodoReporte');
    const fechaInicioContainer = document.getElementById('fechaInicioContainer');
    const fechaFinContainer = document.getElementById('fechaFinContainer');
    
    if (!selectPeriodo || !fechaInicioContainer || !fechaFinContainer) return;
    
    if (selectPeriodo.value === 'personalizado') {
        fechaInicioContainer.style.display = 'block';
        fechaFinContainer.style.display = 'block';
    } else {
        fechaInicioContainer.style.display = 'none';
        fechaFinContainer.style.display = 'none';
    }
}

function generarReporteInicial() {
    // Generar reporte del día actual por defecto
    generarReporte();
}

function generarReporte() {
    const periodo = document.getElementById('periodoReporte').value;
    const tipoReporte = document.getElementById('tipoReporte').value;
    
    // Obtener fechas si es personalizado
    let fechaInicio = null;
    let fechaFin = null;
    
    if (periodo === 'personalizado') {
        fechaInicio = document.getElementById('fechaInicio').value;
        fechaFin = document.getElementById('fechaFin').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Por favor, selecciona ambas fechas para el período personalizado');
            return;
        }
        
        if (fechaInicio > fechaFin) {
            alert('La fecha de inicio no puede ser mayor a la fecha de fin');
            return;
        }
    }
    
    // Generar reporte según tipo
    switch(tipoReporte) {
        case 'ventas':
            generarReporteVentas(periodo, fechaInicio, fechaFin);
            break;
        case 'productos':
            generarReporteProductos(periodo, fechaInicio, fechaFin);
            break;
        case 'clientes':
            generarReporteClientes(periodo, fechaInicio, fechaFin);
            break;
        case 'inventario':
            generarReporteInventario();
            break;
    }
    
    // Actualizar período en el reporte detallado
    actualizarPeriodoReporteTexto(periodo, fechaInicio, fechaFin);
    
    // Actualizar métricas principales
    actualizarMetricasPrincipales();
}

function obtenerVentasPorPeriodo(periodo, fechaInicio, fechaFin) {
    let ventas = SistemaDatos.obtenerVentas();
    
    // Si no hay ventas, retornar array vacío
    if (!ventas || ventas.length === 0) {
        return [];
    }
    
    // Filtrar por período
    switch(periodo) {
        case 'hoy':
            const hoy = new Date().toISOString().split('T')[0];
            ventas = ventas.filter(v => v.fecha === hoy);
            break;
            
        case 'semana':
            const hoySemana = new Date();
            const inicioSemana = new Date(hoySemana);
            inicioSemana.setDate(hoySemana.getDate() - hoySemana.getDay());
            ventas = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= inicioSemana && fechaVenta <= hoySemana;
            });
            break;
            
        case 'mes':
            const hoyMes = new Date();
            const inicioMes = new Date(hoyMes.getFullYear(), hoyMes.getMonth(), 1);
            ventas = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= inicioMes && fechaVenta <= hoyMes;
            });
            break;
            
        case 'anio':
            const hoyAnio = new Date();
            const inicioAnio = new Date(hoyAnio.getFullYear(), 0, 1);
            ventas = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= inicioAnio && fechaVenta <= hoyAnio;
            });
            break;
            
        case 'personalizado':
            if (fechaInicio && fechaFin) {
                const inicio = new Date(fechaInicio);
                const fin = new Date(fechaFin);
                ventas = ventas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= inicio && fechaVenta <= fin;
                });
            }
            break;
    }
    
    return ventas;
}

function generarReporteVentas(periodo, fechaInicio, fechaFin) {
    const ventas = obtenerVentasPorPeriodo(periodo, fechaInicio, fechaFin);
    
    // Calcular estadísticas
    const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0);
    const totalTransacciones = ventas.length;
    const promedioVenta = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;
    
    // Obtener productos más vendidos
    const productosMasVendidos = obtenerProductosMasVendidos(ventas, 5);
    
    // Obtener ventas por método de pago
    const ventasPorMetodo = obtenerVentasPorMetodoPago(ventas);
    
    // Guardar reporte actual
    reporteActual = {
        tipo: 'ventas',
        periodo,
        fechaInicio,
        fechaFin,
        ventas,
        totalVentas,
        totalTransacciones,
        promedioVenta,
        productosMasVendidos,
        ventasPorMetodo
    };
    
    // Actualizar UI
    actualizarReporteVentasUI();
    actualizarGraficaVentas();
    actualizarGraficaCategorias();
    actualizarTablaProductosTop(productosMasVendidos);
}

function obtenerProductosMasVendidos(ventas, limite = 5) {
    const productos = SistemaDatos.obtenerProductos();
    const ventasPorProducto = {};
    
    // Contar ventas por producto
    ventas.forEach(venta => {
        if (venta.productos) {
            venta.productos.forEach(item => {
                if (!ventasPorProducto[item.productoId]) {
                    ventasPorProducto[item.productoId] = {
                        cantidad: 0,
                        total: 0
                    };
                }
                ventasPorProducto[item.productoId].cantidad += item.cantidad;
                ventasPorProducto[item.productoId].total += item.precio * item.cantidad;
            });
        }
    });
    
    // Convertir a array y ordenar
    const resultado = Object.entries(ventasPorProducto).map(([productoId, datos]) => {
        const producto = productos.find(p => p.id === parseInt(productoId));
        return {
            producto,
            cantidadVendida: datos.cantidad,
            totalVentas: datos.total
        };
    })
    .filter(item => item.producto) // Filtrar productos no encontrados
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, limite);
    
    return resultado;
}

function obtenerVentasPorMetodoPago(ventas) {
    const metodos = {};
    
    ventas.forEach(venta => {
        const metodo = venta.metodoPago || 'efectivo';
        if (!metodos[metodo]) {
            metodos[metodo] = {
                cantidad: 0,
                total: 0
            };
        }
        metodos[metodo].cantidad++;
        metodos[metodo].total += venta.total;
    });
    
    return Object.entries(metodos).map(([metodo, datos]) => ({
        metodo,
        cantidad: datos.cantidad,
        total: datos.total
    }));
}

function actualizarReporteVentasUI() {
    if (!reporteActual) return;
    
    // Actualizar resumen ejecutivo
    const resumenTotalVentas = document.getElementById('resumenTotalVentas');
    const resumenTransacciones = document.getElementById('resumenTransacciones');
    const resumenClientes = document.getElementById('resumenClientes');
    
    if (resumenTotalVentas) {
        resumenTotalVentas.textContent = `S/. ${reporteActual.totalVentas.toFixed(2)}`;
    }
    
    if (resumenTransacciones) {
        resumenTransacciones.textContent = reporteActual.totalTransacciones;
    }
    
    if (resumenClientes) {
        // Contar clientes únicos
        const clientesUnicos = new Set(reporteActual.ventas.map(v => v.clienteId));
        resumenClientes.textContent = clientesUnicos.size;
    }
    
    // Actualizar detalle de ventas
    const tbody = document.getElementById('detalleVentasReporte');
    if (tbody) {
        tbody.innerHTML = '';
        
        if (reporteActual.ventas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay ventas en este período</td>
                </tr>
            `;
            return;
        }
        
        // Limitar a 50 ventas para no sobrecargar la tabla
        const ventasMostrar = reporteActual.ventas.slice(0, 50);
        
        ventasMostrar.forEach(venta => {
            const cliente = SistemaDatos.obtenerClientes().find(c => c.id === venta.clienteId);
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${venta.fecha}</td>
                <td>${cliente ? cliente.nombre : 'Cliente no encontrado'}</td>
                <td>${venta.productos ? venta.productos.length : 0} productos</td>
                <td>${venta.productos ? venta.productos.reduce((total, p) => total + p.cantidad, 0) : 0}</td>
                <td>S/. ${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
                <td>${venta.metodoPago || 'Efectivo'}</td>
            `;
            
            tbody.appendChild(fila);
        });
        
        if (reporteActual.ventas.length > 50) {
            const filaInfo = document.createElement('tr');
            filaInfo.innerHTML = `
                <td colspan="6" class="text-center">
                    <em>Mostrando 50 de ${reporteActual.ventas.length} ventas</em>
                </td>
            `;
            tbody.appendChild(filaInfo);
        }
    }
    
    // Actualizar análisis y recomendaciones
    const analisis = document.getElementById('analisisRecomendaciones');
    if (analisis) {
        let html = '';
        
        if (reporteActual.totalTransacciones === 0) {
            html = '<p>No hay ventas en el período seleccionado para analizar.</p>';
        } else {
            const promedio = reporteActual.totalVentas / reporteActual.totalTransacciones;
            
            html = `
                <h4>Análisis del Período</h4>
                <ul>
                    <li><strong>Ventas Totales:</strong> S/. ${reporteActual.totalVentas.toFixed(2)}</li>
                    <li><strong>Transacciones:</strong> ${reporteActual.totalTransacciones}</li>
                    <li><strong>Ticket Promedio:</strong> S/. ${promedio.toFixed(2)}</li>
                    <li><strong>Ventas por Día:</strong> ${(reporteActual.totalVentas / (reporteActual.ventas.length > 0 ? new Set(reporteActual.ventas.map(v => v.fecha)).size : 1)).toFixed(2)}</li>
                </ul>
                
                <h4>Recomendaciones</h4>
                <ul>
                    <li>Promociona los productos más vendidos para aumentar las ventas</li>
                    <li>Considera ofrecer descuentos en métodos de pago menos utilizados</li>
                    <li>Analiza los días con menos ventas para implementar promociones especiales</li>
                </ul>
            `;
        }
        
        analisis.innerHTML = html;
    }
}

function actualizarGraficaVentas() {
    const grafica = document.getElementById('graficaVentas');
    if (!grafica) return;
    
    // En una implementación real, usaríamos una librería como Chart.js
    // Por ahora, mostramos un mensaje
    grafica.innerHTML = `
        <div class="grafica-mensaje">
            <i class="fas fa-chart-bar"></i>
            <p>Gráfico de ventas generado para el período seleccionado</p>
            <small>En una implementación completa, aquí se mostraría un gráfico interactivo</small>
        </div>
    `;
}

function actualizarGraficaCategorias() {
    const grafica = document.getElementById('graficaCategorias');
    if (!grafica) return;
    
    // En una implementación real, usaríamos una librería como Chart.js
    // Por ahora, mostramos un mensaje
    grafica.innerHTML = `
        <div class="grafica-mensaje">
            <i class="fas fa-chart-pie"></i>
            <p>Distribución de ventas por categoría</p>
            <small>En una implementación completa, aquí se mostraría un gráfico de pastel</small>
        </div>
    `;
}

function actualizarTablaProductosTop(productos) {
    const tbody = document.getElementById('tablaProductosTop');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay datos de productos vendidos</td>
            </tr>
        `;
        return;
    }
    
    productos.forEach(item => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${item.producto ? item.producto.nombre : 'Producto no encontrado'}</td>
            <td>${item.producto ? item.producto.categoria : 'N/A'}</td>
            <td>${item.cantidadVendida}</td>
            <td>S/. ${item.totalVentas.toFixed(2)}</td>
            <td>
                ${item.cantidadVendida > 10 ? 
                    '<span class="badge-tendencia alta"><i class="fas fa-arrow-up"></i> Alta</span>' :
                    item.cantidadVendida > 5 ?
                    '<span class="badge-tendencia media"><i class="fas fa-minus"></i> Media</span>' :
                    '<span class="badge-tendencia baja"><i class="fas fa-arrow-down"></i> Baja</span>'
                }
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}

function actualizarTablaClientesTop() {
    const tbody = document.getElementById('tablaClientesTop');
    if (!tbody) return;
    
    // Obtener clientes y sus compras
    const clientes = SistemaDatos.obtenerClientes();
    const ventas = SistemaDatos.obtenerVentas();
    
    // Calcular estadísticas por cliente
    const clientesConEstadisticas = clientes.map(cliente => {
        const comprasCliente = ventas.filter(v => v.clienteId === cliente.id);
        const totalGastado = comprasCliente.reduce((total, v) => total + v.total, 0);
        
        return {
            ...cliente,
            compras: comprasCliente.length,
            totalGastado,
            ultimaCompra: comprasCliente.length > 0 ? 
                comprasCliente[comprasCliente.length - 1].fecha : 'Nunca'
        };
    })
    .filter(c => c.compras > 0)
    .sort((a, b) => b.totalGastado - a.totalGastado)
    .slice(0, 10);
    
    // Actualizar tabla
    tbody.innerHTML = '';
    
    if (clientesConEstadisticas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No hay datos de clientes</td>
            </tr>
        `;
        return;
    }
    
    clientesConEstadisticas.forEach(cliente => {
        const fila = document.createElement('tr');
        
        // Determinar clasificación
        let clasificacion = 'Nuevo';
        if (cliente.compras > 10) {
            clasificacion = 'VIP';
        } else if (cliente.compras > 5) {
            clasificacion = 'Frecuente';
        } else if (cliente.compras > 2) {
            clasificacion = 'Ocasional';
        }
        
        fila.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${cliente.compras}</td>
            <td>S/. ${cliente.totalGastado.toFixed(2)}</td>
            <td>${cliente.ultimaCompra}</td>
            <td><span class="badge-clasificacion ${clasificacion.toLowerCase()}">${clasificacion}</span></td>
        `;
        
        tbody.appendChild(fila);
    });
}

function generarReporteProductos(periodo, fechaInicio, fechaFin) {
    const ventas = obtenerVentasPorPeriodo(periodo, fechaInicio, fechaFin);
    const productos = SistemaDatos.obtenerProductos();
    
    // Obtener productos más vendidos
    const productosMasVendidos = obtenerProductosMasVendidos(ventas, 10);
    
    // Calcular rotación de inventario
    const productosConRotacion = productos.map(producto => {
        const ventasProducto = ventas.flatMap(v => 
            v.productos ? v.productos.filter(p => p.productoId === producto.id) : []
        );
        
        const cantidadVendida = ventasProducto.reduce((sum, p) => sum + p.cantidad, 0);
        const rotacion = producto.stock > 0 ? cantidadVendida / producto.stock : 0;
        
        return {
            producto,
            cantidadVendida,
            rotacion: rotacion.toFixed(2),
            diasInventario: producto.stock > 0 && cantidadVendida > 0 ? 
                (30 * producto.stock / cantidadVendida).toFixed(1) : '∞'
        };
    });
    
    // Guardar reporte actual
    reporteActual = {
        tipo: 'productos',
        periodo,
        fechaInicio,
        fechaFin,
        productos,
        productosMasVendidos,
        productosConRotacion
    };
    
    // Actualizar UI
    actualizarReporteProductosUI();
}

function actualizarReporteProductosUI() {
    if (!reporteActual) return;
    
    // Actualizar tabla de productos top
    actualizarTablaProductosTop(reporteActual.productosMasVendidos);
    
    // Actualizar análisis
    const analisis = document.getElementById('analisisRecomendaciones');
    if (analisis) {
        const productosBajoStock = reporteActual.productos.filter(p => p.estado === 'lowstock').length;
        const productosAgotados = reporteActual.productos.filter(p => p.estado === 'outofstock').length;
        
        let html = `
            <h4>Análisis de Productos</h4>
            <ul>
                <li><strong>Total Productos:</strong> ${reporteActual.productos.length}</li>
                <li><strong>Productos con Stock Bajo:</strong> ${productosBajoStock}</li>
                <li><strong>Productos Agotados:</strong> ${productosAgotados}</li>
                <li><strong>Productos Más Vendidos:</strong> ${reporteActual.productosMasVendidos.length}</li>
            </ul>
            
            <h4>Recomendaciones de Inventario</h4>
            <ul>
        `;
        
        if (productosBajoStock > 0) {
            html += `<li>Reponer ${productosBajoStock} productos con stock bajo</li>`;
        }
        
        if (productosAgotados > 0) {
            html += `<li>Reabastecer ${productosAgotados} productos agotados</li>`;
        }
        
        // Productos con mejor rotación
        const mejoresRotaciones = reporteActual.productosConRotacion
            .filter(p => p.cantidadVendida > 0)
            .sort((a, b) => b.rotacion - a.rotacion)
            .slice(0, 3);
        
        if (mejoresRotaciones.length > 0) {
            html += `<li>Productos con mejor rotación: ${mejoresRotaciones.map(p => p.producto.nombre).join(', ')}</li>`;
        }
        
        html += `</ul>`;
        
        analisis.innerHTML = html;
    }
}

function generarReporteClientes(periodo, fechaInicio, fechaFin) {
    const ventas = obtenerVentasPorPeriodo(periodo, fechaInicio, fechaFin);
    const clientes = SistemaDatos.obtenerClientes();
    
    // Calcular estadísticas por cliente
    const clientesConEstadisticas = clientes.map(cliente => {
        const comprasCliente = ventas.filter(v => v.clienteId === cliente.id);
        const totalGastado = comprasCliente.reduce((total, v) => total + v.total, 0);
        const promedioCompra = comprasCliente.length > 0 ? totalGastado / comprasCliente.length : 0;
        
        return {
            ...cliente,
            compras: comprasCliente.length,
            totalGastado,
            promedioCompra
        };
    });
    
    // Segmentar clientes
    const clientesVIP = clientesConEstadisticas.filter(c => c.totalGastado > 1000);
    const clientesFrecuentes = clientesConEstadisticas.filter(c => c.compras > 5 && c.totalGastado <= 1000);
    const clientesNuevos = clientesConEstadisticas.filter(c => c.compras <= 2);
    
    // Guardar reporte actual
    reporteActual = {
        tipo: 'clientes',
        periodo,
        fechaInicio,
        fechaFin,
        clientes: clientesConEstadisticas,
        clientesVIP,
        clientesFrecuentes,
        clientesNuevos
    };
    
    // Actualizar UI
    actualizarReporteClientesUI();
}

function actualizarReporteClientesUI() {
    if (!reporteActual) return;
    
    // Actualizar tabla de clientes top
    actualizarTablaClientesTop();
    
    // Actualizar análisis
    const analisis = document.getElementById('analisisRecomendaciones');
    if (analisis) {
        const totalClientes = reporteActual.clientes.length;
        const clientesActivos = reporteActual.clientes.filter(c => c.compras > 0).length;
        const tasaRetencion = totalClientes > 0 ? (clientesActivos / totalClientes * 100).toFixed(1) : 0;
        
        let html = `
            <h4>Análisis de Clientes</h4>
            <ul>
                <li><strong>Total Clientes:</strong> ${totalClientes}</li>
                <li><strong>Clientes Activos:</strong> ${clientesActivos}</li>
                <li><strong>Tasa de Retención:</strong> ${tasaRetencion}%</li>
                <li><strong>Clientes VIP:</strong> ${reporteActual.clientesVIP.length}</li>
                <li><strong>Clientes Frecuentes:</strong> ${reporteActual.clientesFrecuentes.length}</li>
                <li><strong>Clientes Nuevos:</strong> ${reporteActual.clientesNuevos.length}</li>
            </ul>
            
            <h4>Recomendaciones de Marketing</h4>
            <ul>
        `;
        
        if (reporteActual.clientesVIP.length > 0) {
            html += `<li>Ofrecer beneficios exclusivos a ${reporteActual.clientesVIP.length} clientes VIP</li>`;
        }
        
        if (reporteActual.clientesNuevos.length > 0) {
            html += `<li>Implementar programa de fidelización para ${reporteActual.clientesNuevos.length} clientes nuevos</li>`;
        }
        
        if (tasaRetencion < 50) {
            html += `<li>Mejorar estrategias de retención (tasa actual: ${tasaRetencion}%)</li>`;
        }
        
        html += `</ul>`;
        
        analisis.innerHTML = html;
    }
}

function generarReporteInventario() {
    const productos = SistemaDatos.obtenerProductos();
    
    // Calcular estadísticas
    const valorInventario = productos.reduce((total, p) => total + (p.precioCompra || 0) * (p.stock || 0), 0);
    const productosBajoStock = productos.filter(p => p.estado === 'lowstock').length;
    const productosAgotados = productos.filter(p => p.estado === 'outofstock').length;
    
    // Productos que necesitan reposición
    const productosReponer = productos.filter(p => p.estado === 'lowstock' || p.estado === 'outofstock');
    
    // Valor por categoría
    const valorPorCategoria = {};
    productos.forEach(producto => {
        if (!valorPorCategoria[producto.categoria]) {
            valorPorCategoria[producto.categoria] = 0;
        }
        valorPorCategoria[producto.categoria] += (producto.precioCompra || 0) * (producto.stock || 0);
    });
    
    // Guardar reporte actual
    reporteActual = {
        tipo: 'inventario',
        productos,
        valorInventario,
        productosBajoStock,
        productosAgotados,
        productosReponer,
        valorPorCategoria
    };
    
    // Actualizar UI
    actualizarReporteInventarioUI();
}

function actualizarReporteInventarioUI() {
    if (!reporteActual) return;
    
    // Actualizar análisis
    const analisis = document.getElementById('analisisRecomendaciones');
    if (analisis) {
        let html = `
            <h4>Análisis de Inventario</h4>
            <ul>
                <li><strong>Total Productos:</strong> ${reporteActual.productos.length}</li>
                <li><strong>Valor del Inventario:</strong> S/. ${reporteActual.valorInventario.toFixed(2)}</li>
                <li><strong>Productos con Stock Bajo:</strong> ${reporteActual.productosBajoStock}</li>
                <li><strong>Productos Agotados:</strong> ${reporteActual.productosAgotados}</li>
            </ul>
            
            <h4>Recomendaciones de Gestión</h4>
            <ul>
        `;
        
        if (reporteActual.productosReponer.length > 0) {
            html += `<li>Reponer ${reporteActual.productosReponer.length} productos (bajo stock o agotados)</li>`;
            
            // Listar productos críticos
            const productosCriticos = reporteActual.productosReponer.slice(0, 5);
            html += `<li>Productos críticos: ${productosCriticos.map(p => p.nombre).join(', ')}${reporteActual.productosReponer.length > 5 ? '...' : ''}</li>`;
        }
        
        // Mostrar categorías con mayor valor
        const categoriasOrdenadas = Object.entries(reporteActual.valorPorCategoria)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (categoriasOrdenadas.length > 0) {
            html += `<li>Categorías con mayor valor: ${categoriasOrdenadas.map(([categoria, valor]) => `${categoria} (S/. ${valor.toFixed(2)})`).join(', ')}</li>`;
        }
        
        html += `</ul>`;
        
        analisis.innerHTML = html;
    }
}

function actualizarMetricasPrincipales() {
    if (!reporteActual) return;
    
    // Esta función actualiza las métricas principales basadas en el reporte actual
    // En una implementación completa, calcularíamos tendencias y comparaciones
    
    // Actualizar métricas de ventas
    const metricasVentas = document.getElementById('metricasVentas');
    const metricasGanancias = document.getElementById('metricasGanancias');
    const metricasClientes = document.getElementById('metricasClientes');
    const metricasProductosVendidos = document.getElementById('metricasProductosVendidos');
    
    if (metricasVentas && reporteActual.totalVentas !== undefined) {
        metricasVentas.textContent = `S/. ${reporteActual.totalVentas.toFixed(2)}`;
    }
    
    if (metricasGanancias) {
        // En una implementación real, calcularíamos ganancias
        metricasGanancias.textContent = `S/. ${(reporteActual.totalVentas * 0.4).toFixed(2)}`; // Asumiendo 40% de ganancia
    }
    
    if (metricasClientes) {
        // Contar clientes únicos en el reporte
        const clientesUnicos = new Set(reporteActual.ventas ? reporteActual.ventas.map(v => v.clienteId) : []);
        metricasClientes.textContent = clientesUnicos.size;
    }
    
    if (metricasProductosVendidos && reporteActual.productosMasVendidos) {
        const totalProductosVendidos = reporteActual.productosMasVendidos.reduce((total, p) => total + p.cantidadVendida, 0);
        metricasProductosVendidos.textContent = totalProductosVendidos;
    }
}

function actualizarPeriodoReporteTexto(periodo, fechaInicio, fechaFin) {
    const elemento = document.getElementById('periodoReporteTexto');
    const fechaGeneracion = document.getElementById('fechaGeneracion');
    
    if (!elemento) return;
    
    let textoPeriodo = '';
    
    switch(periodo) {
        case 'hoy':
            textoPeriodo = 'Hoy';
            break;
        case 'semana':
            textoPeriodo = 'Esta semana';
            break;
        case 'mes':
            textoPeriodo = 'Este mes';
            break;
        case 'anio':
            textoPeriodo = 'Este año';
            break;
        case 'personalizado':
            textoPeriodo = `Personalizado (${fechaInicio} al ${fechaFin})`;
            break;
        default:
            textoPeriodo = 'Período no especificado';
    }
    
    elemento.textContent = `Período: ${textoPeriodo}`;
    
    if (fechaGeneracion) {
        fechaGeneracion.textContent = `Generado el: ${new Date().toLocaleDateString('es-PE')}`;
    }
}

function exportarReporte() {
    if (!reporteActual) {
        alert('Primero genera un reporte para exportar');
        return;
    }
    
    // Convertir reporte a JSON
    const datosExportar = {
        ...reporteActual,
        fechaExportacion: new Date().toISOString(),
        sistema: 'Jessica Boutique'
    };
    
    // Crear y descargar archivo JSON
    const datosStr = JSON.stringify(datosExportar, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `reporte-jessica-boutique-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Reporte exportado correctamente');
}

function imprimirReporte() {
    const elementoReporte = document.getElementById('reporteDetallado');
    
    if (!elementoReporte) {
        alert('No hay reporte para imprimir');
        return;
    }
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Jessica Boutique</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2, h3 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .encabezado-reporte { text-align: center; margin-bottom: 30px; }
                .seccion-reporte { margin: 20px 0; }
                .resumen-item { margin: 5px 0; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            ${elementoReporte.innerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }
            </script>
        </body>
        </html>
    `);
    ventanaImpresion.document.close();
}

function descargarPDF() {
    alert('La funcionalidad de descarga de PDF requiere una librería adicional como jsPDF o html2pdf.js');
    // En una implementación real, usaríamos una librería como:
    // html2pdf().from(reporteDetallado).save('reporte.pdf');
}