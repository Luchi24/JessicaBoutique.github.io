// Datos de ejemplo para el inventario
let productos = [
    {
        id: 1,
        nombre: "Vestido de Noche Elegante",
        categoria: "vestidos",
        marca: "Zara",
        talla: "M",
        color: "Negro",
        precioCompra: 45.00,
        precioVenta: 89.99,
        cantidad: 12,
        estado: "disponible",
        fechaCreacion: "2023-10-15"
    },
    {
        id: 2,
        nombre: "Jeans Slim Fit",
        categoria: "pantalones",
        marca: "H&M",
        talla: "L",
        color: "Azul",
        precioCompra: 25.50,
        precioVenta: 49.99,
        cantidad: 8,
        estado: "disponible",
        fechaCreacion: "2023-10-10"
    },
    {
        id: 3,
        nombre: "Blusa de Seda",
        categoria: "blusas",
        marca: "Mango",
        talla: "S",
        color: "Blanco",
        precioCompra: 18.75,
        precioVenta: 39.99,
        cantidad: 3,
        estado: "bajo",
        fechaCreacion: "2023-10-05"
    },
    {
        id: 4,
        nombre: "Chaqueta de Cuero",
        categoria: "chaquetas",
        marca: "Bershka",
        talla: "M",
        color: "Negro",
        precioCompra: 65.00,
        precioVenta: 129.99,
        cantidad: 0,
        estado: "agotado",
        fechaCreacion: "2023-09-28"
    },
    {
        id: 5,
        nombre: "Falda Plisada",
        categoria: "faldas",
        marca: "Stradivarius",
        talla: "S",
        color: "Rojo",
        precioCompra: 22.00,
        precioVenta: 44.99,
        cantidad: 15,
        estado: "disponible",
        fechaCreacion: "2023-10-12"
    },
    {
        id: 6,
        nombre: "Vestido Floral Veraniego",
        categoria: "vestidos",
        marca: "Zara",
        talla: "L",
        color: "Multicolor",
        precioCompra: 35.00,
        precioVenta: 69.99,
        cantidad: 7,
        estado: "disponible",
        fechaCreacion: "2023-10-08"
    },
    {
        id: 7,
        nombre: "Pantalón de Vestir",
        categoria: "pantalones",
        marca: "Mango",
        talla: "M",
        color: "Gris",
        precioCompra: 40.00,
        precioVenta: 79.99,
        cantidad: 2,
        estado: "bajo",
        fechaCreacion: "2023-09-30"
    },
    {
        id: 8,
        nombre: "Blusa con Volantes",
        categoria: "blusas",
        marca: "H&M",
        talla: "XS",
        color: "Rosa",
        precioCompra: 15.00,
        precioVenta: 34.99,
        cantidad: 20,
        estado: "disponible",
        fechaCreacion: "2023-10-18"
    },
    {
        id: 9,
        nombre: "Collar de Perlas",
        categoria: "accesorios",
        marca: "Zara",
        talla: "Única",
        color: "Blanco",
        precioCompra: 8.50,
        precioVenta: 19.99,
        cantidad: 25,
        estado: "disponible",
        fechaCreacion: "2023-10-20"
    },
    {
        id: 10,
        nombre: "Chaqueta Denim",
        categoria: "chaquetas",
        marca: "Bershka",
        talla: "L",
        color: "Azul",
        precioCompra: 42.00,
        precioVenta: 84.99,
        cantidad: 5,
        estado: "disponible",
        fechaCreacion: "2023-10-14"
    },
    {
        id: 11,
        nombre: "Falda Lápiz",
        categoria: "faldas",
        marca: "Stradivarius",
        talla: "M",
        color: "Negro",
        precioCompra: 28.00,
        precioVenta: 55.99,
        cantidad: 10,
        estado: "disponible",
        fechaCreacion: "2023-10-03"
    },
    {
        id: 12,
        nombre: "Top de Encaje",
        categoria: "blusas",
        marca: "H&M",
        talla: "S",
        color: "Negro",
        precioCompra: 12.50,
        precioVenta: 29.99,
        cantidad: 0,
        estado: "agotado",
        fechaCreacion: "2023-09-25"
    }
];

// Variables de paginación
let productosPorPagina = 10;
let paginaActual = 1;
let productosFiltrados = [...productos];

// Elementos DOM
const tablaProductos = document.getElementById('tablaProductos');
const pageNumbers = document.getElementById('pageNumbers');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const productCount = document.getElementById('productCount');
const buscarProducto = document.getElementById('buscarProducto');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroMarca = document.getElementById('filtroMarca');
const filtroTalla = document.getElementById('filtroTalla');
const filtroCantidad = document.getElementById('filtroCantidad');
const filtroStock = document.getElementById('filtroStock');
const ordenarPor = document.getElementById('ordenarPor');
const editarModal = document.getElementById('editarModal');
const eliminarModal = document.getElementById('eliminarModal');
const confirmarEliminarBtn = document.getElementById('confirmarEliminar');
const exportBtn = document.getElementById('exportBtn');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Activar la opción del menú correspondiente
    document.querySelector('nav a[href="inventario.html"]').classList.add('active');
    
    // Cargar productos iniciales
    renderizarProductos();
    actualizarPaginacion();
    
    // Configurar event listeners para filtros
    buscarProducto.addEventListener('input', aplicarFiltros);
    filtroCategoria.addEventListener('change', aplicarFiltros);
    filtroMarca.addEventListener('change', aplicarFiltros);
    filtroTalla.addEventListener('change', aplicarFiltros);
    filtroCantidad.addEventListener('change', aplicarFiltros);
    filtroStock.addEventListener('change', aplicarFiltros);
    ordenarPor.addEventListener('change', aplicarFiltros);
    
    // Configurar event listeners para paginación
    prevPageBtn.addEventListener('click', () => cambiarPagina(paginaActual - 1));
    nextPageBtn.addEventListener('click', () => cambiarPagina(paginaActual + 1));
    
    // Configurar event listeners para modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            editarModal.style.display = 'none';
            eliminarModal.style.display = 'none';
        });
    });
    
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            editarModal.style.display = 'none';
            eliminarModal.style.display = 'none';
        });
    });
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === editarModal) {
            editarModal.style.display = 'none';
        }
        if (e.target === eliminarModal) {
            eliminarModal.style.display = 'none';
        }
    });
    
    // Configurar botón de exportar
    exportBtn.addEventListener('click', exportarInventario);
});

// Función para renderizar productos en la tabla
function renderizarProductos() {
    tablaProductos.innerHTML = '';
    
    // Calcular índices para la paginación
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    
    // Si no hay productos que mostrar
    if (productosPagina.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 48px; color: var(--gris-oscuro); margin-bottom: 15px;"></i>
                    <h3 style="color: var(--gris-oscuro);">No se encontraron productos</h3>
                    <p>Intenta con otros criterios de búsqueda</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Renderizar cada producto
    productosPagina.forEach(producto => {
        const fila = document.createElement('tr');
        
        // Determinar clase de estado
        let estadoClase = 'disponible';
        let estadoTexto = 'En Stock';
        
        if (producto.cantidad === 0) {
            estadoClase = 'agotado';
            estadoTexto = 'Agotado';
        } else if (producto.cantidad < 5) {
            estadoClase = 'bajo';
            estadoTexto = 'Bajo Stock';
        }
        
        fila.innerHTML = `
            <td>${producto.id}</td>
            <td><strong>${producto.nombre}</strong></td>
            <td><span class="categoria-badge">${capitalizarPrimeraLetra(producto.categoria)}</span></td>
            <td>${producto.marca}</td>
            <td>${producto.talla.toUpperCase()}</td>
            <td>
                <div class="color-indicador" style="background-color: ${obtenerColorHex(producto.color)}"></div>
                ${capitalizarPrimeraLetra(producto.color)}
            </td>
            <td>$${producto.precioCompra.toFixed(2)}</td>
            <td><strong>$${producto.precioVenta.toFixed(2)}</strong></td>
            <td>${producto.cantidad}</td>
            <td><span class="estado-stock ${estadoClase}">${estadoTexto}</span></td>
            <td class="acciones-cell">
                <button class="btn-editar" data-id="${producto.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-eliminar" data-id="${producto.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tablaProductos.appendChild(fila);
    });
    
    // Agregar event listeners a los botones de editar y eliminar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            abrirModalEditar(id);
        });
    });
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            abrirModalEliminar(id);
        });
    });
    
    // Actualizar contador de productos
    const totalProductos = productosFiltrados.length;
    const mostrandoDesde = inicio + 1;
    const mostrandoHasta = Math.min(fin, totalProductos);
    productCount.textContent = `Mostrando ${mostrandoDesde}-${mostrandoHasta} de ${totalProductos} productos`;
}

// Función para capitalizar la primera letra
function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Función para obtener color HEX basado en nombre
function obtenerColorHex(nombreColor) {
    const colores = {
        'negro': '#000000',
        'blanco': '#ffffff',
        'rojo': '#f44336',
        'azul': '#2196f3',
        'verde': '#4caf50',
        'rosa': '#e91e63',
        'morado': '#9c27b0',
        'amarillo': '#ffeb3b',
        'gris': '#9e9e9e',
        'beige': '#d7ccc8',
        'multicolor': 'linear-gradient(45deg, #f44336, #e91e63, #9c27b0, #2196f3)'
    };
    
    return colores[nombreColor.toLowerCase()] || '#cccccc';
}

// Función para actualizar la paginación
function actualizarPaginacion() {
    pageNumbers.innerHTML = '';
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    
    // Si no hay productos, no mostrar paginación
    if (totalPaginas === 0) {
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }
    
    // Determinar qué números de página mostrar
    let inicioPagina = Math.max(1, paginaActual - 2);
    let finPagina = Math.min(totalPaginas, paginaActual + 2);
    
    // Ajustar si estamos cerca del inicio
    if (paginaActual <= 3) {
        finPagina = Math.min(totalPaginas, 5);
    }
    
    // Ajustar si estamos cerca del final
    if (paginaActual >= totalPaginas - 2) {
        inicioPagina = Math.max(1, totalPaginas - 4);
    }
    
    // Crear botones para cada página
    for (let i = inicioPagina; i <= finPagina; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-number';
        if (i === paginaActual) {
            btn.classList.add('active');
        }
        btn.textContent = i;
        btn.addEventListener('click', () => cambiarPagina(i));
        pageNumbers.appendChild(btn);
    }
    
    // Actualizar estado de los botones de anterior/siguiente
    prevPageBtn.disabled = paginaActual === 1;
    nextPageBtn.disabled = paginaActual === totalPaginas;
}

// Función para cambiar de página
function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarProductos();
        actualizarPaginacion();
    }
}

// Función para aplicar filtros
function aplicarFiltros() {
    // Reiniciar a la primera página
    paginaActual = 1;
    
    // Obtener valores de los filtros
    const busqueda = buscarProducto.value.toLowerCase();
    const categoria = filtroCategoria.value;
    const marca = filtroMarca.value;
    const talla = filtroTalla.value;
    const cantidad = filtroCantidad.value;
    const stock = filtroStock.value;
    const orden = ordenarPor.value;
    
    // Filtrar productos
    productosFiltrados = productos.filter(producto => {
        // Filtro por búsqueda
        if (busqueda && !producto.nombre.toLowerCase().includes(busqueda)) {
            return false;
        }
        
        // Filtro por categoría
        if (categoria && producto.categoria !== categoria) {
            return false;
        }
        
        // Filtro por marca
        if (marca && producto.marca !== marca) {
            return false;
        }
        
        // Filtro por talla
        if (talla && producto.talla !== talla) {
            return false;
        }
        
        // Filtro por cantidad
        if (cantidad === 'bajo' && producto.cantidad >= 5) {
            return false;
        }
        if (cantidad === 'medio' && (producto.cantidad < 5 || producto.cantidad > 20)) {
            return false;
        }
        if (cantidad === 'alto' && producto.cantidad <= 20) {
            return false;
        }
        
        // Filtro por stock
        if (stock === 'si' && producto.cantidad === 0) {
            return false;
        }
        if (stock === 'no' && producto.cantidad > 0) {
            return false;
        }
        
        return true;
    });
    
    // Ordenar productos
    productosFiltrados.sort((a, b) => {
        switch (orden) {
            case 'recientes':
                return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
            case 'cantidad':
                return b.cantidad - a.cantidad;
            case 'precio-asc':
                return a.precioVenta - b.precioVenta;
            case 'precio-desc':
                return b.precioVenta - a.precioVenta;
            default:
                return 0;
        }
    });
    
    // Renderizar productos filtrados
    renderizarProductos();
    actualizarPaginacion();
}

// Función para abrir modal de edición
function abrirModalEditar(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    // Llenar el modal con el formulario de edición
    const modalBody = editarModal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="formEditarProducto">
            <div class="form-row">
                <div class="form-group">
                    <label for="editNombre">Nombre del Producto</label>
                    <input type="text" id="editNombre" value="${producto.nombre}" required>
                </div>
                <div class="form-group">
                    <label for="editCategoria">Categoría</label>
                    <select id="editCategoria" required>
                        <option value="vestidos" ${producto.categoria === 'vestidos' ? 'selected' : ''}>Vestidos</option>
                        <option value="pantalones" ${producto.categoria === 'pantalones' ? 'selected' : ''}>Pantalones</option>
                        <option value="blusas" ${producto.categoria === 'blusas' ? 'selected' : ''}>Blusas</option>
                        <option value="faldas" ${producto.categoria === 'faldas' ? 'selected' : ''}>Faldas</option>
                        <option value="chaquetas" ${producto.categoria === 'chaquetas' ? 'selected' : ''}>Chaquetas</option>
                        <option value="accesorios" ${producto.categoria === 'accesorios' ? 'selected' : ''}>Accesorios</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editMarca">Marca</label>
                    <select id="editMarca" required>
                        <option value="Zara" ${producto.marca === 'Zara' ? 'selected' : ''}>Zara</option>
                        <option value="Mango" ${producto.marca === 'Mango' ? 'selected' : ''}>Mango</option>
                        <option value="H&M" ${producto.marca === 'H&M' ? 'selected' : ''}>H&M</option>
                        <option value="Bershka" ${producto.marca === 'Bershka' ? 'selected' : ''}>Bershka</option>
                        <option value="Stradivarius" ${producto.marca === 'Stradivarius' ? 'selected' : ''}>Stradivarius</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editTalla">Talla</label>
                    <select id="editTalla" required>
                        <option value="xs" ${producto.talla === 'xs' ? 'selected' : ''}>XS</option>
                        <option value="s" ${producto.talla === 's' ? 'selected' : ''}>S</option>
                        <option value="m" ${producto.talla === 'm' ? 'selected' : ''}>M</option>
                        <option value="l" ${producto.talla === 'l' ? 'selected' : ''}>L</option>
                        <option value="xl" ${producto.talla === 'xl' ? 'selected' : ''}>XL</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editColor">Color</label>
                    <select id="editColor" required>
                        <option value="negro" ${producto.color === 'negro' ? 'selected' : ''}>Negro</option>
                        <option value="blanco" ${producto.color === 'blanco' ? 'selected' : ''}>Blanco</option>
                        <option value="rojo" ${producto.color === 'rojo' ? 'selected' : ''}>Rojo</option>
                        <option value="azul" ${producto.color === 'azul' ? 'selected' : ''}>Azul</option>
                        <option value="verde" ${producto.color === 'verde' ? 'selected' : ''}>Verde</option>
                        <option value="rosa" ${producto.color === 'rosa' ? 'selected' : ''}>Rosa</option>
                        <option value="morado" ${producto.color === 'morado' ? 'selected' : ''}>Morado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editCantidad">Cantidad</label>
                    <input type="number" id="editCantidad" value="${producto.cantidad}" min="0" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editPrecioCompra">Precio de Compra</label>
                    <input type="number" id="editPrecioCompra" value="${producto.precioCompra}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="editPrecioVenta">Precio de Venta</label>
                    <input type="number" id="editPrecioVenta" value="${producto.precioVenta}" step="0.01" min="0" required>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar Cambios</button>
            </div>
        </form>
    `;
    
    // Configurar el formulario de edición
    const formEditar = document.getElementById('formEditarProducto');
    formEditar.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Actualizar el producto
        producto.nombre = document.getElementById('editNombre').value;
        producto.categoria = document.getElementById('editCategoria').value;
        producto.marca = document.getElementById('editMarca').value;
        producto.talla = document.getElementById('editTalla').value;
        producto.color = document.getElementById('editColor').value;
        producto.cantidad = parseInt(document.getElementById('editCantidad').value);
        producto.precioCompra = parseFloat(document.getElementById('editPrecioCompra').value);
        producto.precioVenta = parseFloat(document.getElementById('editPrecioVenta').value);
        
        // Actualizar estado basado en cantidad
        if (producto.cantidad === 0) {
            producto.estado = 'agotado';
        } else if (producto.cantidad < 5) {
            producto.estado = 'bajo';
        } else {
            producto.estado = 'disponible';
        }
        
        // Actualizar la tabla
        aplicarFiltros();
        
        // Cerrar modal
        editarModal.style.display = 'none';
        
        // Mostrar mensaje de éxito
        alert('Producto actualizado correctamente');
    });
    
    // Mostrar el modal
    editarModal.style.display = 'flex';
}

// Función para abrir modal de eliminación
function abrirModalEliminar(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    // Mostrar información del producto a eliminar
    document.getElementById('productoAEliminar').textContent = `${producto.nombre} (ID: ${producto.id})`;
    
    // Configurar el botón de confirmar eliminación
    confirmarEliminarBtn.onclick = function() {
        // Eliminar el producto del array
        const index = productos.findIndex(p => p.id === id);
        if (index !== -1) {
            productos.splice(index, 1);
        }
        
        // Actualizar la tabla
        aplicarFiltros();
        
        // Cerrar modal
        eliminarModal.style.display = 'none';
        
        // Mostrar mensaje de éxito
        alert('Producto eliminado correctamente');
    };
    
    // Mostrar el modal
    eliminarModal.style.display = 'flex';
}

// Función para exportar inventario
function exportarInventario() {
    // Crear contenido CSV
    let csv = 'ID,Nombre,Categoría,Marca,Talla,Color,Precio Compra,Precio Venta,Cantidad,Estado\n';
    
    productosFiltrados.forEach(producto => {
        const estado = producto.cantidad === 0 ? 'Agotado' : 
                      producto.cantidad < 5 ? 'Bajo Stock' : 'En Stock';
        
        csv += `${producto.id},"${producto.nombre}",${producto.categoria},${producto.marca},${producto.talla},${producto.color},${producto.precioCompra},${producto.precioVenta},${producto.cantidad},${estado}\n`;
    });
    
    // Crear un blob y descargar
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_jessica_boutique_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Mostrar mensaje
    alert('Inventario exportado correctamente');
}