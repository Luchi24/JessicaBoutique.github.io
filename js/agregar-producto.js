// Agregar Producto - JavaScript específico
let productoId = null;
let combinaciones = [];
let contadorCombinaciones = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Agregar Producto - Inicializando...');
    
    // Cargar selectores
    cargarSelectores();
    
    // Verificar si estamos editando
    verificarEdicion();
    
    // Configurar eventos
    configurarEventosProducto();
});

function cargarSelectores() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Cargar categorías
    const selectCategoria = document.getElementById('categoria');
    if (selectCategoria) {
        selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
        config.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectCategoria.appendChild(option);
        });
        
        // Actualizar tallas cuando cambie la categoría
        selectCategoria.addEventListener('change', actualizarSelectTallas);
    }
    
    // Cargar colores
    const selectColor = document.getElementById('color');
    if (selectColor) {
        selectColor.innerHTML = '<option value="">Seleccionar color</option>';
        config.colores.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            selectColor.appendChild(option);
        });
    }
    
    // Inicializar select de tallas
    actualizarSelectTallas();
}

function actualizarSelectTallas() {
    const selectCategoria = document.getElementById('categoria');
    const selectTalla = document.getElementById('talla');
    
    if (!selectCategoria || !selectTalla) return;
    
    const config = SistemaDatos.obtenerConfiguracion();
    const categoria = selectCategoria.value;
    
    // Limpiar opciones
    selectTalla.innerHTML = '<option value="">Seleccionar talla</option>';
    
    // Determinar qué conjunto de tallas usar
    let tallas = config.tallas;
    if (categoria === 'Pantalones') {
        tallas = config.tallasPantalon;
    }
    
    // Agregar opciones
    tallas.forEach(talla => {
        const option = document.createElement('option');
        option.value = talla;
        option.textContent = talla;
        selectTalla.appendChild(option);
    });
}

function verificarEdicion() {
    // Verificar si hay un ID en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        productoId = parseInt(id);
        cargarProductoParaEdicion(productoId);
    }
}

function cargarProductoParaEdicion(id) {
    const producto = SistemaDatos.obtenerProductos().find(p => p.id === id);
    
    if (!producto) {
        alert('Producto no encontrado');
        window.location.href = 'inventario.html';
        return;
    }
    
    // Actualizar título
    const tituloPagina = document.getElementById('tituloPagina');
    const subtituloPagina = document.getElementById('subtituloPagina');
    
    if (tituloPagina) tituloPagina.textContent = 'Editar Producto';
    if (subtituloPagina) subtituloPagina.textContent = 'Modifica la información del producto';
    
    // Llenar formulario
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre || '';
    document.getElementById('codigo').value = producto.codigo || '';
    document.getElementById('categoria').value = producto.categoria || '';
    document.getElementById('marca').value = producto.marca || '';
    document.getElementById('color').value = producto.color || '';
    document.getElementById('precioCompra').value = producto.precioCompra || '';
    document.getElementById('precioVenta').value = producto.precioVenta || '';
    document.getElementById('stock').value = producto.stock || '';
    document.getElementById('stockMinimo').value = producto.stockMinimo || 5;
    
    // Actualizar select de tallas y seleccionar valor
    actualizarSelectTallas();
    setTimeout(() => {
        document.getElementById('talla').value = producto.talla || '';
    }, 100);
    
    // Cargar combinaciones si existen
    if (producto.combinaciones && producto.combinaciones.length > 0) {
        combinaciones = producto.combinaciones;
        renderizarCombinaciones();
    }
}

function configurarEventosProducto() {
    // Generar código automático
    const btnGenerarCodigo = document.getElementById('generarCodigo');
    if (btnGenerarCodigo) {
        btnGenerarCodigo.addEventListener('click', generarCodigoProducto);
    }
    
    // Agregar combinación
    const btnAgregarCombinacion = document.getElementById('agregarCombinacion');
    if (btnAgregarCombinacion) {
        btnAgregarCombinacion.addEventListener('click', agregarCombinacion);
    }
    
    // Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
                window.location.href = 'inventario.html';
            }
        });
    }
    
    // Enviar formulario
    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
}

function generarCodigoProducto() {
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const inputCodigo = document.getElementById('codigo');
    
    if (!nombre || !categoria) {
        alert('Por favor, ingresa nombre y categoría primero');
        return;
    }
    
    // Generar código basado en iniciales y número aleatorio
    const inicialesCategoria = categoria.substring(0, 3).toUpperCase();
    const inicialesNombre = nombre.substring(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const codigo = `${inicialesCategoria}${inicialesNombre}${random}`;
    inputCodigo.value = codigo;
}

function agregarCombinacion() {
    const categoria = document.getElementById('categoria').value;
    
    if (!categoria) {
        alert('Primero selecciona una categoría');
        return;
    }
    
    contadorCombinaciones++;
    
    const container = document.getElementById('combinacionesContainer');
    if (!container) return;
    
    const config = SistemaDatos.obtenerConfiguracion();
    const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
    
    const combinacionDiv = document.createElement('div');
    combinacionDiv.className = 'combinacion-item';
    combinacionDiv.dataset.id = contadorCombinaciones;
    
    combinacionDiv.innerHTML = `
        <div class="combinacion-campos">
            <div class="form-group">
                <label>Talla</label>
                <select class="form-control combinacion-talla">
                    <option value="">Seleccionar</option>
                    ${tallas.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Color</label>
                <select class="form-control combinacion-color">
                    <option value="">Seleccionar</option>
                    ${config.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="form-control combinacion-cantidad" min="1" value="1">
            </div>
            
            <div class="form-group">
                <button type="button" class="btn btn-danger btn-eliminar-combinacion">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(combinacionDiv);
    
    // Agregar evento al botón de eliminar
    const btnEliminar = combinacionDiv.querySelector('.btn-eliminar-combinacion');
    btnEliminar.addEventListener('click', function() {
        eliminarCombinacion(contadorCombinaciones);
    });
}

function eliminarCombinacion(id) {
    const elemento = document.querySelector(`.combinacion-item[data-id="${id}"]`);
    if (elemento) {
        elemento.remove();
    }
}

function renderizarCombinaciones() {
    const container = document.getElementById('combinacionesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    contadorCombinaciones = 0;
    
    combinaciones.forEach(combinacion => {
        contadorCombinaciones++;
        
        const categoria = document.getElementById('categoria').value;
        const config = SistemaDatos.obtenerConfiguracion();
        const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
        
        const combinacionDiv = document.createElement('div');
        combinacionDiv.className = 'combinacion-item';
        combinacionDiv.dataset.id = contadorCombinaciones;
        
        combinacionDiv.innerHTML = `
            <div class="combinacion-campos">
                <div class="form-group">
                    <label>Talla</label>
                    <select class="form-control combinacion-talla">
                        <option value="">Seleccionar</option>
                        ${tallas.map(t => `<option value="${t}" ${t === combinacion.talla ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Color</label>
                    <select class="form-control combinacion-color">
                        <option value="">Seleccionar</option>
                        ${config.colores.map(c => `<option value="${c}" ${c === combinacion.color ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" class="form-control combinacion-cantidad" min="1" value="${combinacion.cantidad || 1}">
                </div>
                
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-eliminar-combinacion">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(combinacionDiv);
        
        // Agregar evento al botón de eliminar
        const btnEliminar = combinacionDiv.querySelector('.btn-eliminar-combinacion');
        btnEliminar.addEventListener('click', function() {
            combinacionDiv.remove();
        });
    });
}

function obtenerCombinacionesDelFormulario() {
    const combinacionesArray = [];
    const elementos = document.querySelectorAll('.combinacion-item');
    
    elementos.forEach(elemento => {
        const talla = elemento.querySelector('.combinacion-talla').value;
        const color = elemento.querySelector('.combinacion-color').value;
        const cantidad = parseInt(elemento.querySelector('.combinacion-cantidad').value);
        
        if (talla && color && cantidad > 0) {
            combinacionesArray.push({
                talla,
                color,
                cantidad
            });
        }
    });
    
    return combinacionesArray;
}

function guardarProducto(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validarFormularioProducto()) {
        return;
    }
    
    // Obtener datos del formulario
    const producto = {
        nombre: document.getElementById('nombre').value.trim(),
        codigo: document.getElementById('codigo').value.trim(),
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value.trim(),
        talla: document.getElementById('talla').value,
        color: document.getElementById('color').value,
        precioCompra: parseFloat(document.getElementById('precioCompra').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        stock: parseInt(document.getElementById('stock').value),
        stockMinimo: parseInt(document.getElementById('stockMinimo').value),
        fechaCreacion: new Date().toISOString().split('T')[0],
        combinaciones: obtenerCombinacionesDelFormulario()
    };
    
    // Validar precios
    if (producto.precioVenta <= producto.precioCompra) {
        alert('El precio de venta debe ser mayor al precio de compra');
        return;
    }
    
    // Obtener productos actuales
    let productos = SistemaDatos.obtenerProductos();
    
    if (productoId) {
        // Editar producto existente
        const index = productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
            producto.id = productoId;
            producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
            productos[index] = producto;
        }
    } else {
        // Nuevo producto
        producto.id = SistemaDatos.generarId('producto');
        producto.estado = SistemaDatos.actualizarEstadoProducto(producto).estado;
        productos.push(producto);
    }
    
    // Guardar productos
    SistemaDatos.guardarProductos(productos);
    
    // Mostrar mensaje y redirigir
    alert(productoId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
    window.location.href = 'inventario.html';
}

function validarFormularioProducto() {
    const camposRequeridos = [
        'nombre', 'categoria', 'talla', 'color', 
        'precioCompra', 'precioVenta', 'stock', 'stockMinimo'
    ];
    
    for (const campoId of camposRequeridos) {
        const campo = document.getElementById(campoId);
        if (!campo || !campo.value.trim()) {
            alert(`El campo ${campo.previousElementSibling.textContent} es requerido`);
            campo.focus();
            return false;
        }
    }
    
    // Validar que el precio de venta sea mayor al de compra
    const precioCompra = parseFloat(document.getElementById('precioCompra').value);
    const precioVenta = parseFloat(document.getElementById('precioVenta').value);
    
    if (precioVenta <= precioCompra) {
        alert('El precio de venta debe ser mayor al precio de compra');
        return false;
    }
    
    // Validar combinaciones si existen
    const combinaciones = obtenerCombinacionesDelFormulario();
    for (const combinacion of combinaciones) {
        if (!combinacion.talla || !combinacion.color || !combinacion.cantidad || combinacion.cantidad <= 0) {
            alert('Todas las combinaciones deben tener talla, color y cantidad válida');
            return false;
        }
    }
    
    return true;
}