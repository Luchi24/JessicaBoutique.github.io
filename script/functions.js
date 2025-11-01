// --- VARIABLES GLOBALES DE DATOS (SIMULAN LA BASE DE DATOS) ---
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let categorias = JSON.parse(localStorage.getItem('categorias')) || [
    { id: 1, nombre: 'Vestidos' },
    { id: 2, nombre: 'Blusas' }
];
let nextProductId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
let nextCategoryId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 3;

// --- FUNCIONES DE ALMACENAMIENTO ---
function guardarDatos() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('categorias', JSON.stringify(categorias));
}

// --- FUNCIONES DE CATEGORÍA ---

/**
 * Crea una nueva categoría y actualiza la UI.
 * @param {string} nombre Nombre de la nueva categoría.
 */
function crearCategoria(nombre) {
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert('La categoría ya existe.');
        return;
    }
    const nuevaCategoria = {
        id: nextCategoryId++,
        nombre: nombre.trim()
    };
    categorias.push(nuevaCategoria);
    guardarDatos();
    cargarCategoriasUI();
    alert(`Categoría '${nombre}' creada con éxito.`);
}

/**
 * Muestra las categorías disponibles en la sección de gestión
 * y en el selector de productos.
 */
function cargarCategoriasUI() {
    const listaCategorias = document.getElementById('lista-categorias');
    const selectCategoria = document.getElementById('categoria-producto');
    
    listaCategorias.innerHTML = '';
    // Limpiar select, manteniendo la opción por defecto
    selectCategoria.innerHTML = '<option value="">-- Seleccionar Categoría --</option>';

    categorias.forEach(categoria => {
        // Para la lista de gestión
        const span = document.createElement('span');
        span.textContent = categoria.nombre;
        listaCategorias.appendChild(span);

        // Para el selector de productos
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        selectCategoria.appendChild(option);
    });
}

// --- FUNCIONES DE PRODUCTO (CRUD) ---

/**
 * Muestra la lista de productos en la tabla.
 */
function cargarProductosUI() {
    const tablaBody = document.querySelector('#tabla-productos tbody');
    tablaBody.innerHTML = '';

    productos.forEach(producto => {
        const categoria = categorias.find(c => c.id === parseInt(producto.id_categoria));
        const nombreCategoria = categoria ? categoria.nombre : 'Sin Categoría';
        
        const fila = tablaBody.insertRow();
        fila.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${nombreCategoria}</td>
            <td>${producto.stock}</td>
            <td>${producto.precio.toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;
    });
}

/**
 * Agrega un nuevo producto o guarda los cambios de uno existente.
 * @param {object} datos Datos del formulario del producto.
 */
function guardarProducto(datos) {
    if (datos.id) {
        // Lógica de EDICIÓN (Actualizar)
        const index = productos.findIndex(p => p.id === parseInt(datos.id));
        if (index !== -1) {
            productos[index] = {
                id: parseInt(datos.id),
                nombre: datos.nombre,
                stock: parseInt(datos.stock),
                precio: parseFloat(datos.precio),
                id_categoria: parseInt(datos.id_categoria)
            };
            alert(`Producto ID ${datos.id} actualizado.`);
        }
    } else {
        // Lógica de CREACIÓN
        const nuevoProducto = {
            id: nextProductId++,
            nombre: datos.nombre,
            stock: parseInt(datos.stock),
            precio: parseFloat(datos.precio),
            id_categoria: parseInt(datos.id_categoria)
        };
        productos.push(nuevoProducto);
        alert(`Producto '${datos.nombre}' creado con éxito.`);
    }
    
    guardarDatos();
    cargarProductosUI();
    limpiarFormularioProducto();
}

/**
 * Carga los datos de un producto en el formulario para su edición.
 * @param {number} id ID del producto a editar.
 */
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('nombre-producto').value = producto.nombre;
        document.getElementById('stock-producto').value = producto.stock;
        document.getElementById('precio-producto').value = producto.precio;
        document.getElementById('categoria-producto').value = producto.id_categoria;
        
        // Cambiar texto del botón para indicar edición
        document.getElementById('btn-submit-producto').textContent = 'Guardar Cambios';
        document.getElementById('btn-cancelar').style.display = 'inline-block';
    }
}

/**
 * Elimina un producto del array y actualiza la interfaz.
 * @param {number} id ID del producto a eliminar.
 */
function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        cargarProductosUI();
        limpiarFormularioProducto();
        alert('Producto eliminado con éxito.');
    }
}

/**
 * Limpia el formulario de producto después de guardar/crear/cancelar.
 */
function limpiarFormularioProducto() {
    document.getElementById('form-producto').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('btn-submit-producto').textContent = 'Crear Producto';
    document.getElementById('btn-cancelar').style.display = 'none';
}


// --- INICIALIZACIÓN Y MANEJO DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar las listas iniciales al cargar la página
    cargarCategoriasUI();
    cargarProductosUI();

    // 2. Manejar el formulario de Categoría
    document.getElementById('form-categoria').addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-categoria').value.trim();
        if (nombre) {
            crearCategoria(nombre);
            this.reset();
        }
    });

    // 3. Manejar el formulario de Producto (Crear/Editar)
    document.getElementById('form-producto').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const datosFormulario = {
            id: document.getElementById('producto-id').value,
            nombre: document.getElementById('nombre-producto').value,
            stock: document.getElementById('stock-producto').value,
            precio: document.getElementById('precio-producto').value,
            id_categoria: document.getElementById('categoria-producto').value
        };
        
        // Se podría enviar aquí a PHP, pero para simular, llamamos a la función JS
        // enviarDatosPHP(datosFormulario); 
        guardarProducto(datosFormulario);
    });

    // 4. Manejar el botón de Cancelar Edición
    document.getElementById('btn-cancelar').addEventListener('click', limpiarFormularioProducto);
});

/*
 * FUNCIÓN DE SIMULACIÓN PHP (No se usa directamente en este ejemplo JS, 
 * pero ilustra cómo se haría la conexión si el backend estuviera listo)
 */
function enviarDatosPHP(datos) {
    fetch('script/server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor PHP (simulación):', data);
        // Aquí se recargarían los productos desde el servidor real si existiera
    })
    .catch((error) => {
        console.error('Error al enviar a PHP:', error);
    });
}