// Sistema de datos para Jessica Boutique
const SistemaDatos = (function() {
    // Estructura de datos inicial
    const estructuraInicial = {
        productos: [],
        ventas: [],
        clientes: [],
        configuracion: {
            categorias: ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios'],
            colores: ['Rosado', 'Morado', 'Lila', 'Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'],
            tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            tallasPantalon: ['28', '30', '32', '34', '36', '38'],
            tema: 'claro',
            moneda: 'S/.',
            alertaStock: 5,
            comisionTarjeta: 0.05
        }
    };

    // Datos de ejemplo para pruebas
    const datosEjemplo = {
        productos: [
            {
                id: 1,
                nombre: "Vestido Lila Elegante",
                codigo: "VES001",
                categoria: "Vestidos",
                marca: "Moda Bella",
                talla: "M",
                color: "Lila",
                precioCompra: 45.00,
                precioVenta: 89.99,
                stock: 15,
                stockMinimo: 5,
                estado: "instock",
                fechaCreacion: "2024-01-15",
                combinaciones: []
            },
            {
                id: 2,
                nombre: "Blusa Rosada Casual",
                codigo: "BLU001",
                categoria: "Blusas",
                marca: "Elegance",
                talla: "S",
                color: "Rosado",
                precioCompra: 25.00,
                precioVenta: 49.99,
                stock: 8,
                stockMinimo: 5,
                estado: "lowstock",
                fechaCreacion: "2024-01-20",
                combinaciones: []
            },
            {
                id: 3,
                nombre: "Pantalón Negro Slim",
                codigo: "PAN001",
                categoria: "Pantalones",
                marca: "Jeans Co.",
                talla: "32",
                color: "Negro",
                precioCompra: 60.00,
                precioVenta: 119.99,
                stock: 22,
                stockMinimo: 5,
                estado: "instock",
                fechaCreacion: "2024-01-10",
                combinaciones: []
            }
        ],
        ventas: [
            {
                id: 1,
                clienteId: 1,
                fecha: new Date().toISOString().split('T')[0],
                hora: "14:30",
                productos: [
                    { productoId: 1, cantidad: 1, precio: 89.99 },
                    { productoId: 3, cantidad: 1, precio: 119.99 }
                ],
                subtotal: 209.98,
                descuento: 0,
                comision: 0,
                total: 209.98,
                metodoPago: "efectivo",
                estado: "completada",
                vendedor: "Admin"
            }
        ],
        clientes: [
            {
                id: 1,
                nombre: "María González",
                dni: "12345678",
                telefono: "987654321",
                email: "maria@email.com",
                fechaRegistro: "2024-01-01",
                compras: 5,
                totalGastado: 1250.50
            },
            {
                id: 2,
                nombre: "Carlos López",
                dni: "87654321",
                telefono: "912345678",
                email: "carlos@email.com",
                fechaRegistro: "2024-01-05",
                compras: 3,
                totalGastado: 750.25
            }
        ]
    };

    // Inicializar datos
    function inicializar() {
        if (!localStorage.getItem('jessicaBoutique')) {
            // Si no hay datos, usar datos de ejemplo
            localStorage.setItem('jessicaBoutique', JSON.stringify(datosEjemplo));
            console.log('Datos inicializados con ejemplo');
        }
    }

    // Obtener todos los datos
    function obtenerDatos() {
        const datos = localStorage.getItem('jessicaBoutique');
        return datos ? JSON.parse(datos) : datosEjemplo;
    }

    // Guardar todos los datos
    function guardarDatos(datos) {
        localStorage.setItem('jessicaBoutique', JSON.stringify(datos));
    }

    // Obtener productos
    function obtenerProductos() {
        return obtenerDatos().productos;
    }

    // Guardar productos
    function guardarProductos(productos) {
        const datos = obtenerDatos();
        datos.productos = productos;
        guardarDatos(datos);
    }

    // Obtener ventas
    function obtenerVentas() {
        return obtenerDatos().ventas;
    }

    // Guardar ventas
    function guardarVentas(ventas) {
        const datos = obtenerDatos();
        datos.ventas = ventas;
        guardarDatos(datos);
    }

    // Obtener clientes
    function obtenerClientes() {
        return obtenerDatos().clientes;
    }

    // Guardar clientes
    function guardarClientes(clientes) {
        const datos = obtenerDatos();
        datos.clientes = clientes;
        guardarDatos(datos);
    }

    // Obtener configuración
    function obtenerConfiguracion() {
        return obtenerDatos().configuracion;
    }

    // Guardar configuración
    function guardarConfiguracion(configuracion) {
        const datos = obtenerDatos();
        datos.configuracion = configuracion;
        guardarDatos(datos);
    }

    // Exportar datos a JSON
    function exportarDatos() {
        const datos = obtenerDatos();
        const datosStr = JSON.stringify(datos, null, 2);
        const blob = new Blob([datosStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `jessica-boutique-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }

    // Importar datos desde JSON
    function importarDatos(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    // Validar estructura básica
                    if (!datos.productos || !datos.ventas || !datos.clientes || !datos.configuracion) {
                        throw new Error('Formato de archivo inválido');
                    }
                    
                    // Guardar datos
                    guardarDatos(datos);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(archivo);
        });
    }

    // Generar ID único
    function generarId(tipo) {
        const datos = obtenerDatos();
        let maxId = 0;
        
        switch(tipo) {
            case 'producto':
                maxId = datos.productos.reduce((max, p) => Math.max(max, p.id || 0), 0);
                break;
            case 'venta':
                maxId = datos.ventas.reduce((max, v) => Math.max(max, v.id || 0), 0);
                break;
            case 'cliente':
                maxId = datos.clientes.reduce((max, c) => Math.max(max, c.id || 0), 0);
                break;
        }
        
        return maxId + 1;
    }

    // Buscar producto por ID
    function buscarProducto(id) {
        const productos = obtenerProductos();
        return productos.find(p => p.id === id);
    }

    // Buscar cliente por DNI
    function buscarClientePorDNI(dni) {
        const clientes = obtenerClientes();
        return clientes.find(c => c.dni === dni);
    }

    // Filtrar productos
    function filtrarProductos(filtros = {}) {
        let productos = obtenerProductos();
        
        if (filtros.categoria && filtros.categoria !== 'todas') {
            productos = productos.filter(p => p.categoria === filtros.categoria);
        }
        
        if (filtros.estado && filtros.estado !== 'todos') {
            productos = productos.filter(p => p.estado === filtros.estado);
        }
        
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            productos = productos.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                p.codigo.toLowerCase().includes(busqueda) ||
                p.marca.toLowerCase().includes(busqueda)
            );
        }
        
        // Ordenar
        if (filtros.ordenarPor) {
            productos.sort((a, b) => {
                switch(filtros.ordenarPor) {
                    case 'nombre':
                        return a.nombre.localeCompare(b.nombre);
                    case 'precio':
                        return b.precioVenta - a.precioVenta;
                    case 'stock':
                        return b.stock - a.stock;
                    case 'reciente':
                        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
                    default:
                        return 0;
                }
            });
        }
        
        return productos;
    }

    // Actualizar estado del producto basado en stock
    function actualizarEstadoProducto(producto) {
        if (producto.stock === 0) {
            producto.estado = 'outofstock';
        } else if (producto.stock <= producto.stockMinimo) {
            producto.estado = 'lowstock';
        } else {
            producto.estado = 'instock';
        }
        return producto;
    }

    // Obtener estadísticas
    function obtenerEstadisticas() {
        const productos = obtenerProductos();
        const ventas = obtenerVentas();
        const hoy = new Date().toISOString().split('T')[0];
        
        // Productos con stock bajo
        const stockBajo = productos.filter(p => p.estado === 'lowstock').length;
        
        // Productos agotados
        const agotados = productos.filter(p => p.estado === 'outofstock').length;
        
        // Ventas de hoy
        const ventasHoy = ventas.filter(v => v.fecha === hoy);
        const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
        
        // Producto más vendido
        const productosVendidos = {};
        ventas.forEach(venta => {
            venta.productos.forEach(item => {
                if (!productosVendidos[item.productoId]) {
                    productosVendidos[item.productoId] = 0;
                }
                productosVendidos[item.productoId] += item.cantidad;
            });
        });
        
        let productoMasVendidoId = null;
        let maxVendidos = 0;
        Object.entries(productosVendidos).forEach(([id, cantidad]) => {
            if (cantidad > maxVendidos) {
                maxVendidos = cantidad;
                productoMasVendidoId = parseInt(id);
            }
        });
        
        const productoMasVendido = productoMasVendidoId ? 
            productos.find(p => p.id === productoMasVendidoId) : null;
        
        return {
            totalProductos: productos.length,
            valorInventario: productos.reduce((sum, p) => sum + (p.precioCompra * p.stock), 0),
            stockBajo: stockBajo,
            agotados: agotados,
            ventasHoy: totalVentasHoy,
            productoMasVendido: productoMasVendido?.nombre || 'Sin datos',
            ventasProductoTop: maxVendidos
        };
    }

    // Restablecer a datos de ejemplo
    function restablecerDatosEjemplo() {
        localStorage.setItem('jessicaBoutique', JSON.stringify(datosEjemplo));
        return true;
    }

    // Inicializar al cargar
    inicializar();

    // API pública
    return {
        obtenerDatos,
        guardarDatos,
        obtenerProductos,
        guardarProductos,
        obtenerVentas,
        guardarVentas,
        obtenerClientes,
        guardarClientes,
        obtenerConfiguracion,
        guardarConfiguracion,
        exportarDatos,
        importarDatos,
        generarId,
        buscarProducto,
        buscarClientePorDNI,
        filtrarProductos,
        actualizarEstadoProducto,
        obtenerEstadisticas,
        restablecerDatosEjemplo
    };
})();
// Al final de datos.js, asegúrate de que se inicialice
SistemaDatos.inicializar = function() {
    inicializar(); // Llama a la función interna de inicialización
};

// Inicializar automáticamente
inicializar();