// Funciones específicas para el dashboard

function inicializarDashboard() {
    actualizarDashboard();
    inicializarEventosDashboard();
    configurarActualizacionAutomatica();
}

function inicializarEventosDashboard() {
    // Evento para refrescar dashboard
    const btnRefrescar = document.getElementById('btn-refrescar-dashboard');
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', actualizarDashboard);
    }
    
    // Eventos para las tarjetas del dashboard
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', function() {
            const titulo = this.querySelector('h3').textContent;
            console.log(`Navegando a: ${titulo}`);
        });
    });
}

function configurarActualizacionAutomatica() {
    // Actualizar dashboard cada 30 segundos
    setInterval(actualizarDashboard, 30000);
    
    // Actualizar cuando la página gana foco
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            actualizarDashboard();
        }
    });
}

function actualizarDashboard() {
    // Actualizar estadísticas principales
    actualizarEstadisticasPrincipales();
    
    // Actualizar alertas
    actualizarAlertas();
    
    // Actualizar estadísticas detalladas
    actualizarEstadisticasDetalladas();
    
    // Actualizar última actividad
    actualizarUltimaActividad();
}

function actualizarEstadisticasPrincipales() {
    // Total de productos
    const totalProductos = datos.productos.length;
    const productosElement = document.getElementById('dashboard-total-productos');
    if (productosElement) {
        productosElement.textContent = totalProductos;
        productosElement.style.color = totalProductos === 0 ? 'var(--rojo)' : 'var(--rosa-principal)';
    }
    
    // Ventas de hoy
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
    
    // Ganancias de hoy
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
    
    // 1. Productos con stock bajo
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
    
    // 2. Ventas bajas hoy
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
    
    // 3. Productos próximos a vencer (simulado - basado en fecha de creación)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 90); // Productos "antiguos"
    
    const productosAntiguos = datos.productos.filter(p => {
        // Si no tiene fecha de creación, usar un criterio alternativo
        if (!p.fechaCreacion) {
            return p.cantidad > 0 && Math.random() > 0.7; // Aleatorio para demo
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
    
    // 4. Clientes frecuentes sin compras recientes (opcional)
    // Esta alerta sería más avanzada, se omite por simplicidad
    
    // Mostrar alertas
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
    // Productos con stock bajo
    const stockBajo = datos.productos.filter(p => p.cantidad < 5).length;
    const stockBajoElement = document.getElementById('stat-stock-bajo');
    if (stockBajoElement) {
        stockBajoElement.textContent = stockBajo;
        stockBajoElement.style.color = stockBajo > 0 ? 'var(--rojo)' : 'var(--verde)';
    }
    
    // Producto más vendido (últimos 7 días)
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
    
    // Mejor categoría (últimos 7 días)
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
        // Ordenar ventas por fecha (más reciente primero)
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

// Generar datos de ejemplo para demostración
function generarDatosDemo() {
    // Solo generar si no hay datos
    if (datos.productos.length > 0 || datos.ventas.length > 0) {
        return;
    }
    
    console.log('Generando datos de demostración...');
    
    // Productos de ejemplo
    const productosDemo = [
        {
            nombre: 'Vestido Floral Verano',
            categoria: 'Vestidos',
            marca: 'Jessica Collection',
            talla: 'M',
            color: 'Rosa',
            precioCompra: 45.00,
            precio: 89.90,
            cantidad: 12,
            fechaCreacion: '2024-01-15'
        },
        {
            nombre: 'Blusa Elegante Seda',
            categoria: 'Blusas',
            marca: 'Luxe Mode',
            talla: 'S',
            color: 'Blanco',
            precioCompra: 35.50,
            precio: 69.90,
            cantidad: 8,
            fechaCreacion: '2024-02-10'
        },
        {
            nombre: 'Jeans Slim Fit',
            categoria: 'Pantalones',
            marca: 'Denim Co.',
            talla: 'L',
            color: 'Azul',
            precioCompra: 55.00,
            precio: 109.90,
            cantidad: 3,
            fechaCreacion: '2024-01-30'
        },
        {
            nombre: 'Falda Plisada',
            categoria: 'Faldas',
            marca: 'Fashion Style',
            talla: 'XS',
            color: 'Negro',
            precioCompra: 28.00,
            precio: 59.90,
            cantidad: 0,
            fechaCreacion: '2023-12-05'
        },
        {
            nombre: 'Chamarra de Cuero',
            categoria: 'Abrigos',
            marca: 'Urban Leather',
            talla: 'M',
            color: 'Negro',
            precioCompra: 120.00,
            precio: 249.90,
            cantidad: 5,
            fechaCreacion: '2024-02-20'
        }
    ];
    
    // Ventas de ejemplo (últimos 7 días)
    const hoy = new Date();
    const ventasDemo = [];
    
    for (let i = 0; i < 15; i++) {
        const fechaVenta = new Date();
        fechaVenta.setDate(hoy.getDate() - Math.floor(Math.random() * 7));
        fechaVenta.setHours(9 + Math.floor(Math.random() * 9));
        fechaVenta.setMinutes(Math.floor(Math.random() * 60));
        
        const productosVenta = [];
        const numProductos = Math.floor(Math.random() * 3) + 1;
        let subtotal = 0;
        let gananciaTotal = 0;
        
        for (let j = 0; j < numProductos; j++) {
            const productoIndex = Math.floor(Math.random() * productosDemo.length);
            const producto = productosDemo[productoIndex];
            const cantidad = Math.floor(Math.random() * 2) + 1;
            
            const itemVenta = {
                productoIndex: productoIndex,
                nombre: producto.nombre,
                talla: producto.talla,
                color: producto.color,
                precioCompra: producto.precioCompra,
                precioVenta: producto.precio,
                cantidad: cantidad,
                subtotal: producto.precio * cantidad
            };
            
            productosVenta.push(itemVenta);
            subtotal += itemVenta.subtotal;
            gananciaTotal += (producto.precio - producto.precioCompra) * cantidad;
        }
        
        const venta = {
            id: i + 1,
            fecha: fechaVenta.toISOString(),
            cliente: {
                nombre: ['María González', 'Carlos López', 'Ana Martínez', 'Juan Pérez', 'Lucía Rodríguez'][i % 5],
                dni: ['12345678', '23456789', '34567890', '45678901', '56789012'][i % 5],
                telefono: '999888777'
            },
            tipoComprobante: Math.random() > 0.5 ? 'boleta' : 'factura',
            metodoPago: ['efectivo', 'tarjeta', 'transferencia'][i % 3],
            items: productosVenta,
            subtotal: subtotal,
            igv: subtotal * 0.18,
            total: subtotal * 1.18,
            gananciaTotal: gananciaTotal,
            estado: 'completada'
        };
        
        ventasDemo.push(venta);
    }
    
    // Asignar datos demo
    datos.productos = productosDemo;
    datos.ventas = ventasDemo;
    datos.config.ultimoIdVenta = 15;
    
    // Guardar datos
    guardarDatos();
    
    console.log('Datos de demostración generados');
    actualizarDashboard();
}

// Función para mostrar widget del clima (ejemplo de integración externa)
function mostrarWidgetClima() {
    // Esta función sería para integrar un servicio de clima
    // Por ahora es solo un placeholder
    const climaContainer = document.getElementById('clima-widget');
    if (climaContainer) {
        climaContainer.innerHTML = `
            <div class="clima-info">
                <i class="fas fa-sun" style="color: #FF9800;"></i>
                <div>
                    <div class="clima-temperatura">28°C</div>
                    <div class="clima-ciudad">Lima, Perú</div>
                </div>
            </div>
        `;
    }
}

// Función para mostrar noticias/actualizaciones del sistema
function mostrarActualizacionesSistema() {
    const actualizaciones = [
        {
            fecha: '2024-03-15',
            titulo: 'Nueva función: Reportes avanzados',
            descripcion: 'Ahora puedes generar reportes detallados por categoría y período'
        },
        {
            fecha: '2024-03-10',
            titulo: 'Mejora en ventas',
            descripcion: 'Se agregó captura de boletas con la cámara'
        },
        {
            fecha: '2024-03-05',
            titulo: 'Backup automático',
            descripcion: 'El sistema ahora guarda automáticamente cada 24 horas'
        }
    ];
    
    const actualizacionesContainer = document.getElementById('actualizaciones-container');
    if (actualizacionesContainer) {
        actualizacionesContainer.innerHTML = '';
        
        actualizaciones.forEach(actualizacion => {
            const item = document.createElement('div');
            item.className = 'actualizacion-item';
            item.innerHTML = `
                <div class="actualizacion-fecha">${actualizacion.fecha}</div>
                <div class="actualizacion-titulo">${actualizacion.titulo}</div>
                <div class="actualizacion-descripcion">${actualizacion.descripcion}</div>
            `;
            actualizacionesContainer.appendChild(item);
        });
    }
}

// Función para calcular métricas de rendimiento
function calcularMetricasRendimiento() {
    const metricas = {
        rotacionInventario: 0,
        margenPromedio: 0,
        ticketPromedio: 0
    };
    
    if (datos.ventas.length > 0) {
        // Ticket promedio
        const totalVentas = datos.ventas.reduce((sum, v) => sum + v.total, 0);
        metricas.ticketPromedio = totalVentas / datos.ventas.length;
        
        // Margen promedio
        const gananciaTotal = datos.ventas.reduce((sum, v) => sum + v.gananciaTotal, 0);
        metricas.margenPromedio = (gananciaTotal / totalVentas) * 100;
        
        // Rotación de inventario (simplificada)
        const valorInventario = datos.productos.reduce((sum, p) => sum + (p.precioCompra * p.cantidad), 0);
        const ventasUltimoMes = datos.ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            const haceUnMes = new Date();
            haceUnMes.setMonth(haceUnMes.getMonth() - 1);
            return fechaVenta > haceUnMes;
        });
        
        const ventasUltimoMesTotal = ventasUltimoMes.reduce((sum, v) => sum + v.total, 0);
        metricas.rotacionInventario = valorInventario > 0 ? ventasUltimoMesTotal / valorInventario : 0;
    }
    
    return metricas;
}

// Función para mostrar resumen rápido
function mostrarResumenRapido() {
    const metricas = calcularMetricasRendimiento();
    
    const resumenHTML = `
        <div class="metricas-rapidas">
            <div class="metrica">
                <span>Ticket promedio:</span>
                <strong>S/. ${metricas.ticketPromedio.toFixed(2)}</strong>
            </div>
            <div class="metrica">
                <span>Margen promedio:</span>
                <strong>${metricas.margenPromedio.toFixed(1)}%</strong>
            </div>
            <div class="metrica">
                <span>Rotación inventario:</span>
                <strong>${metricas.rotacionInventario.toFixed(2)}</strong>
            </div>
        </div>
    `;
    
    const resumenContainer = document.getElementById('resumen-metricas');
    if (resumenContainer) {
        resumenContainer.innerHTML = resumenHTML;
    }
}

// Inicializar dashboard cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar si estamos en la página principal
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('/')) {
            inicializarDashboard();
            
            // Opcional: Generar datos demo si está vacío
            setTimeout(() => {
                if (datos.productos.length === 0 && datos.ventas.length === 0) {
                    const usarDemo = confirm('¿Deseas cargar datos de demostración para probar el sistema?');
                    if (usarDemo) {
                        generarDatosDemo();
                    }
                }
            }, 1000);
            
            // Mostrar widget de clima
            mostrarWidgetClima();
            
            // Mostrar actualizaciones
            mostrarActualizacionesSistema();
            
            // Mostrar métricas
            mostrarResumenRapido();
        }
    });
} else {
    if (window.location.pathname.endsWith('index.html') || 
        window.location.pathname.endsWith('/')) {
        inicializarDashboard();
    }
}