// JavaScript específico para inventario.html
let productosFiltrados = [];
let productoAEliminar = null;
const productosPorPagina = 10;
let paginaActual = 1;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventario inicializado');
    
    // Inicializar inventario
    inicializarInventario();
    
    // Configurar eventos
    configurarEventosInventario();
    
    // Cargar datos iniciales
    cargarFiltros();
    aplicarFiltros();
});

function inicializarInventario() {
    // Cargar categorías en el filtro
    const config = SistemaDatos.obtenerConfiguracion();
    const selectCategoria = document.getElementById('filtroCategoria');
    
    selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
    config.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
}

function configurarEventosInventario() {
    // Botón aplicar filtros
    document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
    
    // Botón limpiar filtros
    document.getElementById('limpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Búsqueda con Enter
    document.getElementById('buscarProducto').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });
    
    // Exportar inventario
    document.getElementById('exportarInventario').addEventListener('click', exportarInventario);
    
    // Eventos del modal de eliminación
    document.querySelector('.btn-cerrar-modal').addEventListener('click', cerrarModalEliminar);
    document.getElementById('cancelarEliminar').addEventListener('click', cerrarModalEliminar);
    document.getElementById('confirmarEliminar').addEventListener('click', confirmarEliminacion);
}

function cargarFiltros() {
    // Cargar valor de filtro desde URL si existe
    const params = new URLSearchParams(window.location.search);
    const filtro = params.get('filtro');
    
    if (filtro === 'bajo') {
        document.getElementById('filtroEstado').value = 'lowstock';
    }
}

function aplicarFiltros() {
    const filtros = {
        categoria: document.getElementById('filtroCategoria').value,
        estado: document.getElementById('filtroEstado').value,
        busqueda: document.getElementById('buscarProducto').value,
        ordenarPor: document.getElementById('ordenarPor').value
    };
    
    // Aplicar filtros
    productosFiltrados = SistemaDatos.filtrarProductos(filtros);
    paginaActual = 1;
    
    // Renderizar resultados
    renderizarTablaProductos();
    renderizarPaginacion();
    actualizarResumen();
}

function limpiarFiltros() {
    document.getElementById('buscarProducto').value = '';
    document.getElementById('filtroCategoria').value = 'todas';
    document.getElementById('filtroEstado').value = 'todos';
    document.getElementById('ordenarPor').value = 'nombre';
    
    aplicarFiltros();
}

function renderizarTablaProductos() {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = '';
    
    // Calcular índices para paginación
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    
    if (productosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No se encontraron productos</td>
            </tr>
        `;
        return;
    }
    
    productosPagina.forEach(producto => {
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
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.codigo || 'N/A'}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.talla}</td>
            <td>${producto.color}</td>
            <td>${producto.stock}</td>
            <td>S/. ${producto.precioVenta.toFixed(2)}</td>
            <td><span class="status ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="acciones-producto">
                    <a href="agregar-producto.html?id=${producto.id}" class="btn btn-warning btn-sm" title="Editar">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Agregar eventos a botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            mostrarModalEliminar(id);
        });
    });
}

function renderizarPaginacion() {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    
    if (totalPaginas <= 1) return;
    
    // Botón anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-pagina';
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
        btnPagina.className = `btn-pagina ${i === paginaActual ? 'active' : ''}`;
        btnPagina.textContent = i;
        btnPagina.addEventListener('click', () => {
            paginaActual = i;
            renderizarTablaProductos();
        });
        paginacion.appendChild(btnPagina);
    }
    
    // Botón siguiente
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-pagina';
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

function actualizarResumen() {
    const productos = SistemaDatos.obtenerProductos();
    
    // Calcular valores
    const totalProductos = productos.length;
    const valorInventario = productos.reduce((sum, p) => sum + (p.precioCompra * p.stock), 0);
    const productosBajo = productos.filter(p => p.estado === 'lowstock').length;
    const productosAgotados = productos.filter(p => p.estado === 'outofstock').length;
    
    // Actualizar UI
    document.getElementById('resumenTotal').textContent = totalProductos;
    document.getElementById('resumenValor').textContent = `S/. ${valorInventario.toFixed(2)}`;
    document.getElementById('resumenBajo').textContent = productosBajo;
    document.getElementById('resumenAgotados').textContent = productosAgotados;
}

function mostrarModalEliminar(id) {
    const producto = SistemaDatos.buscarProducto(id);
    if (!producto) return;
    
    productoAEliminar = id;
    
    // Actualizar información en el modal
    document.getElementById('nombreProductoEliminar').textContent = producto.nombre;
    document.getElementById('codigoProductoEliminar').textContent = producto.codigo || 'N/A';
    
    // Mostrar modal
    document.getElementById('modalEliminar').style.display = 'flex';
}

function cerrarModalEliminar() {
    productoAEliminar = null;
    document.getElementById('modalEliminar').style.display = 'none';
}

function confirmarEliminacion() {
    if (!productoAEliminar) return;
    
    const productos = SistemaDatos.obtenerProductos();
    const index = productos.findIndex(p => p.id === productoAEliminar);
    
    if (index !== -1) {
        productos.splice(index, 1);
        SistemaDatos.guardarProductos(productos);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('success', 'Producto eliminado correctamente');
        
        // Cerrar modal y actualizar
        cerrarModalEliminar();
        aplicarFiltros();
    }
}

function exportarInventario() {
    const productos = SistemaDatos.obtenerProductos();
    const datos = {
        fecha: new Date().toISOString().split('T')[0],
        totalProductos: productos.length,
        productos: productos.map(p => ({
            codigo: p.codigo,
            nombre: p.nombre,
            categoria: p.categoria,
            talla: p.talla,
            color: p.color,
            stock: p.stock,
            precioCompra: p.precioCompra,
            precioVenta: p.precioVenta,
            estado: p.estado
        }))
    };
    
    const datosStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarMensaje('success', 'Inventario exportado correctamente');
}

// Función auxiliar para mostrar mensajes
function mostrarMensaje(tipo, mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'success') {
        mensajeDiv.style.backgroundColor = '#4caf50';
    } else if (tipo === 'error') {
        mensajeDiv.style.backgroundColor = '#f44336';
    } else {
        mensajeDiv.style.backgroundColor = '#2196f3';
    }
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => mensajeDiv.remove(), 300);
    }, 3000);
}