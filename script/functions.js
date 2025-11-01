// =================================================================================
// Archivo: script/functions.js
// Propósito: Contiene la lógica CRUD (Crear, Leer, Actualizar, Eliminar)
//            - Categorías: Persistencia SIMULADA usando localStorage.
//            - Productos: Persistencia REAL usando PHP (db_connector.php) y MySQL/XAMPP.
// =================================================================================

// --- VARIABLES GLOBALES DE DATOS ---

// Productos (Inicialmente vacío, se carga desde la BD vía PHP)
let productos = []; 

// Categorías (Persistencia en localStorage)
let categorias = JSON.parse(localStorage.getItem('categorias')) || [
    { id: 1, nombre: 'Vestidos' },
    { id: 2, nombre: 'Blusas' }
];
let nextCategoryId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 3;


// --- FUNCIONES DE ALMACENAMIENTO LOCAL (Solo para Categorías) ---
function guardarDatosLocal() {
    localStorage.setItem('categorias', JSON.stringify(categorias));
    // NOTA: Los productos NO se guardan aquí, sino en la BD.
}

// --- FUNCIONES DE CONEXIÓN AL SERVIDOR (Para Productos CRUD) ---

/**
 * URL base para conectar con tu script PHP que maneja la BD.
 * IMPORTANTE: Modifica esta ruta si tu proyecto no está en el root de htdocs/jessica_boutique.
 */
const URL_BASE_SERVIDOR = 'http://localhost/jessica_boutique/script/db_connector.php';

/**
 * Envía datos del formulario de producto al servidor (PHP) para CRUD.
 * @param {object} datos Datos del formulario de producto.
 */
function enviarDatosAServidor(datos) {
    // Determinar la acción a realizar (Asumiendo que 'id' solo existe en edición/eliminación)
    const accion = datos.id ? (datos.accion || 'editarProducto') : 'crearProducto';

    fetch(URL_BASE_SERVIDOR, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Enviar todos los datos junto con la acción
        body: JSON.stringify({...datos, accion: accion}) 
    })
    .then(response => {
        // Manejar caso donde PHP no devuelve JSON (ej. errores de servidor)
        if (!response.ok) throw new Error('Error de red o servidor no disponible.');
        return response.json();
    })
    .then(data => {
        if (data.estado === 'ok') {
            alert(`✅ Operación exitosa: ${data.mensaje}`);
            // Una vez guardado/editado, recargar los productos desde la BD
            cargarProductosDesdeBD(); 
        } else {
            alert(`❌ Error del servidor: ${data.mensaje}`);
        }
    })
    .catch((error) => {
        console.error('Error al conectar con el servidor:', error);
        alert(`❌ Error de conexión o servidor no disponible. Asegúrate de que XAMPP esté corriendo. Detalle: ${error.message}`);
    })
    .finally(() => {
        limpiarFormularioProducto();
    });
}

/**
 * Obtiene todos los productos de la base de datos.
 */
function cargarProductosDesdeBD() {
    fetch(`${URL_BASE_SERVIDOR}?accion=obtenerProductos`)
    .then(response => response.json())
    .then(data => {
        if (data.estado === 'ok') {
            productos = data.data || []; // Asigna los datos obtenidos a la variable global 'productos'
            cargarProductosUI(); // Actualiza la tabla HTML
        } else {
            console.error('Error al obtener productos:', data.mensaje);
        }
    })
    .catch((error) => {
        console.error('Error al comunicarse con la BD:', error);
    });
}


// --- FUNCIONES DE CATEGORÍA (Persistencia en localStorage) ---

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
    guardarDatosLocal(); // Usa localStorage
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
    
    // Si los elementos no existen (ej: estamos en index.html), simplemente salimos.
    if (!listaCategorias || !selectCategoria) return;

    listaCategorias.innerHTML = '';
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

// --- FUNCIONES DE PRODUCTO (Interactúa con la Base de Datos) ---

/**
 * Muestra la lista de productos en la tabla (utiliza la variable global 'productos').
 */
function cargarProductosUI() {
    const tablaBody = document.querySelector('#tabla-productos tbody');
    if (!tablaBody) return; // Evita error si no estamos en inventario.html

    tablaBody.innerHTML = '';

    productos.forEach(producto => {
        // Busca la categoría usando los datos locales
        const categoria = categorias.find(c => c.id === parseInt(producto.id_categoria));
        const nombreCategoria = categoria ? categoria.nombre : 'Sin Categoría';
        
        const fila = tablaBody.insertRow();
        fila.innerHTML = `
            <td>${producto.id_producto || producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${nombreCategoria}</td>
            <td>${producto.stock_actual || producto.stock}</td>
            <td>${(producto.precio_venta || producto.precio).toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarProducto(${producto.id_producto || producto.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${producto.id_producto || producto.id})">Eliminar</button>
            </td>
        `;
    });
}

/**
 * Prepara los datos del formulario y llama al servidor para guardar o editar.
 * @param {object} datos Datos del formulario del producto.
 */
function guardarProducto(datosFormulario) {
    
    if (datosFormulario.id_categoria === "" || !datosFormulario.nombre || datosFormulario.stock === "" || datosFormulario.precio === "") {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }
    
    // Llamar a la función que interactúa con el servidor (PHP/MySQL)
    enviarDatosAServidor(datosFormulario);
}

/**
 * Carga los datos de un producto en el formulario para su edición.
 * @param {number} id ID del producto a editar.
 */
function editarProducto(id) {
    // Buscar el producto en la lista local (que fue cargada desde la BD)
    const producto = productos.find(p => (p.id_producto || p.id) === id);

    if (producto) {
        // Usamos id_producto si viene de la BD, o id si fuera un remanente local.
        document.getElementById('producto-id').value = id; 
        document.getElementById('nombre-producto').value = producto.nombre;
        document.getElementById('stock-producto').value = producto.stock_actual || producto.stock;
        document.getElementById('precio-producto').value = producto.precio_venta || producto.precio;
        document.getElementById('categoria-producto').value = producto.id_categoria;
        
        // Cambiar texto del botón para indicar edición
        document.getElementById('btn-submit-producto').textContent = 'Guardar Cambios';
        document.getElementById('btn-cancelar').style.display = 'inline-block';
    }
}

/**
 * Inicia la solicitud de eliminación del producto en la BD.
 * @param {number} id ID del producto a eliminar.
 */
function eliminarProducto(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar el Producto ID ${id} de la base de datos?`)) {
        // Enviar la solicitud de eliminación al servidor
        enviarDatosAServidor({ id: id, accion: 'eliminarProducto' });
    }
}

/**
 * Limpia el formulario de producto.
 */
function limpiarFormularioProducto() {
    const form = document.getElementById('form-producto');
    if (form) form.reset();
    
    const inputId = document.getElementById('producto-id');
    if (inputId) inputId.value = '';

    const btnSubmit = document.getElementById('btn-submit-producto');
    if (btnSubmit) btnSubmit.textContent = 'Crear Producto';

    const btnCancel = document.getElementById('btn-cancelar');
    if (btnCancel) btnCancel.style.display = 'none';
}


// --- INICIALIZACIÓN Y MANEJO DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar las categorías (Siempre desde localStorage)
    cargarCategoriasUI();
    
    // 2. Cargar los productos (Desde la Base de Datos)
    cargarProductosDesdeBD(); 

    // Solo si estamos en la página de inventario:
    const formCategoria = document.getElementById('form-categoria');
    const formProducto = document.getElementById('form-producto');

    if (formCategoria) {
        // 3. Manejar el formulario de Categoría
        formCategoria.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre-categoria').value.trim();
            if (nombre) {
                crearCategoria(nombre);
                this.reset();
            }
        });
    }

    if (formProducto) {
        // 4. Manejar el formulario de Producto (Crear/Editar)
        formProducto.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const datosFormulario = {
                id: document.getElementById('producto-id').value ? parseInt(document.getElementById('producto-id').value) : null,
                nombre: document.getElementById('nombre-producto').value,
                stock: document.getElementById('stock-producto').value,
                precio: document.getElementById('precio-producto').value,
                id_categoria: document.getElementById('categoria-producto').value
            };
            
            guardarProducto(datosFormulario);
        });

        // 5. Manejar el botón de Cancelar Edición
        document.getElementById('btn-cancelar').addEventListener('click', limpiarFormularioProducto);
    }
});