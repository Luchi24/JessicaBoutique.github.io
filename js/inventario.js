function cargarInventario() {
    mostrarProductos();
    mostrarEstadisticas();
    actualizarSelectores();
}

function mostrarProductos() {
    const lista = document.getElementById('lista-productos');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (datos.productos.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: var(--gris-medio); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--gris-oscuro); margin-bottom: 0.5rem;">No hay productos</h3>
                    <p style="color: var(--gris-oscuro);">Agrega productos o importa un backup</p>
                    <button class="btn-principal" onclick="location.href='agregar-producto.html'" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Agregar Primer Producto
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    datos.productos.forEach((producto, index) => {
        const stockClass = producto.cantidad < 5 ? 'stock-bajo' : 
                          producto.cantidad < 20 ? 'stock-medio' : 'stock-alto';
        
        const precioCompra = producto.precioCompra || 0;
        const precioVenta = producto.precio || 0;
        const ganancia = precioVenta - precioCompra;
        const porcentajeGanancia = precioCompra > 0 ? ((ganancia / precioCompra) * 100).toFixed(1) : 0;
        
        lista.innerHTML += `
            <tr>
                <td>${producto.nombre || 'Sin nombre'}</td>
                <td><span class="badge">${producto.categoria || 'Sin categoría'}</span></td>
                <td>${producto.marca || 'Sin marca'}</td>
                <td>${producto.talla || 'Sin talla'}</td>
                <td>${producto.color || 'Sin color'}</td>
                <td class="${stockClass}">${producto.cantidad || 0}</td>
                <td>S/. ${precioVenta.toFixed(2)}</td>
                <td style="color: ${ganancia >= 0 ? 'green' : 'red'}; font-size: 0.85em;">
                    G: S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)
                </td>
                <td>
                    <button class="btn-editar" onclick="editarProducto(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    actualizarSelectores();
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const marca = document.getElementById('filtro-marca').value;
    const talla = document.getElementById('filtro-talla').value;
    
    const lista = document.getElementById('lista-productos');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const productosFiltrados = datos.productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = !categoria || producto.categoria === categoria;
        const coincideMarca = !marca || producto.marca === marca;
        const coincideTalla = !talla || producto.talla === talla;
        
        return coincideNombre && coincideCategoria && coincideMarca && coincideTalla;
    });
    
    productosFiltrados.forEach((producto, index) => {
        const stockClass = producto.cantidad < 5 ? 'stock-bajo' : 
                          producto.cantidad < 20 ? 'stock-medio' : 'stock-alto';
        
        const ganancia = producto.precio - producto.precioCompra;
        const porcentajeGanancia = ((ganancia / producto.precioCompra) * 100).toFixed(1);
        
        lista.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td><span class="badge">${producto.categoria}</span></td>
                <td>${producto.marca}</td>
                <td>${producto.talla}</td>
                <td>${producto.color}</td>
                <td class="${stockClass}">${producto.cantidad}</td>
                <td>S/. ${producto.precio.toFixed(2)}</td>
                <td style="color: ${ganancia >= 0 ? 'green' : 'red'}; font-size: 0.85em;">
                    G: S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)
                </td>
                <td>
                    <button class="btn-editar" onclick="editarProducto(${datos.productos.indexOf(producto)})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${datos.productos.indexOf(producto)})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function ordenarProductos() {
    const orden = document.getElementById('ordenar-por').value;
    
    switch(orden) {
        case 'nombre':
            datos.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'cantidad':
            datos.productos.sort((a, b) => a.cantidad - b.cantidad);
            break;
        case 'precio':
            datos.productos.sort((a, b) => a.precio - b.precio);
            break;
        case 'ganancia':
            datos.productos.sort((a, b) => 
                (b.precio - b.precioCompra) - (a.precio - a.precioCompra)
            );
            break;
    }
    
    mostrarProductos();
}

function editarProducto(index) {
    const producto = datos.productos[index];
    
    const modalContent = `
        <form id="form-editar-producto" onsubmit="guardarEdicion(${index}, event)">
            <div class="grupo-formulario">
                <label>Nombre del Producto</label>
                <input type="text" id="edit-nombre" value="${producto.nombre}" required>
            </div>
            
            <div class="grupo-doble">
                <div class="grupo-formulario">
                    <label>Categoría</label>
                    <select id="edit-categoria" required>
                        ${datos.categorias.map(cat => 
                            `<option value="${cat}" ${producto.categoria === cat ? 'selected' : ''}>${cat}</option>`
                        ).join('')}
                </select>
                </div>
                <div class="grupo-formulario">
                    <label>Marca</label>
                    <input type="text" id="edit-marca" value="${producto.marca}" required>
                </div>
            </div>
            
            <div class="grupo-doble">
                <div class="grupo-formulario">
                    <label>Talla</label>
                    <select id="edit-talla" required>
                        ${tallasDisponibles.map(talla => 
                            `<option value="${talla}" ${producto.talla === talla ? 'selected' : ''}>${talla}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="grupo-formulario">
                    <label>Color</label>
                    <select id="edit-color" required>
                        ${datos.colores.map(color => 
                            `<option value="${color}" ${producto.color === color ? 'selected' : ''}>${color}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="grupo-doble">
                <div class="grupo-formulario">
                    <label>Precio Compra</label>
                    <input type="number" id="edit-precio-compra" value="${producto.precioCompra || 0}" 
                           required min="0" step="0.01">
                </div>
                <div class="grupo-formulario">
                    <label>Precio Venta</label>
                    <input type="number" id="edit-precio-venta" value="${producto.precio}" 
                           required min="0" step="0.01">
                </div>
            </div>
            
            <div class="grupo-formulario">
                <label>Cantidad</label>
                <input type="number" id="edit-cantidad" value="${producto.cantidad}" required min="0">
            </div>
            
            <div class="botones-formulario">
                <button type="button" class="btn-secundario" onclick="cerrarModal('modal-editar')">Cancelar</button>
                <button type="submit" class="btn-principal">Guardar Cambios</button>
            </div>
        </form>
    `;
    
    document.getElementById('modal-editar-body').innerHTML = modalContent;
    document.getElementById('modal-editar').style.display = 'flex';
}

function guardarEdicion(index, event) {
    event.preventDefault();
    
    const precioCompra = parseFloat(document.getElementById('edit-precio-compra').value);
    const precioVenta = parseFloat(document.getElementById('edit-precio-venta').value);
    
    if (precioVenta <= precioCompra) {
        mostrarNotificacion('El precio de venta debe ser mayor al de compra', 'error');
        return;
    }
    
    datos.productos[index] = {
        ...datos.productos[index],
        nombre: document.getElementById('edit-nombre').value,
        categoria: document.getElementById('edit-categoria').value,
        marca: document.getElementById('edit-marca').value,
        talla: document.getElementById('edit-talla').value,
        color: document.getElementById('edit-color').value,
        precioCompra: precioCompra,
        precio: precioVenta,
        cantidad: parseInt(document.getElementById('edit-cantidad').value)
    };
    
    guardarDatos();
    mostrarProductos();
    mostrarEstadisticas();
    cerrarModal('modal-editar');
    mostrarNotificacion('Producto actualizado correctamente', 'exito');
}

function eliminarProducto(index) {
    mostrarConfirmacion(
        '¿Estás seguro de eliminar este producto?',
        { peligroso: true }
    ).then(resultado => {
        if (resultado) {
            datos.productos.splice(index, 1);
            guardarDatos();
            mostrarProductos();
            mostrarEstadisticas();
            mostrarNotificacion('Producto eliminado correctamente', 'exito');
        }
    });
}

function mostrarEstadisticas() {
    const totalProductos = document.getElementById('total-productos');
    const stockBajo = document.getElementById('stock-bajo');
    const valorTotal = document.getElementById('valor-total');
    const gananciaTotal = document.getElementById('ganancia-total');
    
    if (!totalProductos || !stockBajo || !valorTotal || !gananciaTotal) return;
    
    const total = datos.productos.length;
    const bajo = datos.productos.filter(p => p.cantidad < 5).length;
    const valorInventario = datos.productos.reduce((sum, p) => sum + (p.precioCompra * p.cantidad), 0);
    const gananciaPotencial = datos.productos.reduce((sum, p) => 
        sum + ((p.precio - p.precioCompra) * p.cantidad), 0);
    
    totalProductos.textContent = total;
    stockBajo.textContent = bajo;
    valorTotal.textContent = 'S/. ' + valorInventario.toFixed(2);
    gananciaTotal.textContent = 'S/. ' + gananciaPotencial.toFixed(2);
}