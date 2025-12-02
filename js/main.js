let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos'],
    ventas: [],
    config: {
        ultimoIdVenta: 0
    }
};

// ============== INICIALIZACIÓN ==============
function cargarDatos() {
    const guardados = localStorage.getItem('inventario_jessica_v2');
    if (guardados) {
        datos = JSON.parse(guardados);
    } else {
        // Intentar cargar versión anterior
        const oldData = localStorage.getItem('inventario_jessica');
        if (oldData) {
            const old = JSON.parse(oldData);
            datos.productos = old.productos || [];
            datos.colores = old.colores || datos.colores;
            datos.categorias = old.categorias || datos.categorias;
            
            // Añadir precioCompra a productos antiguos si no existe
            datos.productos.forEach(producto => {
                if (!producto.precioCompra) {
                    producto.precioCompra = producto.precio * 0.7; // Estimado
                }
            });
        }
    }
    
    actualizarSelectores();
    mostrarProductos();
    mostrarEstadisticas();
    mostrarColores();
    mostrarCategorias();
    cargarSelectProductosVenta();
    actualizarReportes();
}

function guardarDatos() {
    localStorage.setItem('inventario_jessica_v2', JSON.stringify(datos));
}

// ============== NAVEGACIÓN ==============
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => {
        s.classList.remove('activa');
    });
    
    document.getElementById(seccion).classList.add('activa');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Encontrar el botón correspondiente
    const botonSeccion = Array.from(document.querySelectorAll('.nav-btn')).find(btn => {
        return btn.textContent.includes(
            seccion === 'inventario' ? 'Inventario' :
            seccion === 'agregar' ? 'Agregar' :
            seccion === 'ventas' ? 'Ventas' :
            seccion === 'reportes' ? 'Reportes' : 'Gestión'
        );
    });
    
    if (botonSeccion) {
        botonSeccion.classList.add('active');
    }
    
    if (seccion === 'agregar') {
        actualizarVistaPrevia();
    } else if (seccion === 'ventas') {
        actualizarResumenVenta();
    }
}

// ============== INVENTARIO ==============
function actualizarSelectores() {
    // Selector de categoría para agregar producto
    const catSelect = document.getElementById('categoria-producto');
    const catFilter = document.getElementById('filtro-categoria');
    const marcaFilter = document.getElementById('filtro-marca');
    
    catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    catFilter.innerHTML = '<option value="">Todas las categorías</option>';
    marcaFilter.innerHTML = '<option value="">Todas las marcas</option>';
    
    datos.categorias.forEach(categoria => {
        catSelect.innerHTML += `<option value="${categoria}">${categoria}</option>`;
        catFilter.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
    
    const marcasUnicas = [...new Set(datos.productos.map(p => p.marca).filter(m => m))];
    marcasUnicas.forEach(marca => {
        marcaFilter.innerHTML += `<option value="${marca}">${marca}</option>`;
    });
    
    // Actualizar selectores de color
    document.querySelectorAll('.combinacion-color').forEach(select => {
        if (select.innerHTML.includes('Seleccionar color')) {
            select.innerHTML = '<option value="">Seleccionar color</option>';
            datos.colores.forEach(color => {
                select.innerHTML += `<option value="${color}">${color}</option>`;
            });
        }
    });
}

function mostrarProductos() {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = '';
    
    datos.productos.forEach((producto, index) => {
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
                <td>
                    <span style="color: ${ganancia >= 0 ? 'green' : 'red'}; font-size: 0.85em;">
                        G: S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)
                    </span>
                </td>
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
    
    actualizarSelectores();
}

// ============== AGREGAR PRODUCTO ==============
function agregarCombinacion() {
    const container = document.getElementById('combinaciones-container');
    const combinacion = document.createElement('div');
    combinacion.className = 'combinacion-item';
    combinacion.innerHTML = `
        <select class="combinacion-talla" required onchange="actualizarVistaPrevia()">
            <option value="">Seleccionar talla</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="Única">Única</option>
        </select>
        <select class="combinacion-color" required onchange="actualizarVistaPrevia()">
            <option value="">Seleccionar color</option>
            ${datos.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
        </select>
        <input type="number" class="combinacion-cantidad" required min="0" placeholder="Cantidad" oninput="actualizarVistaPrevia()">
        <button type="button" class="btn-eliminar-combinacion" onclick="eliminarCombinacion(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(combinacion);
}

function agregarProducto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre-producto').value;
    const categoria = document.getElementById('categoria-producto').value;
    const marca = document.getElementById('marca-producto').value;
    const precioCompra = parseFloat(document.getElementById('precio-compra').value);
    const precioVenta = parseFloat(document.getElementById('precio-venta').value);
    
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
        mostrarNotificacion('Debe agregar al menos una combinación', 'error');
        return;
    }
    
    if (precioVenta <= precioCompra) {
        mostrarNotificacion('El precio de venta debe ser mayor al de compra', 'error');
        return;
    }
    
    combinaciones.forEach(combinacion => {
        const producto = {
            nombre: nombre,
            categoria: categoria,
            marca: marca,
            talla: combinacion.talla,
            color: combinacion.color,
            precioCompra: precioCompra,
            precio: precioVenta,
            cantidad: combinacion.cantidad
        };
        datos.productos.push(producto);
    });
    
    guardarDatos();
    mostrarProductos();
    mostrarEstadisticas();
    cargarSelectProductosVenta();
    
    limpiarFormulario();
    mostrarNotificacion('Producto(s) agregado(s) correctamente', 'exito');
}

function actualizarVistaPrevia() {
    const nombre = document.getElementById('nombre-producto').value || 'Nombre del Producto';
    const categoria = document.getElementById('categoria-producto').value || 'Categoría';
    const marca = document.getElementById('marca-producto').value || 'Marca';
    const precioCompra = parseFloat(document.getElementById('precio-compra').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precio-venta').value) || 0;
    const ganancia = precioVenta - precioCompra;
    const porcentajeGanancia = precioCompra > 0 ? ((ganancia / precioCompra) * 100).toFixed(1) : 0;
    
    document.getElementById('preview-nombre').textContent = nombre;
    document.getElementById('preview-categoria').textContent = categoria;
    document.getElementById('preview-marca').textContent = marca;
    document.getElementById('preview-precio-compra').textContent = `S/. ${precioCompra.toFixed(2)}`;
    document.getElementById('preview-precio-venta').textContent = `S/. ${precioVenta.toFixed(2)}`;
    document.getElementById('preview-ganancia').textContent = `S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)`;
    
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

// ============== VENTAS ==============
function cargarSelectProductosVenta() {
    document.querySelectorAll('.producto-seleccion').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccionar producto</option>';
        
        datos.productos.forEach((producto, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text
