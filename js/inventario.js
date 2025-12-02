function cargarInventario() {
    mostrarProductos();
    actualizarSelectores();
    actualizarEstadisticas();
    
    document.getElementById('buscar-producto').addEventListener('input', filtrarProductos);
    document.getElementById('filtro-categoria').addEventListener('change', filtrarProductos);
}

function mostrarProductos() {
    const lista = document.getElementById('lista-productos');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (datos.productos.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 3rem; text-align: center;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <p style="color: #999;">No hay productos</p>
                    <a href="agregar-producto.html" class="btn-principal" style="margin-top: 1rem;">Agregar Primer Producto</a>
                </td>
            </tr>
        `;
        return;
    }
    
    datos.productos.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = '1px solid #eee';
        
        const stockColor = producto.cantidad < 3 ? '#ff9800' : '#4caf50';
        const stockTexto = producto.cantidad < 3 ? 'BAJO' : 'OK';
        
        fila.innerHTML = `
            <td style="padding: 1rem;">
                <strong>${producto.nombre}</strong><br>
                <small style="color: #999;">${producto.marca || ''}</small>
            </td>
            <td style="padding: 1rem;">
                <span class="badge">${producto.categoria}</span>
            </td>
            <td style="padding: 1rem;">
                ${producto.talla || ''} / ${producto.color || ''}
            </td>
            <td style="padding: 1rem;">
                <span style="background: ${stockColor}; color: white; padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.85rem;">
                    ${producto.cantidad} ${stockTexto}
                </span>
            </td>
            <td style="padding: 1rem; font-weight: bold;">
                S/. ${producto.precio.toFixed(2)}
            </td>
            <td style="padding: 1rem;">
                <button onclick="editarProducto(${index})" style="background: #2196f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; margin-right: 0.5rem; cursor: pointer;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarProducto(${index})" style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        lista.appendChild(fila);
    });
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    
    const filas = document.querySelectorAll('#lista-productos tr');
    filas.forEach(fila => {
        const nombre = fila.querySelector('td:first-child strong')?.textContent?.toLowerCase() || '';
        const cat = fila.querySelector('.badge')?.textContent || '';
        
        const coincideNombre = nombre.includes(busqueda);
        const coincideCategoria = !categoria || cat === categoria;
        
        fila.style.display = coincideNombre && coincideCategoria ? '' : 'none';
    });
}

function actualizarSelectores() {
    const select = document.getElementById('filtro-categoria');
    select.innerHTML = '<option value="">Todas las categorías</option>';
    
    const categoriasUnicas = [...new Set(datos.productos.map(p => p.categoria))];
    categoriasUnicas.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

function actualizarEstadisticas() {
    const total = datos.productos.length;
    const bajo = datos.productos.filter(p => p.cantidad < 3).length;
    const valorTotal = datos.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    
    document.getElementById('contador-total').textContent = total;
    document.getElementById('contador-bajo').textContent = bajo;
    document.getElementById('valor-total').textContent = `S/. ${valorTotal.toFixed(2)}`;
}

function editarProducto(index) {
    const producto = datos.productos[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h3>Editar Producto</h3>
                <button class="btn-cerrar" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nombre</label>
                        <input type="text" id="edit-nombre" value="${producto.nombre}" 
                               style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Categoría</label>
                        <select id="edit-categoria" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                            ${datos.categorias.map(cat => 
                                `<option value="${cat}" ${producto.categoria === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Talla</label>
                            <input type="text" id="edit-talla" value="${producto.talla || ''}" 
                                   style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Color</label>
                            <select id="edit-color" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                                ${datos.colores.map(color => 
                                    `<option value="${color}" ${producto.color === color ? 'selected' : ''}>${color}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Precio</label>
                            <input type="number" id="edit-precio" value="${producto.precio}" 
                                   style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Cantidad</label>
                            <input type="number" id="edit-cantidad" value="${producto.cantidad}" 
                                   style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn-secundario" onclick="this.closest('.modal').remove()" style="flex: 1;">Cancelar</button>
                        <button class="btn-principal" onclick="guardarEdicion(${index}, this)" style="flex: 1;">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-editar').appendChild(modal);
}

async function guardarEdicion(index, btn) {
    const modal = btn.closest('.modal');
    const precio = parseFloat(document.getElementById('edit-precio').value);
    const cantidad = parseInt(document.getElementById('edit-cantidad').value);
    
    if (precio <= 0 || cantidad < 0) {
        mostrarNotificacion('Precio y cantidad deben ser válidos', 'error');
        return;
    }
    
    datos.productos[index] = {
        ...datos.productos[index],
        nombre: document.getElementById('edit-nombre').value,
        categoria: document.getElementById('edit-categoria').value,
        talla: document.getElementById('edit-talla').value,
        color: document.getElementById('edit-color').value,
        precio: precio,
        cantidad: cantidad
    };
    
    guardarDatos();
    mostrarProductos();
    actualizarEstadisticas();
    modal.remove();
    mostrarNotificacion('Producto actualizado', 'exito');
}

async function eliminarProducto(index) {
    const confirmado = await mostrarConfirmacion('¿Eliminar este producto?');
    if (!confirmado) return;
    
    datos.productos.splice(index, 1);
    guardarDatos();
    mostrarProductos();
    actualizarEstadisticas();
    mostrarNotificacion('Producto eliminado', 'exito');
}