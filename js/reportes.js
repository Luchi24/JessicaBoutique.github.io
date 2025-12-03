// Reportes y estadísticas para Jessica Boutique
const Reportes = (function() {
    // Variables globales del módulo
    let filtrosReporte = {
        periodo: 'mes',
        fechaInicio: '',
        fechaFin: ''
    };

    // Inicializar módulo
    function inicializar() {
        if (document.getElementById('reportes-container')) {
            configurarFiltrosReportes();
            cargarReportes();
            configurarGraficos();
        }
    }

    // Configurar filtros de reportes
    function configurarFiltrosReportes() {
        // Filtro por período
        document.getElementById('filtro-periodo')?.addEventListener('change', function() {
            filtrosReporte.periodo = this.value;
            
            // Mostrar/ocultar fechas personalizadas
            const fechasPersonalizadas = document.getElementById('fechas-personalizadas');
            if (fechasPersonalizadas) {
                fechasPersonalizadas.style.display = 
                    this.value === 'personalizado' ? 'block' : 'none';
            }
            
            cargarReportes();
        });
        
        // Fechas personalizadas
        document.getElementById('fecha-inicio')?.addEventListener('change', function() {
            filtrosReporte.fechaInicio = this.value;
            if (filtrosReporte.fechaInicio && filtrosReporte.fechaFin) {
                cargarReportes();
            }
        });
        
        document.getElementById('fecha-fin')?.addEventListener('change', function() {
            filtrosReporte.fechaFin = this.value;
            if (filtrosReporte.fechaInicio && filtrosReporte.fechaFin) {
                cargarReportes();
            }
        });
        
        // Botón de aplicar
        document.getElementById('btn-aplicar-filtros')?.addEventListener('click', cargarReportes);
    }

    // Cargar reportes
    function cargarReportes() {
        const estadisticas = calcularEstadisticas();
        
        // Actualizar tarjetas de resumen
        actualizarTarjetasResumen(estadisticas);
        
        // Actualizar tabla de productos más vendidos
        actualizarTablaProductosVendidos(estadisticas.productosVendidos);
        
        // Actualizar tabla de ventas
        actualizarTablaVentas(estadisticas.ventasFiltradas);
        
        // Actualizar gráficos
        actualizarGraficos(estadisticas);
    }

    // Calcular estadísticas según filtros
    function calcularEstadisticas() {
        const ventas = SistemaDatos.obtenerVentas();
        const productos = SistemaDatos.obtenerProductos();
        
        // Filtrar ventas por período
        let ventasFiltradas = filtrarVentasPorPeriodo(ventas);
        
        // Calcular totales
        const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
        const totalComisiones = ventasFiltradas.reduce((sum, v) => sum + v.comision, 0);
        const totalGanancias = totalVentas - totalComisiones;
        
        // Calcular productos más vendidos
        const productosVendidos = {};
        ventasFiltradas.forEach(venta => {
            venta.productos.forEach(item => {
                if (!productosVendidos[item.productoId]) {
                    productosVendidos[item.productoId] = {
                        cantidad: 0,
                        total: 0
                    };
                }
                productosVendidos[item.productoId].cantidad += item.cantidad;
                productosVendidos[item.productoId].total += item.cantidad * item.precio;
            });
        });
        
        // Ordenar productos por cantidad vendida
        const productosOrdenados = Object.entries(productosVendidos)
            .map(([productoId, datos]) => ({
                producto: SistemaDatos.buscarProducto(parseInt(productoId)),
                cantidad: datos.cantidad,
                total: datos.total
            }))
            .filter(p => p.producto)
            .sort((a, b) => b.cantidad - a.cantidad);
        
        // Calcular ventas por día/mes
        const ventasPorPeriodo = {};
        ventasFiltradas.forEach(venta => {
            const periodo = obtenerPeriodoClave(venta.fecha);
            if (!ventasPorPeriodo[periodo]) {
                ventasPorPeriodo[periodo] = 0;
            }
            ventasPorPeriodo[periodo] += venta.total;
        });
        
        // Calcular método de pago más usado
        const metodosPago = {};
        ventasFiltradas.forEach(venta => {
            if (!metodosPago[venta.metodoPago]) {
                metodosPago[venta.metodoPago] = 0;
            }
            metodosPago[venta.metodoPago]++;
        });
        
        return {
            totalVentas,
            totalComisiones,
            totalGanancias,
            cantidadVentas: ventasFiltradas.length,
            productosVendidos: productosOrdenados,
            ventasFiltradas,
            ventasPorPeriodo,
            metodosPago
        };
    }

    // Filtrar ventas por período
    function filtrarVentasPorPeriodo(ventas) {
        const hoy = new Date();
        
        switch(filtrosReporte.periodo) {
            case 'hoy':
                const hoyStr = hoy.toISOString().split('T')[0];
                return ventas.filter(v => v.fecha === hoyStr);
                
            case 'semana':
                const hace7Dias = new Date(hoy);
                hace7Dias.setDate(hoy.getDate() - 7);
                return ventas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= hace7Dias && fechaVenta <= hoy;
                });
                
            case 'mes':
                const hace30Dias = new Date(hoy);
                hace30Dias.setDate(hoy.getDate() - 30);
                return ventas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= hace30Dias && fechaVenta <= hoy;
                });
                
            case 'personalizado':
                if (filtrosReporte.fechaInicio && filtrosReporte.fechaFin) {
                    return ventas.filter(v => {
                        return v.fecha >= filtrosReporte.fechaInicio && 
                               v.fecha <= filtrosReporte.fechaFin;
                    });
                }
                return ventas;
                
            default:
                return ventas;
        }
    }

    // Obtener clave de período para agrupación
    function obtenerPeriodoClave(fechaStr) {
        const fecha = new Date(fechaStr);
        
        switch(filtrosReporte.periodo) {
            case 'hoy':
                return fecha.toLocaleTimeString('es-PE', { hour: '2-digit' });
            case 'semana':
                return fecha.toLocaleDateString('es-PE', { weekday: 'short' });
            case 'mes':
            case 'personalizado':
                return fecha.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
            default:
                return fecha.toLocaleDateString('es-PE');
        }
    }

    // Actualizar tarjetas de resumen
    function actualizarTarjetasResumen(estadisticas) {
        const elementos = {
            'total-ventas-reporte': Sistema.formatearMoneda(estadisticas.totalVentas),
            'total-ganancias': Sistema.formatearMoneda(estadisticas.totalGanancias),
            'cantidad-ventas': estadisticas.cantidadVentas,
            'total-comisiones': Sistema.formatearMoneda(estadisticas.totalComisiones)
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });
    }

    // Actualizar tabla de productos más vendidos
    function actualizarTablaProductosVendidos(productosVendidos) {
        const tbody = document.getElementById('productos-vendidos-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (productosVendidos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        No hay datos de ventas en este período
                    </td>
                </tr>
            `;
            return;
        }
        
        // Mostrar solo los top 10
        productosVendidos.slice(0, 10).forEach((item, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.producto.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${Sistema.formatearMoneda(item.total)}</td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Actualizar tabla de ventas
    function actualizarTablaVentas(ventas) {
        const tbody = document.getElementById('ventas-reporte-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (ventas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No hay ventas en este período
                    </td>
                </tr>
            `;
            return;
        }
        
        // Ordenar por fecha más reciente
        ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        ventas.forEach(venta => {
            const cliente = SistemaDatos.obtenerClientes().find(c => c.id === venta.clienteId);
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${Sistema.formatearFecha(venta.fecha)} ${venta.hora}</td>
                <td>${cliente?.nombre || 'Cliente'}</td>
                <td>${venta.productos.length}</td>
                <td>${obtenerTextoMetodoPago(venta.metodoPago)}</td>
                <td>${Sistema.formatearMoneda(venta.total)}</td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Obtener texto del método de pago
    function obtenerTextoMetodoPago(metodo) {
        const metodos = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia'
        };
        return metodos[metodo] || metodo;
    }

    // Configurar gráficos (usando Chart.js si está disponible)
    function configurarGraficos() {
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está cargado. Los gráficos no se mostrarán.');
            return;
        }
        
        // Inicializar gráficos
        inicializarGraficoVentas();
        inicializarGraficoMetodosPago();
        inicializarGraficoProductosTop();
    }

    // Inicializar gráfico de ventas por período
    function inicializarGraficoVentas() {
        const canvas = document.getElementById('grafico-ventas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Datos iniciales
        const data = {
            labels: [],
            datasets: [{
                label: 'Ventas (S/.)',
                data: [],
                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                borderColor: 'rgba(156, 39, 176, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Ventas por Período'
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
        };
        
        window.graficoVentas = new Chart(ctx, config);
    }

    // Inicializar gráfico de métodos de pago
    function inicializarGraficoMetodosPago() {
        const canvas = document.getElementById('grafico-metodos-pago');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const data = {
            labels: ['Efectivo', 'Tarjeta', 'Transferencia'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 152, 0, 0.7)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(255, 152, 0, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Métodos de Pago'
                    }
                }
            }
        };
        
        window.graficoMetodosPago = new Chart(ctx, config);
    }

    // Inicializar gráfico de productos top
    function inicializarGraficoProductosTop() {
        const canvas = document.getElementById('grafico-productos-top');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const data = {
            labels: [],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [],
                backgroundColor: 'rgba(255, 102, 178, 0.5)',
                borderColor: 'rgba(255, 102, 178, 1)',
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Productos Más Vendidos'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
        
        window.graficoProductosTop = new Chart(ctx, config);
    }

    // Actualizar gráficos con nuevos datos
    function actualizarGraficos(estadisticas) {
        // Actualizar gráfico de ventas
        if (window.graficoVentas) {
            const periodos = Object.keys(estadisticas.ventasPorPeriodo).sort();
            const ventas = periodos.map(p => estadisticas.ventasPorPeriodo[p]);
            
            window.graficoVentas.data.labels = periodos;
            window.graficoVentas.data.datasets[0].data = ventas;
            window.graficoVentas.update();
        }
        
        // Actualizar gráfico de métodos de pago
        if (window.graficoMetodosPago) {
            window.graficoMetodosPago.data.datasets[0].data = [
                estadisticas.metodosPago.efectivo || 0,
                estadisticas.metodosPago.tarjeta || 0,
                estadisticas.metodosPago.transferencia || 0
            ];
            window.graficoMetodosPago.update();
        }
        
        // Actualizar gráfico de productos top
        if (window.graficoProductosTop) {
            const top5 = estadisticas.productosVendidos.slice(0, 5);
            
            window.graficoProductosTop.data.labels = top5.map(p => 
                p.producto.nombre.length > 15 ? 
                p.producto.nombre.substring(0, 15) + '...' : 
                p.producto.nombre
            );
            window.graficoProductosTop.data.datasets[0].data = top5.map(p => p.cantidad);
            window.graficoProductosTop.update();
        }
    }

    // Exportar reporte a PDF (usando jsPDF si está disponible)
    function exportarReportePDF() {
        Sistema.mostrarMensaje('info', 'Esta función requiere la librería jsPDF');
        // Implementación real requeriría jsPDF
    }

    // Exportar reporte a Excel (usando SheetJS si está disponible)
    function exportarReporteExcel() {
        Sistema.mostrarMensaje('info', 'Esta función requiere la librería SheetJS');
        // Implementación real requeriría SheetJS
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializar);

    // API pública
    return {
        cargarReportes,
        exportarReportePDF,
        exportarReporteExcel
    };
})();