let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Rosa', 'Morado', 'Amarillo'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas', 'Accesorios', 'Calzado', 'Bolsos'],
    marcas: []
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
    mostrarMarcas();
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
    const marcaSelect = document.getElementById('marca-producto');
    const marcaFilter = document.getElementById('filtro-marca');
    
    catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    catFilter.innerHTML = '<option value="">Todas las categorías</option>';
    marcaSelect.innerHTML = '<option value="">Seleccionar marca</option>';
    marcaFilter.innerHTML = '<option value="">Todas las marcas</option>';
    
    datos.categorias.forEach(categoria => {
        catSelect.innerHTML += `<option value="${categoria}">${categoria}</option>`;
        catFilter.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
    
    datos.marcas.forEach(marca => {
        marcaSelect.innerHTML += `<option value="${marca}">${marca}</option>`;
        marcaFilter.innerHTML += `<option value="${marca}">${marca}</option>`;
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
                <td>${producto.marca}</td>
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
    const marca = document.getElementById('filtro-marca').value;
    const talla
