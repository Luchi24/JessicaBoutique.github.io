// Módulo de Reportes y Estadísticas
const Reportes = (function() {
    // Tipos de períodos
    const PERIODOS = {
        HOY: 'hoy',
        SEMANA: 'semana',
        MES: 'mes',
        ANIO: 'anio',
        PERSONALIZADO: 'personalizado'
    };

    // Obtener ventas por período
    function obtenerVentasPorPeriodo(periodo, fechaInicio = null, fechaFin = null) {
        const ventas = SistemaDatos.obtenerVentas();
        const hoy = new Date();
        
        let ventasFiltradas = [...ventas];
        
        switch(periodo) {
            case PERIODOS.HOY:
                const hoyStr = hoy.toISOString().split('T')[0];
                ventasFiltradas = ventasFiltradas.filter(v => v.fecha === hoyStr);
                break;
                
            case PERIODOS.SEMANA:
                const inicioSemana = new Date(hoy);
                inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo de esta semana
                ventasFiltradas = ventasFiltradas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= inicioSemana && fechaVenta <= hoy;
                });
                break;
                
            case PERIODOS.MES:
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                ventasFiltradas = ventasFiltradas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= inicioMes && fechaVenta <= hoy;
                });
                break;
                
            case PERIODOS.ANIO:
                const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
                ventasFiltradas = ventasFiltradas.filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta >= inicioAnio && fechaVenta <= hoy;
                });
                break;
                
            case PERIODOS.PERSONALIZADO:
                if (fechaInicio && fechaFin) {
                    const inicio = new Date(fechaInicio);
                    const fin = new Date(fechaFin);
                    ventasFiltradas = ventasFiltradas.filter(v => {
                        const fechaVenta = new Date(v.fecha);
                        return fechaVenta >= inicio && fechaVenta <= fin;
                    });
                }
                break;
        }
        
        return ventasFiltradas;
    }

    // Calcular total de ventas
    function calcularTotalVentas(ventas) {
        return ventas.reduce((total, venta) => total + venta.total, 0);
    }

    // Calcular ganancias
    function calcularGanancias(ventas) {
        const productos = SistemaDatos.obtenerProductos();
        let ganancias = 0;
        
        ventas.forEach(venta => {
            venta.productos.forEach(item => {
                const producto = productos.find(p => p.id === item.productoId);
                if (producto) {
                    const gananciaProducto = (item.precio - producto.precioCompra) * item.cantidad;
                    ganancias += gananciaProducto;
                }
            });
        });
        
        return ganancias;
    }

    // Obtener cliente estrella
    function obtenerClienteEstrella(ventas) {
        const clientes = SistemaDatos.obtenerClientes();
        const comprasPorCliente = {};
        
        ventas.forEach(venta => {
            if (!comprasPorCliente[venta.clienteId]) {
                comprasPorCliente[venta.clienteId] = {
                    cantidad: 0,
                    total: 0
                };
            }
            comprasPorCliente[venta.clienteId].cantidad++;
            comprasPorCliente[venta.clienteId].total += venta.total;
        });
        
        let clienteEstrellaId = null;
        let maxCompras = 0;
        let maxTotal = 0;
        
        Object.entries(comprasPorCliente).forEach(([clienteId, datos]) => {
            if (datos.cantidad > maxCompras || 
                (datos.cantidad === maxCompras && datos.total > maxTotal)) {
                maxCompras = datos.cantidad;
                maxTotal = datos.total;
                clienteEstrellaId = parseInt(clienteId);
            }
        });
        
        if (clienteEstrellaId) {
            const cliente = clientes.find(c => c.id === clienteEstrellaId);
            return {
                cliente,
                compras: maxCompras,
                totalGastado: maxTotal
            };
        }
        
        return null;
    }

    // Obtener productos más vendidos
    function obtenerProductosMasVendidos(ventas, limite = 5) {
        const productos = SistemaDatos.obtenerProductos();
        const ventasPorProducto = {};
        
        // Contar ventas por producto
        ventas.forEach(venta => {
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
        });
        
        // Convertir a array y ordenar
        const productosArray = Object.entries(ventasPorProducto).map(([productoId, datos]) => {
            const producto = productos.find(p => p.id === parseInt(productoId));
            return {
                producto,
                cantidadVendida: datos.cantidad,
                totalVentas: datos.total
            };
        });
        
        // Filtrar productos no encontrados y ordenar
        return productosArray
            .filter(item => item.producto)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, limite);
    }

    // Obtener productos menos vendidos
    function obtenerProductosMenosVendidos(ventas, limite = 5) {
        const productos = SistemaDatos.obtenerProductos();
        const ventasPorProducto = {};
        
        // Contar ventas por producto
        ventas.forEach(venta => {
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
        });
        
        // Incluir productos que no se han vendido
        productos.forEach(producto => {
            if (!ventasPorProducto[producto.id]) {
                ventasPorProducto[producto.id] = {
                    cantidad: 0,
                    total: 0
                };
            }
        });
        
        // Convertir a array y ordenar
        const productosArray = Object.entries(ventasPorProducto).map(([productoId, datos]) => {
            const producto = productos.find(p => p.id === parseInt(productoId));
            return {
                producto,
                cantidadVendida: datos.cantidad,
                totalVentas: datos.total
            };
        });
        
        // Filtrar productos no encontrados y ordenar
        return productosArray
            .filter(item => item.producto)
            .sort((a, b) => a.cantidadVendida - b.cantidadVendida)
            .slice(0, limite);
    }

    // Obtener tendencia de ventas por día
    function obtenerTendenciaVentas(ventas, dias = 7) {
        const hoy = new Date();
        const tendencia = [];
        
        for (let i = dias - 1; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            const ventasDia = ventas.filter(v => v.fecha === fechaStr);
            const totalDia = calcularTotalVentas(ventasDia);
            
            tendencia.push({
                fecha: fechaStr,
                ventas: ventasDia.length,
                total: totalDia,
                dia: fecha.toLocaleDateString('es-PE', { weekday: 'short' })
            });
        }
        
        return tendencia;
    }

    // Obtener ventas por método de pago
    function obtenerVentasPorMetodoPago(ventas) {
        const metodos = {};
        
        ventas.forEach(venta => {
            if (!metodos[venta.metodoPago]) {
                metodos[venta.metodoPago] = {
                    cantidad: 0,
                    total: 0
                };
            }
            metodos[venta.metodoPago].cantidad++;
            metodos[venta.metodoPago].total += venta.total;
        });
        
        return Object.entries(metodos).map(([metodo, datos]) => ({
            metodo,
            cantidad: datos.cantidad,
            total: datos.total
        }));
    }

    // Obtener ventas por categoría
    function obtenerVentasPorCategoria(ventas) {
        const productos = SistemaDatos.obtenerProductos();
        const ventasPorCategoria = {};
        
        ventas.forEach(venta => {
            venta.productos.forEach(item => {
                const producto = productos.find(p => p.id === item.productoId);
                if (producto) {
                    if (!ventasPorCategoria[producto.categoria]) {
                        ventasPorCategoria[producto.categoria] = {
                            cantidad: 0,
                            total: 0
                        };
                    }
                    ventasPorCategoria[producto.categoria].cantidad += item.cantidad;
                    ventasPorCategoria[producto.categoria].total += item.precio * item.cantidad;
                }
            });
        });
        
        return Object.entries(ventasPorCategoria).map(([categoria, datos]) => ({
            categoria,
            cantidad: datos.cantidad,
            total: datos.total
        }));
    }

    // Generar reporte completo
    function generarReporteCompleto(periodo, fechaInicio = null, fechaFin = null) {
        const ventas = obtenerVentasPorPeriodo(periodo, fechaInicio, fechaFin);
        const totalVentas = calcularTotalVentas(ventas);
        const ganancias = calcularGanancias(ventas);
        const clienteEstrella = obtenerClienteEstrella(ventas);
        const productosMasVendidos = obtenerProductosMasVendidos(ventas);
        const productosMenosVendidos = obtenerProductosMenosVendidos(ventas);
        const tendencia = obtenerTendenciaVentas(ventas);
        const ventasPorMetodo = obtenerVentasPorMetodoPago(ventas);
        const ventasPorCategoria = obtenerVentasPorCategoria(ventas);
        
        return {
            periodo,
            fechaInicio,
            fechaFin,
            totalVentas,
            ganancias,
            totalTransacciones: ventas.length,
            clienteEstrella,
            productosMasVendidos,
            productosMenosVendidos,
            tendencia,
            ventasPorMetodo,
            ventasPorCategoria,
            ventas: ventas
        };
    }

    // Generar reporte de inventario
    function generarReporteInventario() {
        const productos = SistemaDatos.obtenerProductos();
        const ventas = SistemaDatos.obtenerVentas();
        
        // Productos con mejor rotación
        const rotacionProductos = productos.map(producto => {
            const ventasProducto = ventas.flatMap(v => 
                v.productos.filter(p => p.productoId === producto.id)
            );
            
            const cantidadVendida = ventasProducto.reduce((sum, p) => sum + p.cantidad, 0);
            const rotacion = producto.stock > 0 ? cantidadVendida / producto.stock : 0;
            
            return {
                producto,
                cantidadVendida,
                rotacion,
                diasInventario: producto.stock > 0 ? 
                    (producto.stock / (cantidadVendida / 30)).toFixed(1) : '∞' // Promedio mensual
            };
        });
        
        // Productos que necesitan reposición
        const productosReponer = productos.filter(p => p.estado === 'lowstock');
        
        // Valor del inventario por categoría
        const valorPorCategoria = {};
        productos.forEach(producto => {
            if (!valorPorCategoria[producto.categoria]) {
                valorPorCategoria[producto.categoria] = 0;
            }
            valorPorCategoria[producto.categoria] += producto.precioCompra * producto.stock;
        });
        
        return {
            totalProductos: productos.length,
            valorTotalInventario: productos.reduce((sum, p) => sum + (p.precioCompra * p.stock), 0),
            productosBajoStock: productos.filter(p => p.estado === 'lowstock').length,
            productosAgotados: productos.filter(p => p.estado === 'outofstock').length,
            productosReponer,
            rotacionProductos: rotacionProductos.sort((a, b) => b.rotacion - a.rotacion).slice(0, 10),
            valorPorCategoria,
            productosPorCategoria: contarProductosPorCategoria(productos)
        };
    }

    // Contar productos por categoría
    function contarProductosPorCategoria(productos) {
        const conteo = {};
        productos.forEach(producto => {
            conteo[producto.categoria] = (conteo[producto.categoria] || 0) + 1;
        });
        return conteo;
    }

    // Generar reporte de clientes
    function generarReporteClientes() {
        const clientes = SistemaDatos.obtenerClientes();
        const ventas = SistemaDatos.obtenerVentas();
        
        const clientesConEstadisticas = clientes.map(cliente => {
            const comprasCliente = ventas.filter(v => v.clienteId === cliente.id);
            const totalGastado = comprasCliente.reduce((sum, v) => sum + v.total, 0);
            const promedioCompra = comprasCliente.length > 0 ? 
                totalGastado / comprasCliente.length : 0;
            
            // Calcular frecuencia (días entre compras)
            let frecuencia = 'Nueva';
            if (comprasCliente.length >= 2) {
                const fechas = comprasCliente.map(v => new Date(v.fecha)).sort((a, b) => a - b);
                const diasEntreCompras = [];
                
                for (let i = 1; i < fechas.length; i++) {
                    const diferencia = (fechas[i] - fechas[i-1]) / (1000 * 60 * 60 * 24);
                    diasEntreCompras.push(diferencia);
                }
                
                const promedioDias = diasEntreCompras.reduce((a, b) => a + b, 0) / diasEntreCompras.length;
                frecuencia = `${promedioDias.toFixed(0)} días`;
            }
            
            return {
                ...cliente,
                compras: comprasCliente.length,
                totalGastado,
                promedioCompra,
                frecuencia,
                ultimaCompra: comprasCliente.length > 0 ? 
                    comprasCliente[comprasCliente.length - 1].fecha : 'Nunca'
            };
        });
        
        // Segmentar clientes
        const segmentos = {
            vip: [], // > 1000 soles gastados
            frecuentes: [], // > 5 compras
            nuevos: [], // 1-2 compras
            inactivos: [] // Última compra > 30 días
        };
        
        const hoy = new Date();
        const hace30Dias = new Date(hoy);
        hace30Dias.setDate(hoy.getDate() - 30);
        
        clientesConEstadisticas.forEach(cliente => {
            if (cliente.totalGastado > 1000) {
                segmentos.vip.push(cliente);
            } else if (cliente.compras > 5) {
                segmentos.frecuentes.push(cliente);
            } else if (cliente.compras <= 2) {
                segmentos.nuevos.push(cliente);
            }
            
            if (cliente.ultimaCompra !== 'Nunca') {
                const ultimaCompraDate = new Date(cliente.ultimaCompra);
                if (ultimaCompraDate < hace30Dias) {
                    segmentos.inactivos.push(cliente);
                }
            }
        });
        
        return {
            totalClientes: clientes.length,
            clientesActivos: clientesConEstadisticas.filter(c => c.compras > 0).length,
            valorPromedioCompra: clientesConEstadisticas.length > 0 ?
                clientesConEstadisticas.reduce((sum, c) => sum + c.promedioCompra, 0) / 
                clientesConEstadisticas.filter(c => c.compras > 0).length : 0,
            segmentos,
            topClientes: clientesConEstadisticas
                .sort((a, b) => b.totalGastado - a.totalGastado)
                .slice(0, 10)
        };
    }

    // Exportar reporte a JSON
    function exportarReporte(reporte, nombre = 'reporte') {
        const fecha = new Date().toISOString().split('T')[0];
        const datosStr = JSON.stringify(reporte, null, 2);
        const blob = new Blob([datosStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombre}-${fecha}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }

    // Generar resumen ejecutivo
    function generarResumenEjecutivo() {
        const ventasHoy = obtenerVentasPorPeriodo(PERIODOS.HOY);
        const ventasMes = obtenerVentasPorPeriodo(PERIODOS.MES);
        const reporteInventario = generarReporteInventario();
        const reporteClientes = generarReporteClientes();
        
        const ventasHoyTotal = calcularTotalVentas(ventasHoy);
        const ventasMesTotal = calcularTotalVentas(ventasMes);
        
        // Calcular crecimiento vs mes anterior
        const ventasMesAnterior = obtenerVentasPorPeriodo('mes-anterior');
        const ventasMesAnteriorTotal = calcularTotalVentas(ventasMesAnterior);
        const crecimiento = ventasMesAnteriorTotal > 0 ? 
            ((ventasMesTotal - ventasMesAnteriorTotal) / ventasMesAnteriorTotal * 100).toFixed(1) : 100;
        
        // Obtener métricas clave
        const clienteEstrella = obtenerClienteEstrella(ventasMes);
        const productosTop = obtenerProductosMasVendidos(ventasMes, 1);
        
        return {
            fecha: new Date().toISOString().split('T')[0],
            ventasHoy: {
                total: ventasHoyTotal,
                transacciones: ventasHoy.length
            },
            ventasMes: {
                total: ventasMesTotal,
                transacciones: ventasMes.length,
                crecimiento: parseFloat(crecimiento)
            },
            inventario: {
                totalProductos: reporteInventario.totalProductos,
                valorTotal: reporteInventario.valorTotalInventario,
                productosBajoStock: reporteInventario.productosBajoStock,
                productosAgotados: reporteInventario.productosAgotados
            },
            clientes: {
                total: reporteClientes.totalClientes,
                activos: reporteClientes.clientesActivos,
                clienteEstrella: clienteEstrella?.cliente?.nombre || 'Sin datos',
                valorPromedioCompra: reporteClientes.valorPromedioCompra
            },
            productoTop: productosTop[0]?.producto?.nombre || 'Sin datos',
            alertas: generarAlertas()
        };
    }

    // Generar alertas del sistema
    function generarAlertas() {
        const productos = SistemaDatos.obtenerProductos();
        const ventas = SistemaDatos.obtenerVentas();
        const alertas = [];
        
        // Alertas de stock bajo
        const productosBajoStock = productos.filter(p => p.estado === 'lowstock');
        if (productosBajoStock.length > 0) {
            alertas.push({
                tipo: 'stock',
                severidad: 'alta',
                mensaje: `${productosBajoStock.length} productos con stock bajo`,
                detalles: productosBajoStock.slice(0, 3).map(p => p.nombre).join(', ')
            });
        }
        
        // Alertas de productos agotados
        const productosAgotados = productos.filter(p => p.estado === 'outofstock');
        if (productosAgotados.length > 0) {
            alertas.push({
                tipo: 'agotado',
                severidad: 'critica',
                mensaje: `${productosAgotados.length} productos agotados`,
                detalles: productosAgotados.slice(0, 3).map(p => p.nombre).join(', ')
            });
        }
        
        // Alertas de ventas bajas (últimos 7 días vs anteriores)
        const ventasUltimaSemana = obtenerVentasPorPeriodo(PERIODOS.SEMANA);
        const ventasSemanaAnterior = obtenerVentasPorPeriodo('semana-anterior');
        
        const ventasUltimaSemanaTotal = calcularTotalVentas(ventasUltimaSemana);
        const ventasSemanaAnteriorTotal = calcularTotalVentas(ventasSemanaAnterior);
        
        if (ventasSemanaAnteriorTotal > 0 && ventasUltimaSemanaTotal < ventasSemanaAnteriorTotal * 0.7) {
            const caida = ((ventasSemanaAnteriorTotal - ventasUltimaSemanaTotal) / ventasSemanaAnteriorTotal * 100).toFixed(1);
            alertas.push({
                tipo: 'ventas',
                severidad: 'media',
                mensaje: `Caída del ${caida}% en ventas esta semana`,
                detalles: `Ventas semana anterior: S/. ${ventasSemanaAnteriorTotal.toFixed(2)}, esta semana: S/. ${ventasUltimaSemanaTotal.toFixed(2)}`
            });
        }
        
        return alertas;
    }

    // Obtener ventas por semana anterior (función auxiliar)
    function obtenerVentasPorPeriodo(periodo) {
        // Esta función ya está definida arriba, pero necesitamos manejar 'semana-anterior' y 'mes-anterior'
        if (periodo === 'semana-anterior') {
            const hoy = new Date();
            const inicioSemanaAnterior = new Date(hoy);
            inicioSemanaAnterior.setDate(hoy.getDate() - hoy.getDay() - 7); // Domingo semana anterior
            const finSemanaAnterior = new Date(inicioSemanaAnterior);
            finSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 6);
            
            return obtenerVentasPorPeriodo(PERIODOS.PERSONALIZADO, 
                inicioSemanaAnterior.toISOString().split('T')[0],
                finSemanaAnterior.toISOString().split('T')[0]);
        }
        
        if (periodo === 'mes-anterior') {
            const hoy = new Date();
            const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
            
            return obtenerVentasPorPeriodo(PERIODOS.PERSONALIZADO,
                inicioMesAnterior.toISOString().split('T')[0],
                finMesAnterior.toISOString().split('T')[0]);
        }
        
        // Si no es un período especial, usar la función original
        return obtenerVentasPorPeriodo(periodo);
    }

    // API pública
    return {
        PERIODOS,
        obtenerVentasPorPeriodo,
        calcularTotalVentas,
        calcularGanancias,
        obtenerClienteEstrella,
        obtenerProductosMasVendidos,
        obtenerProductosMenosVendidos,
        obtenerTendenciaVentas,
        obtenerVentasPorMetodoPago,
        obtenerVentasPorCategoria,
        generarReporteCompleto,
        generarReporteInventario,
        generarReporteClientes,
        exportarReporte,
        generarResumenEjecutivo,
        generarAlertas
    };
})();