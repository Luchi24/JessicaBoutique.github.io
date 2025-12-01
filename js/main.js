let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos']
};

function cargarDatos() {
    const guardados = localStorage.getItem('inventario_jessica');
    if (guardados) {
        datos = JSON.parse(guardados);
    }
    actualizarSelectores();
    mostrarProductos();
    mostrarEstadisticas();
    mostrarColores();
    mostrarCategorias();
}

function guardarDatos() {
    localStorage.setItem('inventario_jessica', JSON.stringify(datos));
}

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => {
        s.classList.remove('activa');
    });
    
    document.getElementById(seccion).classList.add('activa');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (seccion === 'agregar') {
        actualizarVistaPrevia();
    }
}

function actualizarSelectores() {
    const catSelect = document.getElementById('categoria-producto');
    const catFilter = document.getElementById('filtro-categoria');
    
    catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    catFilter.innerHTML = '<option value="">Todas las categorías</option>';
    
    datos.categorias.forEach(categoria => {
        catSelect.innerHTML += `<option value="${categoria}">${categoria}</option>`;
        catFilter.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
    
    document.querySelectorAll('.combinacion-color').forEach(select => {
        select.innerHTML = '<option value="">Seleccionar color</option>';
        datos.colores.forEach(color => {
            select.innerHTML += `<option value="${color}">${color}</option>`;
        });
    });
}

function mostrarProductos() {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = '';
    
    datos.productos.forEach((producto, index) => {
        const stockClass = producto.cantidad < 5 ? 'stock-bajo' : 
                          producto.cantidad < 20 ? 'stock-medio' : 'stock-alto';
        
        lista.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td><span class="badge">${producto.categoria}</span></td>
                <td>${producto.talla}</td>
                <td>${producto.color}</td>
                <td class="${stockClass}">${producto.cantidad}</td>
                <td>S/. ${producto.precio.toFixed(2)}</td>
                <td>
                    <button class="btn-editar" onclick="editarProducto(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${index})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const talla = document.getElementById('filtro-talla').value;
    
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = '';
    
    const productosFiltrados = datos.productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = !categoria || producto.categoria === categoria;
        const coincideTalla = !talla || producto.talla === talla;
        
        return coincideNombre && coincideCategoria && coincideTalla;
    });
    
    productosFiltrados.forEach((producto, index) => {
        const stockClass = producto.cantidad < 5 ? 'stock-bajo' : 
                          producto.cantidad < 20 ? 'stock-medio' : 'stock-alto';
        
        lista.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td><span class="badge">${producto.categoria}</span></td>
                <td>${producto.talla}</td>
                <td>${producto.color}</td>
                <td class="${stockClass}">${producto.cantidad}</td>
                <td>S/. ${producto.precio.toFixed(2)}</td>
                <td>
                    <button class="btn-editar" onclick="editarProducto(${datos.productos.indexOf(producto)})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${datos.productos.indexOf(producto)})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
}

function ordenarProductos() {
    const orden = document.getElementById('ordenar-por').value;
    
    if (orden === 'nombre') {
        datos.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === 'cantidad') {
        datos.productos.sort((a, b) => a.cantidad - b.cantidad);
    } else if (orden === 'precio') {
        datos.productos.sort((a, b) => a.precio - b.precio);
    }
    
    mostrarProductos();
}

function agregarCombinacion() {
    const container = document.getElementById('combinaciones-container');
    const combinacion = document.createElement('div');
    combinacion.className = 'combinacion-item';
    combinacion.innerHTML = `
        <select class="combinacion-talla" required>
            <option value="">Seleccionar talla</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="Única">Única</option>
        </select>
        <select class="combinacion-color" required>
            <option value="">Seleccionar color</option>
            ${datos.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
        </select>
        <input type="number" class="combinacion-cantidad" required min="0" placeholder="Cantidad">
        <button type="button" class="btn-eliminar-combinacion" onclick="eliminarCombinacion(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(combinacion);
}

function eliminarCombinacion(boton) {
    const combinacion = boton.closest('.combinacion-item');
    if (combinacion && document.querySelectorAll('.combinacion-item').length > 1) {
        combinacion.remove();
        actualizarVistaPrevia();
    }
}

function agregarProducto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre-producto').value;
    const categoria = document.getElementById('categoria-producto').value;
    const precio = parseFloat(document.getElementById('precio-producto').value);
    
    const combinaciones = [];
    document.querySelectorAll('.combinacion-item').forEach(item => {
        const talla = item.querySelector('.combinacion-talla').value;
        const color = item.querySelector('.combinacion-color').value;
        const cantidad = parseInt(item.querySelector('.combinacion-cantidad').value);
        
        if (talla && color && cantidad >= 0) {
            combinaciones.push({ talla, color, cantidad });
        }
    });
    
    if (combinaciones.length === 0) {
        mostrarNotificacion('Debe agregar al menos una combinación talla-color', 'error');
        return;
    }
    
    combinaciones.forEach(combinacion => {
        const producto = {
            nombre: nombre,
            categoria: categoria,
            talla: combinacion.talla,
            color: combinacion.color,
            precio: precio,
            cantidad: combinacion.cantidad
        };
        datos.productos.push(producto);
    });
    
    guardarDatos();
    mostrarProductos();
    mostrarEstadisticas();
    
    limpiarFormulario();
    mostrarNotificacion('Producto(s) agregado(s) correctamente', 'exito');
}

function limpiarFormulario() {
    document.getElementById('form-agregar-producto').reset();
    const container = document.getElementById('combinaciones-container');
    container.innerHTML = `
        <div class="combinacion-item">
            <select class="combinacion-talla" required>
                <option value="">Seleccionar talla</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="Única">Única</option>
            </select>
            <select class="combinacion-color" required>
                <option value="">Seleccionar color</option>
            </select>
            <input type="number" class="combinacion-cantidad" required min="0" placeholder="Cantidad">
            <button type="button" class="btn-eliminar-combinacion" onclick="eliminarCombinacion(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    actualizarSelectores();
    actualizarVistaPrevia();
}

function actualizarVistaPrevia() {
    const nombre = document.getElementById('nombre-producto').value || 'Nombre del Producto';
    const categoria = document.getElementById('categoria-producto').value || 'Categoría';
    const precio = document.getElementById('precio-producto').value || '0.00';
    
    document.getElementById('preview-nombre').textContent = nombre;
    document.getElementById('preview-categoria').textContent = categoria;
    document.getElementById('preview-precio').textContent = 'S/. ' + parseFloat(precio).toFixed(2);
    
    const combinacionesPreview = document.getElementById('preview-combinaciones');
    combinacionesPreview.innerHTML = '';
    
    document.querySelectorAll('.combinacion-item').forEach(item => {
        const talla = item.querySelector('.combinacion-talla').value || '-';
        const color = item.querySelector('.combinacion-color').value || '-';
        const cantidad = item.querySelector('.combinacion-cantidad').value || '0';
        
        if (talla !== '-' || color !== '-' || cantidad !== '0') {
            combinacionesPreview.innerHTML += `
                <div class="combinacion-preview">
                    Talla: ${talla} | Color: ${color} | Cantidad: ${cantidad}
                </div>
            `;
        }
    });
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
                            `<option value="${cat}" ${producto.categoria.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}>${cat}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="grupo-formulario">
                    <label>Talla</label>
                    <select id="edit-talla" required>
                        <option value="XS" ${producto.talla === 'XS' ? 'selected' : ''}>XS</option>
                        <option value="S" ${producto.talla === 'S' ? 'selected' : ''}>S</option>
                        <option value="M" ${producto.talla === 'M' ? 'selected' : ''}>M</option>
                        <option value="L" ${producto.talla === 'L' ? 'selected' : ''}>L</option>
                        <option value="XL" ${producto.talla === 'XL' ? 'selected' : ''}>XL</option>
                        <option value="Única" ${producto.talla === 'Única' ? 'selected' : ''}>Única</option>
                    </select>
                </div>
            </div>
            
            <div class="grupo-doble">
                <div class="grupo-formulario">
                    <label>Color</label>
                    <select id="edit-color" required>
                        ${datos.colores.map(color => 
                            `<option value="${color}" ${producto.color.toLowerCase() === color.toLowerCase() ? 'selected' : ''}>${color}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="grupo-formulario">
                    <label>Precio</label>
                    <input type="number" id="edit-precio" value="${producto.precio}" required min="0" step="0.01">
                </div>
            </div>
            
            <div class="grupo-formulario">
                <label>Cantidad</label>
                <input type="number" id="edit-cantidad" value="${producto.cantidad}" required min="0">
            </div>
            
            <div class="botones-formulario">
                <button type="button" class="btn-secundario" onclick="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn-principal">Guardar Cambios</button>
            </div>
        </form>
    `;
    
    document.querySelector('.modal-body').innerHTML = modalContent;
    document.getElementById('modal-producto').style.display = 'flex';
}

function guardarEdicion(index, event) {
    event.preventDefault();
    
    datos.productos[index] = {
        nombre: document.getElementById('edit-nombre').value,
        categoria: document.getElementById('edit-categoria').value,
        talla: document.getElementById('edit-talla').value,
        color: document.getElementById('edit-color').value,
        precio: parseFloat(document.getElementById('edit-precio').value),
        cantidad: parseInt(document.getElementById('edit-cantidad').value)
    };
    
    guardarDatos();
    mostrarProductos();
    mostrarEstadisticas();
    cerrarModal();
    mostrarNotificacion('Producto actualizado correctamente', 'exito');
}

function eliminarProducto(index) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        datos.productos.splice(index, 1);
        guardarDatos();
        mostrarProductos();
        mostrarEstadisticas();
        mostrarNotificacion('Producto eliminado correctamente', 'exito');
    }
}

function mostrarEstadisticas() {
    const total = datos.productos.length;
    const stockBajo = datos.productos.filter(p => p.cantidad < 5).length;
    const valorTotal = datos.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    
    document.getElementById('total-productos').textContent = total;
    document.getElementById('stock-bajo').textContent = stockBajo;
    document.getElementById('valor-total').textContent = 'S/. ' + valorTotal.toFixed(2);
}

function mostrarColores() {
    const lista = document.getElementById('lista-colores');
    lista.innerHTML = '';
    
    datos.colores.forEach((color, index) => {
        lista.innerHTML += `
            <div class="item">
                <span>${color}</span>
                <button class="btn-eliminar" onclick="eliminarColor(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function agregarColor() {
    const nuevoColor = document.getElementById('nuevo-color').value.trim();
    const nuevoColorLower = nuevoColor.toLowerCase();
    
    if (!nuevoColor) {
        mostrarNotificacion('Ingrese un nombre de color', 'error');
        return;
    }
    
    const existe = datos.colores.some(color => color.toLowerCase() === nuevoColorLower);
    
    if (!existe) {
        datos.colores.push(nuevoColor);
        guardarDatos();
        mostrarColores();
        actualizarSelectores();
        document.getElementById('nuevo-color').value = '';
        mostrarNotificacion('Color agregado correctamente', 'exito');
    } else {
        mostrarNotificacion('Este color ya existe', 'error');
    }
}

function eliminarColor(index) {
    if (confirm('¿Eliminar este color?')) {
        datos.colores.splice(index, 1);
        guardarDatos();
        mostrarColores();
        actualizarSelectores();
        mostrarNotificacion('Color eliminado', 'exito');
    }
}

function mostrarCategorias() {
    const lista = document.getElementById('lista-categorias');
    lista.innerHTML = '';
    
    datos.categorias.forEach((categoria, index) => {
        lista.innerHTML += `
            <div class="item">
                <span>${categoria}</span>
                <button class="btn-eliminar" onclick="eliminarCategoria(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function agregarCategoria() {
    const nuevaCategoria = document.getElementById('nueva-categoria').value.trim();
    const nuevaCategoriaLower = nuevaCategoria.toLowerCase();
    
    if (!nuevaCategoria) {
        mostrarNotificacion('Ingrese un nombre de categoría', 'error');
        return;
    }
    
    const existe = datos.categorias.some(cat => cat.toLowerCase() === nuevaCategoriaLower);
    
    if (!existe) {
        datos.categorias.push(nuevaCategoria);
        guardarDatos();
        mostrarCategorias();
        actualizarSelectores();
        document.getElementById('nueva-categoria').value = '';
        mostrarNotificacion('Categoría agregada correctamente', 'exito');
    } else {
        mostrarNotificacion('Esta categoría ya existe', 'error');
    }
}

function eliminarCategoria(index) {
    if (confirm('¿Eliminar esta categoría?')) {
        datos.categorias.splice(index, 1);
        guardarDatos();
        mostrarCategorias();
        actualizarSelectores();
        mostrarNotificacion('Categoría eliminada', 'exito');
    }
}

function exportarDatos() {
    const dataStr = JSON.stringify(datos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `inventario-jessica-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    mostrarNotificacion('Datos exportados correctamente', 'exito');
}

function importarDatos(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            datos.productos = datos.productos.concat(importedData.productos || []);
            guardarDatos();
            mostrarProductos();
            mostrarEstadisticas();
            mostrarNotificacion('Productos importados correctamente', 'exito');
        } catch (error) {
            mostrarNotificacion('Error al importar el archivo', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function importarBackup(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            datos = importedData;
            guardarDatos();
            cargarDatos();
            mostrarNotificacion('Backup importado correctamente', 'exito');
        } catch (error) {
            mostrarNotificacion('Error al importar el backup', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function cerrarModal() {
    document.getElementById('modal-producto').style.display = 'none';
}

function mostrarNotificacion(mensaje, tipo) {
    const notificaciones = document.getElementById('notificaciones');
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'exito' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    notificaciones.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

window.onload = function() {
    cargarDatos();
    
    document.querySelectorAll('#form-agregar-producto input, #form-agregar-producto select').forEach(element => {
        element.addEventListener('input', actualizarVistaPrevia);
        element.addEventListener('change', actualizarVistaPrevia);
    });
    
    document.getElementById('combinaciones-container').addEventListener('change', actualizarVistaPrevia);
    document.getElementById('combinaciones-container').addEventListener('input', actualizarVistaPrevia);
};