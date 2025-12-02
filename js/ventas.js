// Variables globales para ventas
let carrito = [];
let boletaImagen = null;

// Inicializar página de ventas
function inicializarVentas() {
    cargarProductosVenta();
    actualizarFechaActual();
    actualizarNumeroVenta();
    actualizarResumenLateral();
    inicializarEventos();
}

function inicializarEventos() {
    // Cambiar método de pago
    document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const efectivoGrupo = document.getElementById('efectivo-grupo');
            const vueltoGrupo = document.getElementById('vuelto-grupo');
            
            if (this.value === 'efectivo') {
                efectivoGrupo.style.display = 'block';
                vueltoGrupo.style.display = 'flex';
            } else {
                efectivoGrupo.style.display = 'none';
                vueltoGrupo.style.display = 'none';
            }
        });
    });
}

function actualizarFechaActual() {
    const fechaActual = document.getElementById('fecha-actual');
    if (fechaActual) {
        const hoy = new Date();
        fechaActual.textContent = hoy.toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function actualizarNumeroVenta() {
    const numeroVenta = document.getElementById('numero-venta');
    if (numeroVenta) {
        numeroVenta.textContent = datos.config.ultimoIdVenta + 1;
    }
}

// Cargar productos para venta
function cargarProductosVenta() {
    const listaProductos = document.getElementById('lista-productos-venta');
    if (!listaProductos) return;
    
    listaProductos.innerHTML = '';
    
    datos.productos.forEach((producto, index) => {
        const stockClass = producto.cantidad < 5 ? 'bajo' : 'normal';
        const precioVenta = producto.precio || producto.precioVenta || 0;
        
        const item = document.createElement('div');
        item.className = 'producto-item-venta';
        item.innerHTML = `
            <div class="producto-info">
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-detalle">
                    <span>${producto.categoria}</span>
                    <span>Talla: ${producto.talla}</span>
                    <span>Color: ${producto.color}</span>
                    <span class="producto-stock ${stockClass}">Stock: ${producto.cantidad}</span>
                </div>
            </div>
            <div class="producto-acciones">
                <button class="btn-agregar-carrito" 
                        onclick="agregarAlCarrito(${index})"
                        ${producto.cantidad === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> S/. ${precioVenta.toFixed(2)}
                </button>
            </div>
        `;
        
        listaProductos.appendChild(item);
    });
}

// Buscar producto en venta
function buscarProductoVenta() {
    const busqueda = document.getElementById('buscar-producto-venta').value.toLowerCase();
    const items = document.querySelectorAll('.producto-item-venta');
    
    items.forEach(item => {
        const nombre = item.querySelector('.producto-nombre').textContent.toLowerCase();
        const categoria = item.querySelector('.producto-detalle span:nth-child(1)').textContent.toLowerCase();
        const talla = item.querySelector('.producto-detalle span:nth-child(2)').textContent.toLowerCase();
        
        if (nombre.includes(busqueda) || categoria.includes(busqueda) || talla.includes(busqueda)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Carrito de compras
function agregarAlCarrito(indexProducto) {
    const producto = datos.productos[indexProducto];
    
    // Verificar si ya está en el carrito
    const itemExistente = carrito.find(item => 
        item.productoIndex === indexProducto && 
        item.talla === producto.talla && 
        item.color === producto.color
    );
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.cantidad) {
            itemExistente.cantidad++;
        } else {
            mostrarNotificacion('No hay suficiente stock disponible', 'error');
            return;
        }
    } else {
        if (producto.cantidad > 0) {
            carrito.push({
                productoIndex: indexProducto,
                nombre: producto.nombre,
                categoria: producto.categoria,
                talla: producto.talla,
                color: producto.color,
                precioCompra: producto.precioCompra || 0,
                precioVenta: producto.precio || producto.precioVenta || 0,
                cantidad: 1,
                stockDisponible: producto.cantidad
            });
        } else {
            mostrarNotificacion('Producto sin stock disponible', 'error');
            return;
        }
    }
    
    actualizarCarrito();
    calcularTotales();
}

function actualizarCarrito() {
    const itemsCarrito = document.getElementById('items-carrito');
    if (!itemsCarrito) return;
    
    itemsCarrito.innerHTML = '';
    
    carrito.forEach((item, index) => {
        const subtotal = item.precioVenta * item.cantidad;
        const ganancia = (item.precioVenta - item.precioCompra) * item.cantidad;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrito';
        itemDiv.innerHTML = `
            <div class="item-info">
                <h5>${item.nombre}</h5>
                <div class="item-detalle">
                    <span>${item.talla} | ${item.color}</span>
                    <span>Stock: ${item.stockDisponible}</span>
                    <span>Precio: S/. ${item.precioVenta.toFixed(2)}</span>
                </div>
            </div>
            <div class="item-controls">
                <div class="item-cantidad">
                    <button class="btn-cantidad" onclick="modificarCantidad(${index}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="modificarCantidad(${index}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-totales">
                    <div>S/. ${subtotal.toFixed(2)}</div>
                    <small style="color: var(--verde);">G: S/. ${ganancia.toFixed(2)}</small>
                </div>
                <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        itemsCarrito.appendChild(itemDiv);
    });
}

function modificarCantidad(index, cambio) {
    const item = carrito[index];
    const nuevoStock = item.cantidad + cambio;
    
    if (nuevoStock < 1) {
        eliminarDelCarrito(index);
        return;
    }
    
    if (nuevoStock > item.stockDisponible) {
        mostrarNotificacion('No hay suficiente stock disponible', 'error');
        return;
    }
    
    item.cantidad = nuevoStock;
    actualizarCarrito();
    calcularTotales();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    calcularTotales();
}

// Cálculos de totales
function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
    const igv = subtotal * datos.config.tasaIGV;
    const total = subtotal + igv;
    const ganancia = carrito.reduce((sum, item) => 
        sum + ((item.precioVenta - item.precioCompra) * item.cantidad), 0);
    
    // Actualizar elementos del DOM
    const subtotalElement = document.getElementById('subtotal-venta');
    const igvElement = document.getElementById('igv-venta');
    const totalElement = document.getElementById('total-venta');
    const gananciaElement = document.getElementById('ganancia-total');
    
    if (subtotalElement) subtotalElement.textContent = `S/. ${subtotal.toFixed(2)}`;
    if (igvElement) igvElement.textContent = `S/. ${igv.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `S/. ${total.toFixed(2)}`;
    if (gananciaElement) gananciaElement.textContent = `S/. ${ganancia.toFixed(2)}`;
    
    // Calcular vuelto si es efectivo
    calcularVuelto();
}

function calcularVuelto() {
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
    
    if (metodoPago === 'efectivo') {
        const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const total = parseFloat(document.getElementById('total-venta').textContent.replace('S/. ', '')) || 0;
        const vuelto = montoRecibido - total;
        
        const vueltoElement = document.getElementById('vuelto');
        if (vueltoElement) {
            vueltoElement.textContent = `S/. ${vuelto.toFixed(2)}`;
            vueltoElement.style.color = vuelto >= 0 ? 'var(--verde)' : 'var(--rojo)';
        }
    }
}

// Gestión de boleta
function previsualizarBoleta(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor, selecciona una imagen', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        boletaImagen = e.target.result;
        
        const preview = document.getElementById('preview-boleta');
        const imgPreview = document.getElementById('boleta-preview');
        
        if (preview && imgPreview) {
            imgPreview.src = boletaImagen;
            preview.style.display = 'block';
        }
    };
    
    reader.readAsDataURL(file);
}

function eliminarBoleta() {
    boletaImagen = null;
    const preview = document.getElementById('preview-boleta');
    const fileInput = document.getElementById('boleta-imagen');
    
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// Registrar venta
function registrarVenta(event) {
    event.preventDefault();
    
    // Validaciones
    if (carrito.length === 0) {
        mostrarNotificacion('Agrega productos al carrito', 'error');
        return;
    }
    
    const clienteNombre = document.getElementById('cliente-nombre').value;
    if (!clienteNombre.trim()) {
        mostrarNotificacion('Ingresa el nombre del cliente', 'error');
        return;
    }
    
    const total = parseFloat(document.getElementById('total-venta').textContent.replace('S/. ', '')) || 0;
    if (total <= 0) {
        mostrarNotificacion('El total debe ser mayor a cero', 'error');
        return;
    }
    
    // Verificar stock antes de proceder
    const sinStock = carrito.some(item => item.cantidad > item.stockDisponible);
    if (sinStock) {
        mostrarNotificacion('Algunos productos no tienen suficiente stock', 'error');
        return;
    }
    
    // Crear objeto de venta
    const nuevaVenta = {
        id: ++datos.config.ultimoIdVenta,
        fecha: new Date().toISOString(),
        cliente: {
            nombre: clienteNombre,
            dni: document.getElementById('cliente-dni').value,
            telefono: document.getElementById('cliente-telefono').value
        },
        tipoComprobante: document.querySelector('input[name="tipo-comprobante"]:checked').value,
        metodoPago: document.querySelector('input[name="metodo-pago"]:checked').value,
        items: carrito.map(item => ({
            productoIndex: item.productoIndex,
            nombre: item.nombre,
            talla: item.talla,
            color: item.color,
            precioCompra: item.precioCompra,
            precioVenta: item.precioVenta,
            cantidad: item.cantidad,
            subtotal: item.precioVenta * item.cantidad
        })),
        subtotal: carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0),
        igv: 0,
        total: total,
        gananciaTotal: carrito.reduce((sum, item) => 
            sum + ((item.precioVenta - item.precioCompra) * item.cantidad), 0),
        boletaImagen: boletaImagen,
        estado: 'completada'
    };
    
    // Calcular IGV
    nuevaVenta.igv = nuevaVenta.subtotal * datos.config.tasaIGV;
    
    // Actualizar stock de productos
    nuevaVenta.items.forEach(itemVenta => {
        const producto = datos.productos[itemVenta.productoIndex];
        producto.cantidad -= itemVenta.cantidad;
        
        if (producto.cantidad < 0) {
            producto.cantidad = 0;
        }
    });
    
    // Guardar venta
    datos.ventas.push(nuevaVenta);
    guardarDatos();
    
    // Mostrar comprobante
    mostrarComprobante(nuevaVenta);
    
    // Limpiar venta
    limpiarVenta();
    
    mostrarNotificacion('Venta registrada exitosamente', 'exito');
}

function mostrarComprobante(venta) {
    const modalBody = document.getElementById('modal-detalle-venta-body');
    if (!modalBody) return;
    
    let productosHTML = '';
    venta.items.forEach(item => {
        productosHTML += `
            <div class="item-venta-detalle">
                <div>
                    <strong>${item.nombre}</strong>
                    <div>${item.talla} | ${item.color}</div>
                </div>
                <div style="text-align: right;">
                    <div>${item.cantidad} x S/. ${item.precioVenta.toFixed(2)}</div>
                    <strong>S/. ${item.subtotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
    });
    
    const fecha = new Date(venta.fecha).toLocaleString('es-PE');
    
    modalBody.innerHTML = `
        <div class="info-venta">
            <p><strong>Venta #:</strong> ${venta.id}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Cliente:</strong> ${venta.cliente.nombre}</p>
            <p><strong>DNI:</strong> ${venta.cliente.dni || 'No especificado'}</p>
            <p><strong>Tipo:</strong> ${venta.tipoComprobante === 'factura' ? 'Factura' : 'Boleta'}</p>
            <p><strong>Método pago:</strong> ${venta.metodoPago}</p>
        </div>
        
        <h4>Productos</h4>
        ${productosHTML}
        
        <div class="resumen-venta-detalle">
            <div class="detalle">
                <span>Subtotal:</span>
                <span>S/. ${venta.subtotal.toFixed(2)}</span>
            </div>
            <div class="detalle">
                <span>IGV (18%):</span>
                <span>S/. ${venta.igv.toFixed(2)}</span>
            </div>
            <div class="detalle total">
                <span>Total:</span>
                <span>S/. ${venta.total.toFixed(2)}</span>
            </div>
            <div class="detalle ganancia">
                <span>Ganancia:</span>
                <span>S/. ${venta.gananciaTotal.toFixed(2)}</span>
            </div>
        </div>
        
        ${venta.boletaImagen ? `
            <h4>Comprobante</h4>
            <img src="${venta.boletaImagen}" class="boleta-imagen-detalle" alt="Comprobante">
        ` : ''}
        
        <div class="botones-formulario" style="margin-top: 1.5rem;">
            <button class="btn-secundario" onclick="cerrarModal('modal-detalle-venta')">
                <i class="fas fa-times"></i> Cerrar
            </button>
            <button class="btn-principal" onclick="imprimirComprobante(${venta.id})">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>
    `;
    
    // Abrir modal
    document.getElementById('modal-detalle-venta').style.display = 'flex';
}

function imprimirComprobante(idVenta) {
    // Aquí iría la lógica para imprimir el comprobante
    // Por ahora solo cerramos el modal
    cerrarModal('modal-detalle-venta');
    mostrarNotificacion('Función de impresión en desarrollo', 'info');
}

// Limpiar venta
function limpiarVenta() {
    // Confirmar si hay productos en el carrito
    if (carrito.length > 0) {
        mostrarConfirmacion(
            '¿Cancelar venta?',
            'Se perderán todos los productos del carrito',
            function() {
                carrito = [];
                boletaImagen = null;
                
                // Limpiar formulario
                const form = document.getElementById('form-registrar-venta');
                if (form) form.reset();
                
                // Limpiar vista previa boleta
                const preview = document.getElementById('preview-boleta');
                if (preview) preview.style.display = 'none';
                
                // Actualizar carrito y totales
                actualizarCarrito();
                calcularTotales();
                actualizarNumeroVenta();
                
                // Mostrar notificación
                mostrarNotificacion('Venta cancelada', 'info');
            }
        );
    }
}

// Actualizar resumen lateral
function actualizarResumenLateral() {
    // Ventas de hoy
    const hoy = new Date().toLocaleDateString('es-PE');
    const ventasHoy = datos.ventas.filter(v => 
        new Date(v.fecha).toLocaleDateString('es-PE') === hoy
    );
    
    const ventasHoyElement = document.getElementById('ventas-hoy');
    const totalHoyElement = document.getElementById('total-hoy');
    const gananciaHoyElement = document.getElementById('ganancia-hoy');
    
    if (ventasHoyElement) ventasHoyElement.textContent = ventasHoy.length;
    if (totalHoyElement) {
        const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
        totalHoyElement.textContent = `S/. ${totalHoy.toFixed(2)}`;
    }
    if (gananciaHoyElement) {
        const gananciaHoy = ventasHoy.reduce((sum, v) => sum + v.gananciaTotal, 0);
        gananciaHoyElement.textContent = `S/. ${gananciaHoy.toFixed(2)}`;
    }
    
    // Últimas ventas
    const ultimasVentasElement = document.getElementById('ultimas-ventas');
    if (ultimasVentasElement) {
        const ultimas = datos.ventas.slice(-5).reverse();
        ultimasVentasElement.innerHTML = '';
        
        ultimas.forEach(venta => {
            const fecha = new Date(venta.fecha).toLocaleTimeString('es-PE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const div = document.createElement('div');
            div.className = 'venta-reciente';
            div.innerHTML = `
                <div class="venta-cliente">${venta.cliente.nombre}</div>
                <div class="venta-detalle">
                    <span>${fecha}</span>
                    <span>S/. ${venta.total.toFixed(2)}</span>
                </div>
            `;
            ultimasVentasElement.appendChild(div);
        });
    }
    
    // Productos populares (simplificado)
    const productosPopularesElement = document.getElementById('productos-populares');
    if (productosPopularesElement) {
        // Contar ventas por producto
        const conteoProductos = {};
        datos.ventas.forEach(venta => {
            venta.items.forEach(item => {
                const key = `${item.nombre}-${item.talla}`;
                conteoProductos[key] = (conteoProductos[key] || 0) + item.cantidad;
            });
        });
        
        // Ordenar y tomar top 3
        const topProductos = Object.entries(conteoProductos)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        productosPopularesElement.innerHTML = '';
        
        topProductos.forEach(([producto, cantidad]) => {
            const [nombre, talla] = producto.split('-');
            const div = document.createElement('div');
            div.className = 'producto-popular';
            div.innerHTML = `
                <span>${nombre}</span>
                <span>${cantidad} vendidos</span>
            `;
            productosPopularesElement.appendChild(div);
        });
    }
}

// Funciones auxiliares
function mostrarConfirmacion(titulo, mensaje, callback) {
    const modal = document.getElementById('modal-confirmacion');
    const tituloElement = document.querySelector('#modal-confirmacion h3');
    const mensajeElement = document.getElementById('mensaje-confirmacion');
    const btnConfirmar = document.getElementById('btn-confirmar-accion');
    
    if (modal && tituloElement && mensajeElement && btnConfirmar) {
        tituloElement.innerHTML = `<i class="fas fa-question-circle"></i> ${titulo}`;
        mensajeElement.textContent = mensaje;
        
        // Configurar evento del botón
        btnConfirmar.onclick = function() {
            callback();
            cerrarModal('modal-confirmacion');
        };
        
        modal.style.display = 'flex';
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarVentas);
} else {
    inicializarVentas();
}