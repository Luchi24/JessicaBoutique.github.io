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
        marcaFilter.innerHTML += `<option value="${marca}">${marca}</option
