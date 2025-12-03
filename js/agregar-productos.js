// Datos predefinidos
const categorias = [
    { id: 'vestidos', nombre: 'Vestidos', tallas: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'pantalones', nombre: 'Pantalones', tallas: ['28', '30', '32', '34', '36', '38'] },
    { id: 'blusas', nombre: 'Blusas', tallas: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'faldas', nombre: 'Faldas', tallas: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'chaquetas', nombre: 'Chaquetas', tallas: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'accesorios', nombre: 'Accesorios', tallas: ['Única'] }
];

const colores = [
    'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Morado', 'Amarillo', 'Gris', 'Beige', 'Multicolor'
];

// Variables
let contadorCombinaciones = 0;
let combinaciones = [];

// Elementos DOM
const formAgregarProducto = document.getElementById('formAgregarProducto');
const categoriaSelect = document.getElementById('categoria');
const marcaSelect = document.getElementById('marca');
const otraMarcaInput = document.getElementById('otraMarca');
const tallasContainer = document.getElementById('tallasContainer');
const agregarCombinacionBtn = document.getElementById('agregarCombinacion');
const combinacionesContainer = document.getElementById('combinacionesContainer');
const combinacionTemplate = document.getElementById('combinacionTemplate');
const cancelarBtn = document.getElementById('cancelarBtn');
const confirmacionModal = document.getElementById('confirmacionModal');
const agregarOtroBtn = document.getElementById('agregarOtro');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Activar la opción del menú correspondiente
    document.querySelector('nav a[href="agregar-productos.html"]').classList.add('active');
    
    // Cargar opciones de categoría
    cargarCategorias();
    
    // Configurar event listeners
    categoriaSelect.addEventListener('change', cargarTallasPorCategoria);
    marcaSelect.addEventListener('change', function() {
        otraMarcaInput.style.display = this.value === 'otra' ? 'block' : 'none';
        if (this.value !== 'otra') {
            otraMarcaInput.value = '';
        }
    });
    
    agregarCombinacionBtn.addEventListener('click', agregarCombinacion);
    cancelarBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cancelar? Se perderán los datos no guardados.')) {
            window.location.href = 'inventario.html';
        }
    });
    
    // Configurar envío del formulario
    formAgregarProducto.addEventListener('submit', guardarProducto);
    
    // Configurar modal de confirmación
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            confirmacionModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === confirmacionModal) {
            confirmacionModal.style.display = 'none';
        }
    });
    
    agregarOtroBtn.addEventListener('click', function() {
        confirmacionModal.style.display = 'none';
        formAgregarProducto.reset();
        combinacionesContainer.innerHTML = '<div class="empty-combo"><i class="fas fa-layer-group"></i><p>No hay combinaciones agregadas</p></div>';
        combinaciones = [];
        contadorCombinaciones = 0;
        tallasContainer.innerHTML = '<p>Seleccione una categoría para ver las tallas disponibles</p>';
    });
});

// Función para cargar categorías en el select
function cargarCategorias() {
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        categoriaSelect.appendChild(option);
    });
}

// Función para cargar tallas según la categoría seleccionada
function cargarTallasPorCategoria() {
    const categoriaId = categoriaSelect.value;
    
    if (!categoriaId) {
        tallasContainer.innerHTML = '<p>Seleccione una categoría para ver las tallas disponibles</p>';
        return;
    }
    
    const categoria = categorias.find(c => c.id === categoriaId);
    
    if (!categoria) return;
    
    tallasContainer.innerHTML = '';
    
    categoria.tallas.forEach(talla => {
        const div = document.createElement('div');
        div.className = 'talla-option';
        div.innerHTML = `
            <input type="checkbox" id="talla_${talla}" name="tallas" value="${talla}">
            <label for="talla_${talla}">${talla}</label>
        `;
        
        // Permitir selección única o múltiple según la categoría
        if (categoriaId === 'pantalones') {
            div.querySelector('input').type = 'radio';
            div.querySelector('input').name = 'tallaUnica';
        }
        
        div.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox' && e.target.type !== 'radio') {
                const input = this.querySelector('input');
                input.checked = !input.checked;
                this.classList.toggle('selected', input.checked);
            }
        });
        
        tallasContainer.appendChild(div);
    });
    
    // Actualizar opciones en las combinaciones si existen
    actualizarOpcionesCombinaciones();
}

// Función para agregar una combinación
function agregarCombinacion() {
    const categoriaId = categoriaSelect.value;
    
    if (!categoriaId) {
        alert('Primero seleccione una categoría');
        return;
    }
    
    contadorCombinaciones++;
    
    // Clonar la plantilla de combinación
    const combinacionClone = combinacionTemplate.cloneNode(true);
    combinacionClone.style.display = 'block';
    combinacionClone.id = '';
    combinacionClone.querySelector('.combo-number').textContent = contadorCombinaciones;
    
    // Obtener elementos del clon
    const tallaSelect = combinacionClone.querySelector('.combo-talla');
    const colorSelect = combinacionClone.querySelector('.combo-color');
    const eliminarBtn = combinacionClone.querySelector('.btn-eliminar-combo');
    
    // Llenar opciones de talla
    const categoria = categorias.find(c => c.id === categoriaId);
    tallaSelect.innerHTML = '<option value="">Seleccione talla</option>';
    categoria.tallas.forEach(talla => {
        const option = document.createElement('option');
        option.value = talla;
        option.textContent = talla;
        tallaSelect.appendChild(option);
    });
    
    // Llenar opciones de color
    colorSelect.innerHTML = '<option value="">Seleccione color</option>';
    colores.forEach(color => {
        const option = document.createElement('option');
        option.value = color.toLowerCase();
        option.textContent = color;
        colorSelect.appendChild(option);
    });
    
    // Configurar botón de eliminar
    eliminarBtn.addEventListener('click', function() {
        const combinacionItem = this.closest('.combinacion-item');
        const index = Array.from(combinacionesContainer.children).indexOf(combinacionItem) - 1;
        
        if (index >= 0) {
            combinaciones.splice(index, 1);
        }
        
        combinacionItem.remove();
        actualizarNumerosCombinaciones();
        
        // Si no quedan combinaciones, mostrar mensaje vacío
        if (combinacionesContainer.children.length === 1) {
            combinacionesContainer.innerHTML = '<div class="empty-combo"><i class="fas fa-layer-group"></i><p>No hay combinaciones agregadas</p></div>';
        }
    });
    
    // Eliminar el mensaje vacío si es la primera combinación
    if (combinacionesContainer.querySelector('.empty-combo')) {
        combinacionesContainer.innerHTML = '';
    }
    
    // Agregar al contenedor
    combinacionesContainer.appendChild(combinacionClone);
    
    // Agregar a la lista de combinaciones
    combinaciones.push({
        talla: '',
        color: '',
        cantidad: 1
    });
    
    // Configurar event listeners para actualizar la lista
    tallaSelect.addEventListener('change', function() {
        const index = Array.from(combinacionesContainer.children).indexOf(this.closest('.combinacion-item')) - 1;
        if (index >= 0) {
            combinaciones[index].talla = this.value;
        }
    });
    
    colorSelect.addEventListener('change', function() {
        const index = Array.from(combinacionesContainer.children).indexOf(this.closest('.combinacion-item')) - 1;
        if (index >= 0) {
            combinaciones[index].color = this.value;
        }
    });
    
    const cantidadInput = combinacionClone.querySelector('.combo-cantidad');
    cantidadInput.addEventListener('input', function() {
        const index = Array.from(combinacionesContainer.children).indexOf(this.closest('.combinacion-item')) - 1;
        if (index >= 0) {
            combinaciones[index].cantidad = parseInt(this.value) || 1;
        }
    });
}

// Función para actualizar números de combinaciones
function actualizarNumerosCombinaciones() {
    const combinacionItems = combinacionesContainer.querySelectorAll('.combinacion-item');
    
    combinacionItems.forEach((item, index) => {
        item.querySelector('.combo-number').textContent = index + 1;
    });
    
    contadorCombinaciones = combinacionItems.length;
}

// Función para actualizar opciones en combinaciones existentes
function actualizarOpcionesCombinaciones() {
    const categoriaId = categoriaSelect.value;
    const categoria = categorias.find(c => c.id === categoriaId);
    
    if (!categoria) return;
    
    // Actualizar selects de talla en todas las combinaciones
    const tallaSelects = combinacionesContainer.querySelectorAll('.combo-talla');
    
    tallaSelects.forEach(select => {
        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccione talla</option>';
        
        categoria.tallas.forEach(talla => {
            const option = document.createElement('option');
            option.value = talla;
            option.textContent = talla;
            if (valorActual === talla) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

// Función para guardar el producto
function guardarProducto(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validarFormulario()) {
        return;
    }
    
    // Recopilar datos básicos del producto
    const producto = {
        id: generarIdUnico(),
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value === 'otra' ? 
               document.getElementById('otraMarca').value : 
               document.getElementById('marca').value,
        color: document.getElementById('color').value,
        precioCompra: parseFloat(document.getElementById('precioCompra').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        descripcion: document.getElementById('descripcion').value,
        stockInicial: parseInt(document.getElementById('stockInicial').value),
        alertaStock: document.getElementById('alertaStock').value ? 
                     parseInt(document.getElementById('alertaStock').value) : null,
        fechaCreacion: new Date().toISOString().slice(0, 10)
    };
    
    // Procesar tallas seleccionadas
    const tallasSeleccionadas = [];
    const tallaInputs = document.querySelectorAll('input[name="tallas"]:checked, input[name="tallaUnica"]:checked');
    
    tallaInputs.forEach(input => {
        tallasSeleccionadas.push(input.value);
    });
    
    // Si hay combinaciones, usar esas
    if (combinaciones.length > 0) {
        // Filtrar combinaciones válidas
        const combinacionesValidas = combinaciones.filter(c => c.talla && c.color && c.cantidad > 0);
        
        if (combinacionesValidas.length === 0) {
            alert('Las combinaciones deben tener talla, color y cantidad válidos');
            return;
        }
        
        // Calcular stock total
        let stockTotal = 0;
        combinacionesValidas.forEach(c => {
            stockTotal += c.cantidad;
        });
        
        producto.cantidad = stockTotal;
        producto.talla = 'Varias'; // Para el registro principal
        producto.combinaciones = combinacionesValidas;
    } else {
        // Usar datos básicos
        if (tallasSeleccionadas.length === 0) {
            alert('Seleccione al menos una talla');
            return;
        }
        
        producto.talla = tallasSeleccionadas.join(', ');
        producto.cantidad = producto.stockInicial;
        
        // Si solo hay una talla seleccionada, guardarla como string simple
        if (tallasSeleccionadas.length === 1) {
            producto.talla = tallasSeleccionadas[0];
        }
    }
    
    // Determinar estado basado en cantidad
    if (producto.cantidad === 0) {
        producto.estado = 'agotado';
    } else if (producto.cantidad < 5) {
        producto.estado = 'bajo';
    } else {
        producto.estado = 'disponible';
    }
    
    // En una aplicación real, aquí enviaríamos los datos al servidor
    console.log('Producto a guardar:', producto);
    
    // Simular guardado exitoso
    mostrarConfirmacion();
}

// Función para validar el formulario
function validarFormulario() {
    // Validar precio de venta mayor que precio de compra
    const precioCompra = parseFloat(document.getElementById('precioCompra').value);
    const precioVenta = parseFloat(document.getElementById('precioVenta').value);
    
    if (precioVenta <= precioCompra) {
        alert('El precio de venta debe ser mayor que el precio de compra');
        return false;
    }
    
    // Validar que al menos haya una combinación o tallas seleccionadas
    if (combinaciones.length === 0) {
        const tallasSeleccionadas = document.querySelectorAll('input[name="tallas"]:checked, input[name="tallaUnica"]:checked').length;
        
        if (tallasSeleccionadas === 0) {
            alert('Seleccione al menos una talla o agregue combinaciones');
            return false;
        }
    }
    
    return true;
}

// Función para generar un ID único
function generarIdUnico() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Función para mostrar confirmación de guardado
function mostrarConfirmacion() {
    confirmacionModal.style.display = 'flex';
}

// Función para formatear fecha
function formatearFecha(fecha) {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES');
}