function inicializarAgregar() {
    cargarSelectores();
    configurarEventos();
    actualizarVistaPrevia();
}

function cargarSelectores() {
    const catSelect = document.getElementById('categoria');
    const colorSelect = document.getElementById('color');
    
    catSelect.innerHTML = '<option value="">Seleccionar</option>';
    datos.categorias.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    colorSelect.innerHTML = '<option value="">Seleccionar</option>';
    datos.colores.forEach(color => {
        colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
    });
}

function configurarEventos() {
    const inputs = ['nombre', 'categoria', 'marca', 'talla', 'color', 'precio', 'cantidad'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', actualizarVistaPrevia);
        }
    });
}

function actualizarVistaPrevia() {
    document.getElementById('preview-nombre').textContent = 
        document.getElementById('nombre').value || 'Nombre del Producto';
    
    document.getElementById('preview-categoria').textContent = 
        document.getElementById('categoria').value || 'Categoría';
    
    document.getElementById('preview-marca').textContent = 
        document.getElementById('marca').value || '-';
    
    const talla = document.getElementById('talla').value || 'Única';
    const color = document.getElementById('color').value || '-';
    document.getElementById('preview-detalles').textContent = `${talla} / ${color}`;
    
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    document.getElementById('preview-precio').textContent = `S/. ${precio.toFixed(2)}`;
    
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    document.getElementById('preview-cantidad').textContent = cantidad;
}

function agregarProducto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value;
    const marca = document.getElementById('marca').value.trim();
    const talla = document.getElementById('talla').value || 'Única';
    const color = document.getElementById('color').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    
    if (!nombre || !categoria || !marca || !color) {
        mostrarNotificacion('Completa todos los campos requeridos', 'error');
        return;
    }
    
    if (precio <= 0 || cantidad < 0) {
        mostrarNotificacion('Precio y cantidad deben ser válidos', 'error');
        return;
    }
    
    const nuevoProducto = {
        nombre: nombre,
        categoria: categoria,
        marca: marca,
        talla: talla,
        color: color,
        precio: precio,
        cantidad: cantidad,
        fechaCreacion: new Date().toISOString()
    };
    
    datos.productos.push(nuevoProducto);
    guardarDatos();
    
    mostrarNotificacion('Producto agregado exitosamente', 'exito');
    
    setTimeout(() => {
        window.location.href = 'inventario.html';
    }, 1500);
}