let tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'Única'];
let combinaciones = [];

function inicializarAgregar() {
    cargarSelectores();
    cargarTallasDisponibles();
    configurarEventos();
    actualizarVistaPrevia();
}

function cargarSelectores() {
    // Cargar categorías
    const catSelect = document.getElementById('categoria');
    catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    datos.categorias.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    // Cargar colores en la primera combinación
    actualizarSelectoresCombinaciones();
}

function cargarTallasDisponibles() {
    // Cargar tallas en la primera combinación
    const primeraTalla = document.querySelector('.combinacion-talla');
    if (primeraTalla) {
        primeraTalla.innerHTML = '<option value="">Seleccionar talla</option>';
        tallasDisponibles.forEach(talla => {
            primeraTalla.innerHTML += `<option value="${talla}">${talla}</option>`;
        });
    }
}

function actualizarSelectoresCombinaciones() {
    document.querySelectorAll('.combinacion-color').forEach(select => {
        if (select.innerHTML.includes('Seleccionar color')) {
            select.innerHTML = '<option value="">Seleccionar color</option>';
            datos.colores.forEach(color => {
                select.innerHTML += `<option value="${color}">${color}</option>`;
            });
        }
    });
}

function configurarEventos() {
    // Eventos para actualizar vista previa
    const inputs = ['nombre', 'categoria', 'marca', 'precio-compra', 'precio-venta'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', actualizarVistaPrevia);
        }
    });

    // Inicializar primera combinación
    actualizarCombinacionesArray();
}

function actualizarCombinacionesArray() {
    combinaciones = [];
    document.querySelectorAll('.combinacion-item').forEach(item => {
        const talla = item.querySelector('.combinacion-talla').value;
        const color = item.querySelector('.combinacion-color').value;
        const cantidad = parseInt(item.querySelector('.combinacion-cantidad').value) || 0;

        if (talla && color && cantidad > 0) {
            combinaciones.push({
                talla: talla,
                color: color,
                cantidad: cantidad,
                id: `${talla}-${color}`
            });
        }
    });
}

function agregarCombinacion() {
    const container = document.getElementById('combinaciones-container');
    if (!container) return;

    const nuevoIndex = container.children.length;
    const combinacionDiv = document.createElement('div');
    combinacionDiv.className = 'combinacion-item';
    combinacionDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Talla</label>
                <select class="combinacion-talla form-control" required onchange="actualizarVistaPrevia()">
                    <option value="">Seleccionar talla</option>
                    ${tallasDisponibles.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Color</label>
                <select class="combinacion-color form-control" required onchange="actualizarVistaPrevia()">
                    <option value="">Seleccionar color</option>
                    ${datos.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Cantidad</label>
                <input type="number" class="combinacion-cantidad form-control" required min="0" placeholder="0" oninput="actualizarVistaPrevia()">
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
                <button type="button" class="btn btn-secondary btn-icon" onclick="eliminarCombinacion(this)" style="background: #dc3545; color: white;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    container.appendChild(combinacionDiv);
    
    // Agregar eventos a los nuevos inputs
    const nuevosInputs = combinacionDiv.querySelectorAll('input, select');
    nuevosInputs.forEach(input => {
        input.addEventListener('input', actualizarVistaPrevia);
        input.addEventListener('change', actualizarVistaPrevia);
    });

    actualizarVistaPrevia();
}

function eliminarCombinacion(boton) {
    const combinacion = boton.closest('.combinacion-item');
    if (combinacion && document.querySelectorAll('.combinacion-item').length > 1) {
        combinacion.remove();
        actualizarVistaPrevia();
    } else {
        mostrarNotificacion('Debe haber al menos una combinación', 'error');
    }
}

function actualizarVistaPrevia() {
    // Actualizar información básica
    const nombre = document.getElementById('nombre').value || 'Nombre del Producto';
    const categoria = document.getElementById('categoria').value || 'Categoría';
    const marca = document.getElementById('marca').value || '-';
    const precioCompra = parseFloat(document.getElementById('precio-compra').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precio-venta').value) || 0;
    const ganancia = precioVenta - precioCompra;
    const porcentajeGanancia = precioCompra > 0 ? ((ganancia / precioCompra) * 100).toFixed(1) : 0;

    document.getElementById('preview-nombre').textContent = nombre;
    document.getElementById('preview-categoria').textContent = categoria;
    document.getElementById('preview-marca').textContent = marca;
    document.getElementById('preview-precio-compra').textContent = `S/. ${precioCompra.toFixed(2)}`;
    document.getElementById('preview-precio-venta').textContent = `S/. ${precioVenta.toFixed(2)}`;
    
    const gananciaElement = document.getElementById('preview-ganancia');
    gananciaElement.textContent = `S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)`;
    gananciaElement.style.color = ganancia >= 0 ? '#28a745' : '#dc3545';

    // Actualizar combinaciones
    actualizarCombinacionesArray();
    actualizarVistaPreviaCombinaciones();

    // Actualizar total de unidades
    const totalUnidades = combinaciones.reduce((total, combo) => total + combo.cantidad, 0);
    document.getElementById('preview-total-unidades').textContent = totalUnidades;
}

function actualizarVistaPreviaCombinaciones() {
    const container = document.getElementById('preview-combinaciones');
    if (!container) return;

    if (combinaciones.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <i class="fas fa-layer-group" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Agrega combinaciones de talla-color-cantidad</p>
            </div>
        `;
        return;
    }

    let html = '<div style="display: grid; gap: 0.5rem;">';
    
    combinaciones.forEach((combo, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: white; border-radius: 6px; border-left: 4px solid ${getColorPorIndex(index)};">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 24px; height: 24px; background: ${getColorPorIndex(index)}; color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                        ${index + 1}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${combo.talla}</div>
                        <div style="font-size: 0.85rem; color: #666;">${combo.color}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 600;">${combo.cantidad} unidades</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function getColorPorIndex(index) {
    const colores = ['#e91e63', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];
    return colores[index % colores.length];
}

function agregarProducto(event) {
    event.preventDefault();

    // Validar información básica
    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value;
    const marca = document.getElementById('marca').value.trim();
    const precioCompra = parseFloat(document.getElementById('precio-compra').value);
    const precioVenta = parseFloat(document.getElementById('precio-venta').value);

    if (!nombre || !categoria || !marca) {
        mostrarNotificacion('Completa todos los campos requeridos', 'error');
        return;
    }

    if (precioVenta <= precioCompra) {
        mostrarNotificacion('El precio de venta debe ser mayor al de compra', 'error');
        return;
    }

    if (precioCompra <= 0 || precioVenta <= 0) {
        mostrarNotificacion('Los precios deben ser mayores a cero', 'error');
        return;
    }

    // Validar combinaciones
    actualizarCombinacionesArray();
    
    if (combinaciones.length === 0) {
        mostrarNotificacion('Debe agregar al menos una combinación válida', 'error');
        return;
    }

    // Verificar combinaciones duplicadas
    const idsUnicos = new Set(combinaciones.map(c => c.id));
    if (idsUnicos.size !== combinaciones.length) {
        mostrarNotificacion('Hay combinaciones duplicadas (misma talla-color)', 'error');
        return;
    }

    // Crear un producto por cada combinación
    const fechaCreacion = new Date().toISOString();
    
    combinaciones.forEach(combinacion => {
        const nuevoProducto = {
            nombre: nombre,
            categoria: categoria,
            marca: marca,
            talla: combinacion.talla,
            color: combinacion.color,
            precioCompra: precioCompra,
            precio: precioVenta,
            cantidad: combinacion.cantidad,
            fechaCreacion: fechaCreacion,
            productoId: `${nombre.toLowerCase().replace(/\s+/g, '-')}-${fechaCreacion}`, // ID único para agrupar
            combinacionId: combinacion.id
        };
        
        datos.productos.push(nuevoProducto);
    });

    guardarDatos();
    
    mostrarNotificacion(`${combinaciones.length} producto(s) agregado(s) exitosamente`, 'exito');
    
    setTimeout(() => {
        window.location.href = 'inventario.html';
    }, 1500);
}

function limpiarFormulario() {
    const form = document.getElementById('form-agregar');
    if (form) {
        form.reset();
        
        const container = document.getElementById('combinaciones-container');
        if (container) {
            // Dejar solo una combinación
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
            
            // Resetear la primera combinación
            const primera = container.querySelector('.combinacion-item');
            if (primera) {
                primera.querySelector('.combinacion-talla').value = '';
                primera.querySelector('.combinacion-color').value = '';
                primera.querySelector('.combinacion-cantidad').value = '';
            }
        }
        
        actualizarVistaPrevia();
    }
}

// También necesito actualizar el main.js para incluir tallas disponibles
// En main.js, agregar al objeto datos:
// tallasDisponibles: ['XS', 'S', 'M', 'L', 'XL', 'Única']