// JavaScript específico para agregar-producto.html
let productoId = null;
let combinaciones = [];
let contadorCombinaciones = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Formulario de producto inicializado');
    
    // Inicializar formulario
    inicializarFormulario();
    
    // Configurar eventos
    configurarEventosFormulario();
    
    // Verificar si estamos editando
    verificarEdicion();
});

function inicializarFormulario() {
    // Cargar selectores con datos del sistema
    cargarSelectores();
    
    // Configurar generación automática de código
    document.getElementById('nombre').addEventListener('blur', function() {
        if (!document.getElementById('codigo').value) {
            generarCodigoProducto();
        }
    });
}

function cargarSelectores() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Cargar categorías
    const selectCategoria = document.getElementById('categoria');
    selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
    config.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
    
    // Cargar colores
    const selectColor = document.getElementById('color');
    selectColor.innerHTML = '<option value="">Seleccionar color</option>';
    config.colores.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        selectColor.appendChild(option);
    });
    
    // Cargar tallas iniciales
    actualizarSelectTallas();
    
    // Evento para actualizar tallas según categoría
    selectCategoria.addEventListener('change', actualizarSelectTallas);
}

function actualizarSelectTallas() {
    const categoria = document.getElementById('categoria').value;
    const selectTalla = document.getElementById('talla');
    const config = SistemaDatos.obtenerConfiguracion();
    
    selectTalla.innerHTML = '<option value="">Seleccionar talla</option>';
    
    // Determinar qué conjunto de tallas usar
    const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
    
    tallas.forEach(talla => {
        const option = document.createElement('option');
        option.value = talla;
        option.textContent = talla;
        selectTalla.appendChild(option);
    });
}

function configurarEventosFormulario() {
    // Generar código
    document.getElementById('generarCodigo').addEventListener('click', generarCodigoProducto);
    
    // Agregar combinación
    document.getElementById('agregarCombinacion').addEventListener('click', agregarCombinacion);
    
    // Cancelar
    document.getElementById('btnCancelar').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
            window.location.href = 'inventario.html';
        }
    });
    
    // Enviar formulario
    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
}

function verificarEdicion() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
        productoId = parseInt(id);
        cargarProductoParaEdicion(productoId);
    }
}

function cargarProductoParaEdicion(id) {
    const producto = SistemaDatos.buscarProducto(id);
    
    if (!producto) {
        mostrarError('Producto no encontrado');
        setTimeout(() => window.location.href = 'inventario.html', 2000);
        return;
    }
    
    // Actualizar título
    document.getElementById('tituloPagina').textContent = 'Editar Producto';
    document.getElementById('subtituloPagina').textContent = 'Modifica la información del producto';
    
    // Llenar formulario
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('codigo').value = producto.codigo || '';
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('marca').value = producto.marca || '';
    document.getElementById('precioCompra').value = producto.precioCompra;
    document.getElementById('precioVenta').value = producto.precioVenta;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('stockMinimo').value = producto.stockMinimo;
    
    // Actualizar select de color y seleccionar
    document.getElementById('color').value = producto.color;
    
    // Actualizar select de tallas y seleccionar
    actualizarSelectTallas();
    setTimeout(() => {
        document.getElementById('talla').value = producto.talla;
    }, 100);
    
    // Cargar combinaciones si existen
    if (producto.combinaciones && producto.combinaciones.length > 0) {
        combinaciones = [...producto.combinaciones];
        renderizarCombinaciones();
    }
}

function generarCodigoProducto() {
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    
    if (!nombre || !categoria) {
        mostrarError('Primero ingresa el nombre y selecciona una categoría');
        return;
    }
    
    const inicialesCategoria = categoria.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const codigo = `${inicialesCategoria}${random}`;
    
    document.getElementById('codigo').value = codigo;
}

function agregarCombinacion() {
    const categoria = document.getElementById('categoria').value;
    
    if (!categoria) {
        mostrarError('Primero selecciona una categoría');
        return;
    }
    
    contadorCombinaciones++;
    
    const combinacionDiv = document.createElement('div');
    combinacionDiv.className = 'combinacion-item';
    combinacionDiv.dataset.id = contadorCombinaciones;
    
    const config = SistemaDatos.obtenerConfiguracion();
    const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
    
    combinacionDiv.innerHTML = `
        <div class="combinacion-campos">
            <div class="form-group">
                <label>Talla</label>
                <select class="form-control combinacion-talla" required>
                    <option value="">Seleccionar</option>
                    ${tallas.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Color</label>
                <select class="form-control combinacion-color" required>
                    <option value="">Seleccionar</option>
                    ${config.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="form-control combinacion-cantidad" min="1" value="1" required>
            </div>
            
            <div class="form-group">
                <button type="button" class="btn btn-danger btn-eliminar-combinacion">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('combinacionesContainer').appendChild(combinacionDiv);
    
    // Agregar evento al botón de eliminar
    combinacionDiv.querySelector('.btn-eliminar-combinacion').addEventListener('click', function() {
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
    container.innerHTML = '';
    
    combinaciones.forEach((combinacion, index) => {
        const categoria = document.getElementById('categoria').value;
        const config = SistemaDatos.obtenerConfiguracion();
        const tallas = categoria === 'Pantalones' ? config.tallasPantalon : config.tallas;
        
        const combinacionDiv = document.createElement('div');
        combinacionDiv.className = 'combinacion-item';
        combinacionDiv.dataset.id = index + 1;
        
        combinacionDiv.innerHTML = `
            <div class="combinacion-campos">
                <div class="form-group">
                    <label>Talla</label>
                    <select class="form-control combinacion-talla" required>
                        <option value="">Seleccionar</option>
                        ${tallas.map(t => 
                            `<option value="${t}" ${t === combinacion.talla ? 'selected' : ''}>${t}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Color</label>
                    <select class="form-control combinacion-color" required>
                        <option value="">Seleccionar</option>
                        ${config.colores.map(c => 
                            `<option value="${c}" ${c === combinacion.color ? 'selected' : ''}>${c}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" class="form-control combinacion-cantidad" min="1" 
                           value="${combinacion.cantidad || 1}" required>
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
        combinacionDiv.querySelector('.btn-eliminar-combinacion').addEventListener('click', function() {
            combinaciones.splice(index, 1);
            renderizarCombinaciones();
        });
    });
}

function guardarProducto(e) {
    e.preventDefault();
    
    if (!validarFormulario()) {
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
        fechaCreacion: new Date().toISOString().split('T')[0]
    };
    
    // Validar precios
    if (producto.precioVenta <= producto.precioCompra) {
        mostrarError('El precio de venta debe ser mayor al precio de compra');
        return;
    }
    
    // Obtener combinaciones si existen
    const combinacionesForm = obtenerCombinacionesDelFormulario();
    if (combinacionesForm.length > 0) {
        producto.combinaciones = combinacionesForm;
    }
    
    // Guardar producto
    guardarProductoEnSistema(producto);
}

function validarFormulario() {
    const camposRequeridos = [
        'nombre', 'categoria', 'talla', 'color', 
        'precioCompra', 'precioVenta', 'stock', 'stockMinimo'
    ];
    
    for (const campoId of camposRequeridos) {
        const campo = document.getElementById(campoId);
        if (!campo.value.trim()) {
            mostrarError(`El campo ${campo.previousElementSibling.textContent} es requerido`);
            campo.focus();
            return false;
        }
    }
    
    return true;
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

function guardarProductoEnSistema(producto) {
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
    
    // Guardar en el sistema
    SistemaDatos.guardarProductos(productos);
    
    // Mostrar mensaje de éxito
    mostrarMensaje('success', productoId ? 'Producto actualizado' : 'Producto agregado');
    
    // Redirigir al inventario
    setTimeout(() => {
        window.location.href = 'inventario.html';
    }, 1500);
}

function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-error';
    errorDiv.textContent = mensaje;
    errorDiv.style.cssText = `
        background-color: #f44336;
        color: white;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        animation: fadeIn 0.3s ease;
    `;
    
    const formulario = document.getElementById('formProducto');
    formulario.insertBefore(errorDiv, formulario.firstChild);
    
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

function mostrarMensaje(tipo, mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'success') {
        mensajeDiv.style.backgroundColor = '#4caf50';
    } else {
        mensajeDiv.style.backgroundColor = '#2196f3';
    }
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => mensajeDiv.remove(), 300);
    }, 3000);
}