// Gestión de productos para Jessica Boutique
const Productos = (function() {
    // Variables globales del módulo
    let productos = [];
    let filtrosActuales = {};
    let paginaActual = 1;
    const productosPorPagina = 10;

    // Inicializar módulo
    function inicializar() {
        cargarProductos();
        if (document.getElementById('inventario-table-body')) {
            renderizarTablaProductos();
            configurarEventosInventario();
        }
        if (document.getElementById('product-form')) {
            configurarFormularioProducto();
        }
    }

    // Cargar productos desde el almacenamiento
    function cargarProductos() {
        productos = SistemaDatos.obtenerProductos();
    }

    // Renderizar tabla de productos
    function renderizarTablaProductos(filtros = {}) {
        const tbody = document.getElementById('inventario-table-body');
        if (!tbody) return;

        // Aplicar filtros
        let productosFiltrados = SistemaDatos.filtrarProductos(filtros);
        const totalProductos = productosFiltrados.length;
        
        // Paginación
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        productosFiltrados = productosFiltrados.slice(inicio, fin);

        // Limpiar tabla
        tbody.innerHTML = '';

        if (productosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No se encontraron productos
                    </td>
                </tr>
            `;
            actualizarPaginacion(totalProductos);
            return;
        }

        // Llenar tabla
        productosFiltrados.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>${producto.talla}</td>
                <td>${producto.color}</td>
                <td>${producto.stock}</td>
                <td>${Sistema.formatearMoneda(producto.precioVenta)}</td>
                <td>
                    <span class="status status-${producto.estado}">
                        ${obtenerTextoEstado(producto.estado)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm btn-editar" data-id="${producto.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(fila);
        });

        // Actualizar paginación
        actualizarPaginacion(totalProductos);
        
        // Actualizar resumen
        actualizarResumenInventario();
    }

    // Configurar eventos del inventario
    function configurarEventosInventario() {
        // Filtros
        document.getElementById('btn-aplicar-filtros')?.addEventListener('click', aplicarFiltros);
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', limpiarFiltros);
        
        // Búsqueda
        document.getElementById('input-busqueda')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') aplicarFiltros();
        });

        // Delegación de eventos para botones de acción
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-editar')) {
                const id = e.target.closest('.btn-editar').dataset.id;
                editarProducto(parseInt(id));
            }
            
            if (e.target.closest('.btn-eliminar')) {
                const id = e.target.closest('.btn-eliminar').dataset.id;
                eliminarProducto(parseInt(id));
            }
        });
    }

    // Aplicar filtros al inventario
    function aplicarFiltros() {
        const categoria = document.getElementById('filtro-categoria')?.value || '';
        const estado = document.getElementById('filtro-estado')?.value || '';
        const orden = document.getElementById('filtro-orden')?.value || '';
        const busqueda = document.getElementById('input-busqueda')?.value || '';
        
        filtrosActuales = {
            categoria: categoria !== 'todas' ? categoria : '',
            estado: estado !== 'todos' ? estado : '',
            ordenarPor: orden,
            busqueda: busqueda
        };
        
        paginaActual = 1;
        renderizarTablaProductos(filtrosActuales);
    }

    // Limpiar filtros
    function limpiarFiltros() {
        document.getElementById('filtro-categoria').value = 'todas';
        document.getElementById('filtro-estado').value = 'todos';
        document.getElementById('filtro-orden').value = 'reciente';
        document.getElementById('input-busqueda').value = '';
        
        filtrosActuales = {};
        paginaActual = 1;
        renderizarTablaProductos();
    }

    // Actualizar paginación
    function actualizarPaginacion(totalProductos) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
        
        if (totalPaginas <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Botón anterior
        html += `
            <button class="page-link ${paginaActual === 1 ? 'disabled' : ''}" 
                    onclick="Productos.cambiarPagina(${paginaActual - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                html += `
                    <button class="page-link ${i === paginaActual ? 'active' : ''}" 
                            onclick="Productos.cambiarPagina(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                html += `<span class="page-link disabled">...</span>`;
            }
        }
        
        // Botón siguiente
        html += `
            <button class="page-link ${paginaActual === totalPaginas ? 'disabled' : ''}" 
                    onclick="Productos.cambiarPagina(${paginaActual + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = html;
    }

    // Cambiar página
    function cambiarPagina(pagina) {
        if (pagina < 1) return;
        
        const totalProductos = SistemaDatos.filtrarProductos(filtrosActuales).length;
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
        
        if (pagina > totalPaginas) return;
        
        paginaActual = pagina;
        renderizarTablaProductos(filtrosActuales);
    }

    // Actualizar resumen del inventario
    function actualizarResumenInventario() {
        const estadisticas = SistemaDatos.obtenerEstadisticas();
        
        const elementos = {
            'total-productos': estadisticas.totalProductos,
            'valor-inventario': Sistema.formatearMoneda(estadisticas.valorInventario),
            'productos-bajo-stock': estadisticas.stockBajo,
            'productos-agotados': estadisticas.agotados
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });
    }

    // Obtener texto del estado
    function obtenerTextoEstado(estado) {
        const estados = {
            'instock': 'En Stock',
            'lowstock': 'Stock Bajo',
            'outofstock': 'Agotado'
        };
        return estados[estado] || estado;
    }

    // Configurar formulario de producto
    function configurarFormularioProducto() {
        const form = document.getElementById('product-form');
        if (!form) return;
        
        // Cargar categorías, colores, tallas en los selects
        cargarOpcionesFormulario();
        
        // Manejar cambio de categoría para tallas
        document.getElementById('categoria').addEventListener('change', function() {
            actualizarOpcionesTallas(this.value);
        });
        
        // Agregar combinación
        document.getElementById('btn-agregar-combinacion').addEventListener('click', agregarCombinacion);
        
        // Enviar formulario
        form.addEventListener('submit', guardarProducto);
        
        // Si hay ID en la URL, es edición
        const urlParams = new URLSearchParams(window.location.search);
        const idProducto = urlParams.get('id');
        if (idProducto) {
            cargarProductoParaEdicion(parseInt(idProducto));
        }
    }

    // Cargar opciones del formulario
    function cargarOpcionesFormulario() {
        const config = SistemaDatos.obtenerConfiguracion();
        
        // Categorías
        const selectCategoria = document.getElementById('categoria');
        if (selectCategoria) {
            selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
            config.categorias.forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        // Colores
        const selectColor = document.getElementById('color');
        if (selectColor) {
            selectColor.innerHTML = '<option value="">Seleccionar color</option>';
            config.colores.forEach(color => {
                selectColor.innerHTML += `<option value="${color}">${color}</option>`;
            });
        }
        
        // Tallas (generales por defecto)
        actualizarOpcionesTallas('');
    }

    // Actualizar opciones de tallas según categoría
    function actualizarOpcionesTallas(categoria) {
        const selectTalla = document.getElementById('talla');
        if (!selectTalla) return;
        
        const config = SistemaDatos.obtenerConfiguracion();
        let opcionesTallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
        
        selectTalla.innerHTML = '<option value="">Seleccionar talla</option>';
        opcionesTallas.forEach(talla => {
            selectTalla.innerHTML += `<option value="${talla}">${talla}</option>`;
        });
    }

    // Agregar combinación de producto
    function agregarCombinacion() {
        const container = document.getElementById('combinaciones-container');
        const index = container.children.length;
        
        const combinacionHTML = `
            <div class="combination-item" data-index="${index}">
                <div class="form-group">
                    <label>Talla</label>
                    <select class="form-control combinacion-talla" required>
                        <option value="">Seleccionar talla</option>
                        ${obtenerOpcionesTallasCombinacion()}
                    </select>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <select class="form-control combinacion-color" required>
                        <option value="">Seleccionar color</option>
                        ${obtenerOpcionesColoresCombinacion()}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" class="form-control combinacion-cantidad" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-sm btn-eliminar-combinacion" style="margin-top: 1.5rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', combinacionHTML);
        
        // Agregar evento al botón de eliminar
        const nuevaCombinacion = container.lastElementChild;
        nuevaCombinacion.querySelector('.btn-eliminar-combinacion').addEventListener('click', function() {
            this.closest('.combination-item').remove();
        });
    }

    // Obtener opciones de tallas para combinaciones
    function obtenerOpcionesTallasCombinacion() {
        const config = SistemaDatos.obtenerConfiguracion();
        const categoria = document.getElementById('categoria')?.value || '';
        const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
        
        return tallas.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    // Obtener opciones de colores para combinaciones
    function obtenerOpcionesColoresCombinacion() {
        const config = SistemaDatos.obtenerConfiguracion();
        return config.colores.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // Guardar producto (nuevo o edición)
    function guardarProducto(event) {
        event.preventDefault();
        
        const form = event.target;
        const urlParams = new URLSearchParams(window.location.search);
        const idProducto = urlParams.get('id');
        
        // Validar formulario
        if (!validarFormularioProducto(form)) {
            Sistema.mostrarMensaje('error', 'Por favor, completa todos los campos requeridos');
            return;
        }
        
        // Obtener datos del formulario
        const producto = {
            nombre: document.getElementById('nombre').value,
            codigo: document.getElementById('codigo').value || generarCodigo(),
            categoria: document.getElementById('categoria').value,
            marca: document.getElementById('marca').value,
            talla: document.getElementById('talla').value,
            color: document.getElementById('color').value,
            precioCompra: parseFloat(document.getElementById('precio-compra').value),
            precioVenta: parseFloat(document.getElementById('precio-venta').value),
            stock: parseInt(document.getElementById('stock').value),
            stockMinimo: parseInt(document.getElementById('stock-minimo').value),
            fechaCreacion: new Date().toISOString().split('T')[0]
        };
        
        // Procesar combinaciones
        const combinaciones = procesarCombinaciones();
        
        if (idProducto) {
            // Editar producto existente
            producto.id = parseInt(idProducto);
            actualizarProducto(producto, combinaciones);
        } else {
            // Crear nuevo producto
            crearProducto(producto, combinaciones);
        }
    }

    // Validar formulario de producto
    function validarFormularioProducto(form) {
        let valido = true;
        const camposRequeridos = form.querySelectorAll('[required]');
        
        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        
        // Validar que precio venta sea mayor que precio compra
        const precioCompra = parseFloat(document.getElementById('precio-compra').value);
        const precioVenta = parseFloat(document.getElementById('precio-venta').value);
        
        if (precioVenta <= precioCompra) {
            Sistema.mostrarMensaje('error', 'El precio de venta debe ser mayor al precio de compra');
            valido = false;
        }
        
        return valido;
    }

    // Generar código automático
    function generarCodigo() {
        const productos = SistemaDatos.obtenerProductos();
        const ultimoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) : 0;
        return `PROD${(ultimoId + 1).toString().padStart(4, '0')}`;
    }

    // Procesar combinaciones del formulario
    function procesarCombinaciones() {
        const combinaciones = [];
        const items = document.querySelectorAll('.combination-item');
        
        items.forEach(item => {
            const talla = item.querySelector('.combinacion-talla').value;
            const color = item.querySelector('.combinacion-color').value;
            const cantidad = parseInt(item.querySelector('.combinacion-cantidad').value);
            
            if (talla && color && cantidad > 0) {
                combinaciones.push({ talla, color, cantidad });
            }
        });
        
        return combinaciones;
    }

    // Crear nuevo producto
    function crearProducto(producto, combinaciones) {
        producto.id = SistemaDatos.generarId('producto');
        producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
        
        let productosACrear = [producto];
        
        // Agregar productos por combinaciones
        if (combinaciones.length > 0) {
            combinaciones.forEach((combinacion, index) => {
                const productoCombinacion = {
                    ...producto,
                    id: producto.id + index + 1,
                    talla: combinacion.talla,
                    color: combinacion.color,
                    stock: combinacion.cantidad
                };
                productoCombinacion.estado = SistemaDatos.actualizarEstadoProducto(productoCombinacion).estado;
                productosACrear.push(productoCombinacion);
            });
        }
        
        // Guardar productos
        const productosActuales = SistemaDatos.obtenerProductos();
        const nuevosProductos = [...productosActuales, ...productosACrear];
        SistemaDatos.guardarProductos(nuevosProductos);
        
        Sistema.mostrarMensaje('success', 'Producto creado correctamente');
        
        // Redirigir al inventario después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'inventario.html';
        }, 1500);
    }

    // Actualizar producto existente
    function actualizarProducto(producto, combinaciones) {
        const productos = SistemaDatos.obtenerProductos();
        const index = productos.findIndex(p => p.id === producto.id);
        
        if (index === -1) {
            Sistema.mostrarMensaje('error', 'Producto no encontrado');
            return;
        }
        
        // Actualizar producto principal
        producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
        productos[index] = producto;
        
        // Guardar cambios
        SistemaDatos.guardarProductos(productos);
        
        Sistema.mostrarMensaje('success', 'Producto actualizado correctamente');
        
        // Redirigir al inventario después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'inventario.html';
        }, 1500);
    }

    // Cargar producto para edición
    function cargarProductoParaEdicion(id) {
        const producto = SistemaDatos.buscarProducto(id);
        if (!producto) {
            Sistema.mostrarMensaje('error', 'Producto no encontrado');
            window.location.href = 'agregar-producto.html';
            return;
        }
        
        // Llenar formulario con datos del producto
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('codigo').value = producto.codigo;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('marca').value = producto.marca || '';
        document.getElementById('talla').value = producto.talla;
        document.getElementById('color').value = producto.color;
        document.getElementById('precio-compra').value = producto.precioCompra;
        document.getElementById('precio-venta').value = producto.precioVenta;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('stock-minimo').value = producto.stockMinimo;
        
        // Actualizar título del formulario
        document.querySelector('.page-header h2').innerHTML = `
            <i class="fas fa-edit"></i> Editar Producto
        `;
        
        // Cambiar texto del botón
        const btnSubmit = document.querySelector('#product-form button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
        }
    }

    // Editar producto (redirigir a formulario)
    function editarProducto(id) {
        window.location.href = `agregar-producto.html?id=${id}`;
    }

    // Eliminar producto
    function eliminarProducto(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }
        
        const productos = SistemaDatos.obtenerProductos();
        const nuevosProductos = productos.filter(p => p.id !== id);
        
        SistemaDatos.guardarProductos(nuevosProductos);
        
        Sistema.mostrarMensaje('success', 'Producto eliminado correctamente');
        
        // Recargar tabla
        renderizarTablaProductos(filtrosActuales);
        
        // Actualizar dashboard si está en la página principal
        if (typeof actualizarDashboard === 'function') {
            actualizarDashboard();
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializar);

    // API pública
    return {
        cambiarPagina,
        aplicarFiltros,
        limpiarFiltros,
        editarProducto,
        eliminarProducto
    };
})();