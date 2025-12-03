// Módulo de Gestión de Productos
const Productos = (function() {
    // Obtener todos los productos
    function obtenerTodos() {
        return SistemaDatos.obtenerProductos();
    }

    // Obtener producto por ID
    function obtenerPorId(id) {
        return SistemaDatos.buscarProducto(id);
    }

    // Agregar nuevo producto
    function agregar(producto) {
        const productos = obtenerTodos();
        
        // Validar que no exista producto con mismo código (si tiene código)
        if (producto.codigo) {
            const existeCodigo = productos.some(p => p.codigo === producto.codigo);
            if (existeCodigo) {
                throw new Error('Ya existe un producto con ese código');
            }
        }
        
        // Generar ID y estado
        producto.id = SistemaDatos.generarId('producto');
        producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
        
        // Si tiene combinaciones, crear productos adicionales
        if (producto.combinaciones && producto.combinaciones.length > 0) {
            return guardarProductoConCombinaciones(producto);
        }
        
        productos.push(producto);
        SistemaDatos.guardarProductos(productos);
        return producto;
    }

    // Guardar producto con combinaciones
    function guardarProductoConCombinaciones(productoPrincipal) {
        const productos = obtenerTodos();
        const nuevosProductos = [];
        
        // Agregar producto principal
        productos.push(productoPrincipal);
        nuevosProductos.push({...productoPrincipal});
        
        // Crear productos para cada combinación
        productoPrincipal.combinaciones.forEach((combinacion, index) => {
            const productoCombinacion = {
                ...productoPrincipal,
                id: productoPrincipal.id + index + 1,
                talla: combinacion.talla,
                color: combinacion.color,
                stock: combinacion.cantidad,
                combinaciones: [] // Las combinaciones no tienen sub-combinaciones
            };
            
            productoCombinacion.estado = SistemaDatos.actualizarEstadoProducto(productoCombinacion).estado;
            productos.push(productoCombinacion);
            nuevosProductos.push({...productoCombinacion});
        });
        
        SistemaDatos.guardarProductos(productos);
        return nuevosProductos;
    }

    // Actualizar producto
    function actualizar(id, datosActualizados) {
        const productos = obtenerTodos();
        const index = productos.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Producto no encontrado');
        }
        
        // Mantener ID y estado actualizado
        datosActualizados.id = id;
        datosActualizados.estado = SistemaDatos.actualizarEstadoProducto(datosActualizados).estado;
        
        productos[index] = datosActualizados;
        SistemaDatos.guardarProductos(productos);
        return datosActualizados;
    }

    // Eliminar producto
    function eliminar(id) {
        const productos = obtenerTodos();
        const index = productos.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Producto no encontrado');
        }
        
        productos.splice(index, 1);
        SistemaDatos.guardarProductos(productos);
        return true;
    }

    // Buscar productos
    function buscar(texto) {
        const productos = obtenerTodos();
        const busqueda = texto.toLowerCase();
        
        return productos.filter(producto => 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.codigo?.toLowerCase().includes(busqueda) ||
            producto.marca?.toLowerCase().includes(busqueda) ||
            producto.categoria.toLowerCase().includes(busqueda)
        );
    }

    // Filtrar productos
    function filtrar(filtros = {}) {
        return SistemaDatos.filtrarProductos(filtros);
    }

    // Obtener productos por categoría
    function obtenerPorCategoria(categoria) {
        const productos = obtenerTodos();
        return productos.filter(p => p.categoria === categoria);
    }

    // Obtener productos con stock bajo
    function obtenerStockBajo() {
        const productos = obtenerTodos();
        return productos.filter(p => p.estado === 'lowstock');
    }

    // Obtener productos agotados
    function obtenerAgotados() {
        const productos = obtenerTodos();
        return productos.filter(p => p.estado === 'outofstock');
    }

    // Actualizar stock de producto
    function actualizarStock(id, cantidad, operacion = 'agregar') {
        const producto = obtenerPorId(id);
        if (!producto) {
            throw new Error('Producto no encontrado');
        }
        
        if (operacion === 'agregar') {
            producto.stock += cantidad;
        } else if (operacion === 'restar') {
            if (producto.stock < cantidad) {
                throw new Error('Stock insuficiente');
            }
            producto.stock -= cantidad;
        } else {
            producto.stock = cantidad;
        }
        
        producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
        return actualizar(id, producto);
    }

    // Generar código de producto
    function generarCodigo(categoria, marca = '') {
        const inicialesCategoria = categoria.substring(0, 3).toUpperCase();
        const inicialesMarca = marca ? marca.substring(0, 2).toUpperCase() : 'GN';
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `${inicialesCategoria}${inicialesMarca}${random}`;
    }

    // Calcular valor total del inventario
    function calcularValorInventario() {
        const productos = obtenerTodos();
        return productos.reduce((total, producto) => {
            return total + (producto.precioCompra * producto.stock);
        }, 0);
    }

    // Obtener estadísticas de productos
    function obtenerEstadisticas() {
        const productos = obtenerTodos();
        
        return {
            total: productos.length,
            porCategoria: contarPorCategoria(productos),
            valorTotal: calcularValorInventario(),
            stockBajo: obtenerStockBajo().length,
            agotados: obtenerAgotados().length,
            promedioPrecioVenta: calcularPromedioPrecio(productos, 'precioVenta'),
            promedioPrecioCompra: calcularPromedioPrecio(productos, 'precioCompra')
        };
    }

    // Contar productos por categoría
    function contarPorCategoria(productos) {
        const conteo = {};
        productos.forEach(producto => {
            conteo[producto.categoria] = (conteo[producto.categoria] || 0) + 1;
        });
        return conteo;
    }

    // Calcular promedio de precio
    function calcularPromedioPrecio(productos, tipoPrecio) {
        if (productos.length === 0) return 0;
        
        const total = productos.reduce((sum, producto) => 
            sum + producto[tipoPrecio], 0);
        
        return total / productos.length;
    }

    // Validar producto
    function validar(producto) {
        const errores = [];
        
        if (!producto.nombre || producto.nombre.trim() === '') {
            errores.push('El nombre es requerido');
        }
        
        if (!producto.categoria) {
            errores.push('La categoría es requerida');
        }
        
        if (!producto.talla) {
            errores.push('La talla es requerida');
        }
        
        if (!producto.color) {
            errores.push('El color es requerido');
        }
        
        if (!producto.precioCompra || producto.precioCompra <= 0) {
            errores.push('El precio de compra debe ser mayor a 0');
        }
        
        if (!producto.precioVenta || producto.precioVenta <= 0) {
            errores.push('El precio de venta debe ser mayor a 0');
        }
        
        if (producto.precioVenta <= producto.precioCompra) {
            errores.push('El precio de venta debe ser mayor al precio de compra');
        }
        
        if (producto.stock === undefined || producto.stock < 0) {
            errores.push('El stock no puede ser negativo');
        }
        
        if (!producto.stockMinimo || producto.stockMinimo < 1) {
            errores.push('El stock mínimo debe ser al menos 1');
        }
        
        return errores;
    }

    // API pública
    return {
        obtenerTodos,
        obtenerPorId,
        agregar,
        actualizar,
        eliminar,
        buscar,
        filtrar,
        obtenerPorCategoria,
        obtenerStockBajo,
        obtenerAgotados,
        actualizarStock,
        generarCodigo,
        calcularValorInventario,
        obtenerEstadisticas,
        validar
    };
})();