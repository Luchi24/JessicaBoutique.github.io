function inicializarAgregar() {
    actualizarSelectoresAgregar();
    actualizarVistaPrevia();
    inicializarEventosAgregar();
}

function inicializarEventosAgregar() {
    const form = document.getElementById('form-agregar-producto');
    if (form) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', actualizarVistaPrevia);
            input.addEventListener('change', actualizarVistaPrevia);
        });
    }
    
    const btnAgregarCombinacion = document.querySelector('.btn-secundario[onclick*="agregarCombinacion"]');
    if (btnAgregarCombinacion) {
        btnAgregarCombinacion.onclick = agregarCombinacion;
    }
    
    actualizarSelectoresCombinaciones();
}

function actualizarSelectoresAgregar() {
    const catSelect = document.getElementById('categoria-producto');
    if (!catSelect) return;
    
    catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    datos.categorias.forEach(categoria => {
        catSelect.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
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

function agregarCombinacion() {
    const container = document.getElementById('combinaciones-container');
    if (!container) return;
    
    const combinacion = document.createElement('div');
    combinacion.className = 'combinacion-item';
    combinacion.innerHTML = `
        <select class="combinacion-talla" required>
            <option value="">Seleccionar talla</option>
            ${tallasDisponibles.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
        </select>
        <select class="combinacion-color" required>
            <option value="">Seleccionar color</option>
            ${datos.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
        </select>
        <input type="number" class="combinacion-cantidad" required min="0" placeholder="Cantidad">
        <button type="button" class="btn-eliminar-combinacion">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(combinacion);
    
    const nuevosSelect = combinacion.querySelector('.combinacion-color');
    const nuevosInputs = combinacion.querySelectorAll('input, select');
    const btnEliminar = combinacion.querySelector('.btn-eliminar-combinacion');
    
    nuevosInputs.forEach(input => {
        input.addEventListener('input', actualizarVistaPrevia);
        input.addEventListener('change', actualizarVistaPrevia);
    });
    
    if (btnEliminar) {
        btnEliminar.onclick = function() {
            eliminarCombinacion(this);
        };
    }
    
    actualizarSelectoresCombinaciones();
    actualizarVistaPrevia();
}

function eliminarCombinacion(boton) {
    const combinacion = boton.closest('.combinacion-item');
    if (combinacion && document.querySelectorAll('.combinacion-item').length > 1) {
        combinacion.remove();
        actualizarVistaPrevia();
    }
}

function agregarProducto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre-producto').value;
    const categoria = document.getElementById('categoria-producto').value;
    const marca = document.getElementById('marca-producto').value;
    const precioCompra = parseFloat(document.getElementById('precio-compra').value);
    const precioVenta = parseFloat(document.getElementById('precio-venta').value);
    
    if (precioVenta <= precioCompra) {
        mostrarNotificacion('El precio de venta debe ser mayor al de compra', 'error');
        return;
    }
    
    if (precioCompra <= 0 || precioVenta <= 0) {
        mostrarNotificacion('Los precios deben ser mayores a cero', 'error');
        return;
    }
    
    const combinaciones = [];
    document.querySelectorAll('.combinacion-item').forEach(item => {
        const talla = item.querySelector('.combinacion-talla').value;
        const color = item.querySelector('.combinacion-color').value;
        const cantidad = parseInt(item.querySelector('.combinacion-cantidad').value) || 0;
        
        if (talla && color && cantidad >= 0) {
            combinaciones.push({ talla, color, cantidad });
        }
    });
    
    if (combinaciones.length === 0) {
        mostrarNotificacion('Debe agregar al menos una combinación', 'error');
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
    
    setTimeout(() => {
        window.location.href = 'inventario.html';
    }, 1500);
    
    mostrarNotificacion('Producto(s) agregado(s) correctamente', 'exito');
}

function actualizarVistaPrevia() {
    const previewNombre = document.getElementById('preview-nombre');
    const previewCategoria = document.getElementById('preview-categoria');
    const previewMarca = document.getElementById('preview-marca');
    const previewPrecioCompra = document.getElementById('preview-precio-compra');
    const previewPrecioVenta = document.getElementById('preview-precio-venta');
    const previewGanancia = document.getElementById('preview-ganancia');
    const previewCombinaciones = document.getElementById('preview-combinaciones');
    
    if (!previewNombre || !previewCategoria || !previewMarca || 
        !previewPrecioCompra || !previewPrecioVenta || !previewGanancia || 
        !previewCombinaciones) return;
    
    const nombre = document.getElementById('nombre-producto').value || 'Nombre del Producto';
    const categoria = document.getElementById('categoria-producto').value || 'Categoría';
    const marca = document.getElementById('marca-producto').value || 'Marca';
    const precioCompra = parseFloat(document.getElementById('precio-compra').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precio-venta').value) || 0;
    
    const ganancia = precioVenta - precioCompra;
    const porcentajeGanancia = precioCompra > 0 ? ((ganancia / precioCompra) * 100).toFixed(1) : 0;
    
    previewNombre.textContent = nombre;
    previewCategoria.textContent = categoria;
    previewMarca.textContent = marca;
    previewPrecioCompra.textContent = `S/. ${precioCompra.toFixed(2)}`;
    previewPrecioVenta.textContent = `S/. ${precioVenta.toFixed(2)}`;
    previewGanancia.textContent = `S/. ${ganancia.toFixed(2)} (${porcentajeGanancia}%)`;
    previewGanancia.style.color = ganancia >= 0 ? 'var(--verde)' : 'var(--rojo)';
    
    previewCombinaciones.innerHTML = '';
    let totalCantidad = 0;
    
    document.querySelectorAll('.combinacion-item').forEach(item => {
        const talla = item.querySelector('.combinacion-talla').value;
        const color = item.querySelector('.combinacion-color').value;
        const cantidad = parseInt(item.querySelector('.combinacion-cantidad').value) || 0;
        
        if (talla && color && cantidad > 0) {
            totalCantidad += cantidad;
            previewCombinaciones.innerHTML += `
                <div class="combinacion-preview">
                    Talla: ${talla} | Color: ${color} | Cantidad: ${cantidad}
                </div>
            `;
        }
    });
    
    if (totalCantidad > 0) {
        previewCombinaciones.innerHTML += `
            <div class="combinacion-preview total" style="border-left-color: var(--verde); font-weight: bold;">
                Total unidades: ${totalCantidad}
            </div>
        `;
    }
}

function limpiarFormulario() {
    const form = document.getElementById('form-agregar-producto');
    if (form) {
        form.reset();
        
        const container = document.getElementById('combinaciones-container');
        if (container) {
            container.innerHTML = `
                <div class="combinacion-item">
                    <select class="combinacion-talla" required>
                        <option value="">Seleccionar talla</option>
                        ${tallasDisponibles.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
                    </select>
                    <select class="combinacion-color" required>
                        <option value="">Seleccionar color</option>
                        ${datos.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
                    </select>
                    <input type="number" class="combinacion-cantidad" required min="0" placeholder="Cantidad">
                    <button type="button" class="btn-eliminar-combinacion">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        actualizarVistaPrevia();
    }
}