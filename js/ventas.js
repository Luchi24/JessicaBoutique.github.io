let carrito = [];

function inicializarVentas() {
    cargarProductos();
    actualizarFecha();
    actualizarNumeroVenta();
    configurarEventos();
}

function cargarProductos() {
    const container = document.getElementById('lista-productos');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (datos.productos.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #999;">
                <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No hay productos en inventario</p>
                <a href="agregar-producto.html" class="btn-principal" style="margin-top: 1rem;">Agregar Productos</a>
            </div>
        `;
        return;
    }
    
    datos.productos.forEach((producto, index) => {
        const div = document.createElement('div');
        div.className = 'producto-venta';
        div.style.padding = '1rem';
        div.style.borderBottom = '1px solid #eee';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        const stockColor = producto.cantidad === 0 ? '#f44336' : producto.cantidad < 3 ? '#ff9800' : '#4caf50';
        const stockTexto = producto.cantidad === 0 ? 'AGOTADO' : producto.cantidad < 3 ? 'BAJO' : 'DISPONIBLE';
        
        div.innerHTML = `
            <div>
                <strong style="display: block; margin-bottom: 0.3rem;">${producto.nombre}</strong>
                <small style="color: #999;">${producto.categoria} • ${producto.talla || 'Única'} • ${producto.color}</small>
                <div style="display: flex; gap: 1rem; margin-top: 0.3rem;">
                    <span style="font-size: 0.85rem; color: ${stockColor};">
                        <i class="fas fa-cubes"></i> ${producto.cantidad} (${stockTexto})
                    </span>
                    <span style="font-weight: bold; color: #e91e63;">S/. ${producto.precio.toFixed(2)}</span>
                </div>
            </div>
            <button onclick="agregarAlCarrito(${index})" 
                    style="background: #4caf50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;"
                    ${producto.cantidad === 0 ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i> Agregar
            </button>
        `;
        
        container.appendChild(div);
    });
    
    document.getElementById('buscar-producto').addEventListener('input', buscarProductos);
}

function buscarProductos() {
    const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
    const productos = document.querySelectorAll('.producto-venta');
    
    productos.forEach(prod => {
        const texto = prod.textContent.toLowerCase();
        prod.style.display = texto.includes(busqueda) ? '' : 'none';
    });
}

function agregarAlCarrito(index) {
    const producto = datos.productos[index];
    
    if (producto.cantidad === 0) {
        mostrarNotificacion('Producto agotado', 'error');
        return;
    }
    
    const existente = carrito.find(item => item.index === index);
    
    if (existente) {
        if (existente.cantidad >= producto.cantidad) {
            mostrarNotificacion('No hay suficiente stock', 'error');
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({
            index: index,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    
    actualizarCarrito();
    calcularTotales();
}

function actualizarCarrito() {
    const container = document.getElementById('carrito');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #999;">
                <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Carrito vacío</p>
            </div>
        `;
        return;
    }
    
    carrito.forEach((item, idx) => {
        const div = document.createElement('div');
        div.style.padding = '1rem';
        div.style.borderBottom = '1px solid #eee';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        div.innerHTML = `
            <div>
                <strong style="display: block; margin-bottom: 0.3rem;">${item.nombre}</strong>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="modificarCantidad(${idx}, -1)" 
                                style="background: #ddd; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="font-weight: bold;">${item.cantidad}</span>
                        <button onclick="modificarCantidad(${idx}, 1)" 
                                style="background: #ddd; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <span style="font-weight: bold; color: #e91e63;">
                        S/. ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                </div>
            </div>
            <button onclick="eliminarDelCarrito(${idx})" 
                    style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(div);
    });
}

function modificarCantidad(index, cambio) {
    const item = carrito[index];
    const producto = datos.productos[item.index];
    
    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(index);
        return;
    }
    
    if (nuevaCantidad > producto.cantidad) {
        mostrarNotificacion('No hay suficiente stock', 'error');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    actualizarCarrito();
    calcularTotales();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    calcularTotales();
}

function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
    document.getElementById('igv').textContent = `S/. ${igv.toFixed(2)}`;
    document.getElementById('total').textContent = `S/. ${total.toFixed(2)}`;
    
    calcularVuelto();
}

function configurarEventos() {
    document.getElementById('monto-recibido').addEventListener('input', calcularVuelto);
    
    document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const efectivoGrupo = document.getElementById('grupo-efectivo');
            if (this.value === 'efectivo') {
                efectivoGrupo.style.display = 'block';
            } else {
                efectivoGrupo.style.display = 'none';
                document.getElementById('vuelto').style.display = 'none';
            }
            calcularVuelto();
        });
    });
}

function calcularVuelto() {
    const metodo = document.querySelector('input[name="metodo-pago"]:checked').value;
    const vueltoDiv = document.getElementById('vuelto');
    
    if (metodo === 'efectivo') {
        const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const total = parseFloat(document.getElementById('total').textContent.replace('S/. ', '')) || 0;
        const vuelto = montoRecibido - total;
        
        if (montoRecibido > 0) {
            vueltoDiv.style.display = 'block';
            const vueltoMonto = document.getElementById('vuelto-monto');
            vueltoMonto.textContent = `S/. ${vuelto.toFixed(2)}`;
            vueltoMonto.style.color = vuelto >= 0 ? '#4caf50' : '#f44336';
        } else {
            vueltoDiv.style.display = 'none';
        }
    }
}

function actualizarFecha() {
    const fecha = new Date();
    document.getElementById('fecha-actual').textContent = fecha.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function actualizarNumeroVenta() {
    const ultimaVenta = datos.ventas.length > 0 ? Math.max(...datos.ventas.map(v => v.id)) : 0;
    document.getElementById('numero-venta').textContent = ultimaVenta + 1;
}

async function finalizarVenta() {
    const cliente = document.getElementById('cliente-nombre').value.trim();
    
    if (!cliente) {
        mostrarNotificacion('Ingresa el nombre del cliente', 'error');
        return;
    }
    
    if (carrito.length === 0) {
        mostrarNotificacion('Agrega productos al carrito', 'error');
        return;
    }
    
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
    
    if (metodoPago === 'efectivo') {
        const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const total = parseFloat(document.getElementById('total').textContent.replace('S/. ', '')) || 0;
        
        if (montoRecibido < total) {
            mostrarNotificacion('Monto recibido insuficiente', 'error');
            return;
        }
    }
    
    const nuevaVenta = {
        id: datos.ventas.length + 1,
        fecha: new Date().toISOString(),
        cliente: cliente,
        metodoPago: metodoPago,
        items: carrito.map(item => ({
            productoIndex: item.index,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        })),
        subtotal: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
        igv: 0,
        total: 0
    };
    
    nuevaVenta.igv = nuevaVenta.subtotal * 0.18;
    nuevaVenta.total = nuevaVenta.subtotal + nuevaVenta.igv;
    
    nuevaVenta.items.forEach(itemVenta => {
        datos.productos[itemVenta.productoIndex].cantidad -= itemVenta.cantidad;
    });
    
    datos.ventas.push(nuevaVenta);
    guardarDatos();
    
    mostrarNotificacion('Venta registrada exitosamente', 'exito');
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

async function cancelarVenta() {
    if (carrito.length === 0) {
        window.location.reload();
        return;
    }
    
    const confirmado = await mostrarConfirmacion('¿Cancelar la venta? Se perderán los productos del carrito.');
    if (confirmado) {
        window.location.reload();
    }
}