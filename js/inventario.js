// Inventario - JavaScript específico
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 10;
let productoAEliminar = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventario - Inicializando...');
    
    // Cargar filtros
    cargarFiltros();
    
    // Cargar productos iniciales
    cargarProductos();
    
    // Actualizar resumen
    actualizarResumenInventario();
    
    // Configurar eventos
    configurarEventosInventario();
});

function cargarFiltros() {
    const config = SistemaDatos.obtenerConfiguracion();
    const selectCategoria = document.getElementById('filtroCategoria');
    
    if (!selectCategoria) return;
    
    // Limpiar y agregar opciones de categorías
    selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
    
    config.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
}

function cargarProductos(filtros = {}) {
    // Obtener productos
    let productos = SistemaDatos.obtenerProductos();
    
    // Aplicar filtros
    productos = aplicarFiltros(productos, filtros);
    
    // Guardar productos filtrados
    productosFiltrados = productos;
    
    // Resetear a página 1
    paginaActual = 1;
    
    // Renderizar tabla
    renderizarTablaProductos();
    
    // Renderizar paginación
    renderizarPaginacion();
}

function aplicarFiltros(productos, filtros) {
    let resultado = [...productos];
    
    // Filtrar por categoría
    if (filtros.categoria && filtros.categoria !== 'todas') {
        resultado = resultado.filter(p => p.categoria === filtros.categoria);
    }
    
    // Filtrar por estado
    if (filtros.estado && filtros.estado !== 'todos') {
        resultado = resultado.filter(p => p.estado === filtros.estado);
    }
    
    // Filtrar por búsqueda
    if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(busqueda)) ||
            (p.codigo && p.codigo.toLowerCase().includes(busqueda)) ||
            (p.marca && p.marca.toLowerCase().includes(busqueda))
        );
    }
    
    // Ordenar
    if (filtros.ordenarPor) {
        resultado.sort((a, b) => {
            switch(filtros.ordenarPor) {
                case 'nombre':
                    return a.nombre.localeCompare(b.nombre);
                case 'stock':
                    return b.stock - a.stock;
                case 'precio':
                    return b.precioVenta - a.precioVenta;
                case 'reciente':
                    return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
                default:
                    return 0;
            }
        });
    }
    
    return resultado;
}

function renderizarTablaProductos() {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    
    // Calcular índices para paginación
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (productosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No se encontraron productos</td>
            </tr>
        `;
        return;
    }
    
    // Agregar cada producto
    productosPagina.forEach(producto => {
        const fila = document.createElement('tr');
        
        // Determinar clase de estado
        let estadoClass = '';
        let estadoText = '';
        
        switch(producto.estado) {
            case 'instock':
                estadoClass = 'status-instock';
                estadoText = 'En Stock';
                break;
            case 'lowstock':
                estadoClass = 'status-lowstock';
                estadoText = 'Stock Bajo';
                break;
            case 'outofstock':
                estadoClass = 'status-outofstock';
                estadoText = 'Agotado';
                break;
        }
        
        fila.innerHTML = `
            <td>${producto.codigo || 'N/A'}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.talla}</td>
            <td>${producto.color}</td>
            <td>${producto.stock}</td>
            <td>S/. ${producto.precioVenta ? producto.precioVenta.toFixed(2) : '0.00'}</td>
            <td><span class="status ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="acciones-tabla">
                    <a href="agregar-producto.html?id=${producto.id}" class="btn btn-warning btn-sm">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn btn-danger btn-sm btn-eliminar-producto" data-id="${producto.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.btn-eliminar-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            mostrarModalEliminar(id);
        });
    });
}

function renderizarPaginacion() {
    const paginacion = document.getElementById('paginacion');
    if (!paginacion) return;
    
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    
    // Limpiar paginación
    paginacion.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    // Botón anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-paginacion';
    btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTablaProductos();
        }
    });
    paginacion.appendChild(btnAnterior);
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = `btn-paginacion ${i === paginaActual ? 'active' : ''}`;
        btnPagina.textContent = i;
        btnPagina.addEventListener('click', () => {
            paginaActual = i;
            renderizarTablaProductos();
        });
        paginacion.appendChild(btnPagina);
    }
    
    // Botón siguiente
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-paginacion';
    btnSiguiente.innerHTML = '<i class="fas fa-chevron-right"></i>';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTablaProductos();
        }
    });
    paginacion.appendChild(btnSiguiente);
}

function actualizarResumenInventario() {
    const productos = SistemaDatos.obtenerProductos();
    
    // Calcular valores
    const totalProductos = productos.length;
    const valorInventario = productos.reduce((total, p) => {
        return total + (p.precioCompra || 0) * (p.stock || 0);
    }, 0);
    
    const productosBajoStock = productos.filter(p => p.estado === 'lowstock').length;
    const productosAgotados = productos.filter(p => p.estado === 'outofstock').length;
    
    // Actualizar UI
    const elTotal = document.getElementById('resumenTotal');
    const elValor = document.getElementById('resumenValor');
    const elBajo = document.getElementById('resumenBajo');
    const elAgotados = document.getElementById('resumenAgotados');
    
    if (elTotal) elTotal.textContent = totalProductos;
    if (elValor) elValor.textContent = `S/. ${valorInventario.toFixed(2)}`;
    if (elBajo) elBajo.textContent = productosBajoStock;
    if (elAgotados) elAgotados.textContent = productosAgotados;
}

function configurarEventosInventario() {
    // Botón aplicar filtros
    const btnAplicar = document.getElementById('aplicarFiltros');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', function() {
            const filtros = obtenerFiltrosActuales();
            cargarProductos(filtros);
        });
    }
    
    // Botón limpiar filtros
    const btnLimpiar = document.getElementById('limpiarFiltros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            limpiarFiltros();
            cargarProductos();
        });
    }
    
    // Exportar inventario
    const btnExportar = document.getElementById('exportarInventario');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarInventario();
        });
    }
    
    // Buscar con Enter
    const inputBusqueda = document.getElementById('buscarProducto');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const filtros = obtenerFiltrosActuales();
                cargarProductos(filtros);
            }
        });
    }
    
    // Modal de eliminación
    const modalEliminar = document.getElementById('modalEliminar');
    if (modalEliminar) {
        const btnCerrar = modalEliminar.querySelector('.btn-cerrar-modal');
        const btnCancelar = document.getElementById('cancelarEliminar');
        const btnConfirmar = document.getElementById('confirmarEliminar');
        
        if (btnCerrar) {
            btnCerrar.addEventListener('click', function() {
                modalEliminar.style.display = 'none';
            });
        }
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                modalEliminar.style.display = 'none';
            });
        }
        
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', function() {
                if (productoAEliminar) {
                    eliminarProducto(productoAEliminar);
                    modalEliminar.style.display = 'none';
                }
            });
        }
        
        // Cerrar al hacer clic fuera
        modalEliminar.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
}

function obtenerFiltrosActuales() {
    return {
        categoria: document.getElementById('filtroCategoria') ? document.getElementById('filtroCategoria').value : 'todas',
        estado: document.getElementById('filtroEstado') ? document.getElementById('filtroEstado').value : 'todos',
        busqueda: document.getElementById('buscarProducto') ? document.getElementById('buscarProducto').value : '',
        ordenarPor: document.getElementById('ordenarPor') ? document.getElementById('ordenarPor').value : 'nombre'
    };
}

function limpiarFiltros() {
    const selectCategoria = document.getElementById('filtroCategoria');
    const selectEstado = document.getElementById('filtroEstado');
    const inputBusqueda = document.getElementById('buscarProducto');
    const selectOrdenar = document.getElementById('ordenarPor');
    
    if (selectCategoria) selectCategoria.value = 'todas';
    if (selectEstado) selectEstado.value = 'todos';
    if (inputBusqueda) inputBusqueda.value = '';
    if (selectOrdenar) selectOrdenar.value = 'nombre';
}

function mostrarModalEliminar(id) {
    const producto = SistemaDatos.obtenerProductos().find(p => p.id === id);
    if (!producto) return;
    
    productoAEliminar = id;
    
    const modal = document.getElementById('modalEliminar');
    const nombreProducto = document.getElementById('nombreProductoEliminar');
    const codigoProducto = document.getElementById('codigoProductoEliminar');
    
    if (nombreProducto) nombreProducto.textContent = producto.nombre;
    if (codigoProducto) codigoProducto.textContent = producto.codigo || 'N/A';
    
    if (modal) modal.style.display = 'flex';
}

function eliminarProducto(id) {
    // Obtener productos actuales
    let productos = SistemaDatos.obtenerProductos();
    
    // Filtrar el producto a eliminar
    productos = productos.filter(p => p.id !== id);
    
    // Guardar cambios
    SistemaDatos.guardarProductos(productos);
    
    // Mostrar mensaje
    alert('Producto eliminado correctamente');
    
    // Recargar datos
    cargarProductos();
    actualizarResumenInventario();
}

function exportarInventario() {
    const productos = productosFiltrados.length > 0 ? productosFiltrados : SistemaDatos.obtenerProductos();
    
    // Crear contenido CSV
    let csv = 'Código,Nombre,Categoría,Talla,Color,Stock,Precio Compra,Precio Venta,Estado\n';
    
    productos.forEach(producto => {
        csv += `"${producto.codigo || ''}","${producto.nombre || ''}","${producto.categoria || ''}","${producto.talla || ''}","${producto.color || ''}",${producto.stock || 0},${producto.precioCompra || 0},${producto.precioVenta || 0},"${producto.estado || ''}"\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario-jessica-boutique-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Inventario exportado correctamente');
}