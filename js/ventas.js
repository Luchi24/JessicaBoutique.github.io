// Ventas - JavaScript específico
let carrito = [];
let pasoActual = 1;
let clienteActual = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Ventas - Inicializando...');
    
    // Cargar datos iniciales
    cargarDatosVentas();
    
    // Configurar eventos
    configurarEventosVentas();
    
    // Inicializar paso 1
    mostrarPaso(1);
});

function cargarDatosVentas() {
    // Cargar categorías en el filtro
    const config = SistemaDatos.obtenerConfiguracion();
    const selectCategoria = document.getElementById('filtroCategoriaVenta');
    
    if (selectCategoria) {
        selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
        config.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectCategoria.appendChild(option);
        });
    }
    
    // Cargar productos disponibles
    cargarProductosDisponibles();
    
    // Cargar ventas recientes
    cargarVentasRecientes();
}

function cargarProductosDisponibles(filtro = '') {
    const listaProductos = document.getElementById('listaProductosVenta');
    if (!listaProductos) return;
    
    // Obtener productos con stock
    let productos = SistemaDatos.obtenerProductos().filter(p => p.stock > 0);
    
    // Aplicar filtro
    if (filtro) {
        const filtroLower = filtro.toLowerCase();
        productos = productos.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(filtroLower)) ||
            (p.codigo && p.codigo.toLowerCase().includes(filtroLower)) ||
            (p.categoria && p.categoria.toLowerCase().includes(filtroLower))
        );
    }
    
    // Limpiar lista
    listaProductos.innerHTML = '';
    
    if (productos.length === 0) {
        listaProductos.innerHTML = `
            <div class="producto-vacio">
                <i class="fas fa-box-open"></i>
                <p>No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    // Agregar cada producto
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-item';
        productoDiv.dataset.id = producto.id;
        
        productoDiv.innerHTML = `
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <div class="producto-detalles">
                    <span class="producto-categoria">${producto.categoria}</span>
                    <span class="producto-talla">Talla: ${producto.talla}</span>
                    <span class="producto-color">Color: ${producto.color}</span>
                </div>
                <div class="producto-stock">
                    <i class="fas fa-box"></i> Stock: ${producto.stock}
                </div>
            </div>
            <div class="producto-precio">
                <div class="precio">S/. ${producto.precioVenta.toFixed(2)}</div>
                <button class="btn btn-primary btn-agregar-carrito">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            </div>
        `;
        
        listaProductos.appendChild(productoDiv);
        
        // Agregar evento al botón
        const btnAgregar = productoDiv.querySelector('.btn-agregar-carrito');
        btnAgregar.addEventListener('click', function() {
            agregarAlCarrito(producto.id);
        });
    });
}

function cargarVentasRecientes() {
    const tbody = document.getElementById('ventasRecientes');
    if (!tbody) return;
    
    // Obtener últimas ventas
    const ventas = SistemaDatos.obtenerVentas().slice(-10).reverse();
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay ventas recientes</td>
            </tr>
        `;
        return;
    }
    
    // Agregar cada venta
    ventas.forEach(venta => {
        const cliente = SistemaDatos.obtenerClientes().find(c => c.id === venta.clienteId);
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>#${venta.id.toString().padStart(4, '0')}</td>
            <td>${cliente ? cliente.nombre : 'Cliente no encontrado'}</td>
            <td>${venta.productos ? venta.productos.length : 0} productos</td>
            <td>S/. ${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
            <td>${venta.fecha || 'Fecha no disponible'}</td>
            <td><span class="badge-estado completada">Completada</span></td>
        `;
        
        tbody.appendChild(fila);
    });
}

function configurarEventosVentas() {
    // Navegación entre pasos
    const btnSiguienteCliente = document.getElementById('siguienteProductos');
    const btnVolverCliente = document.getElementById('volverCliente');
    const btnSiguientePago = document.getElementById('siguientePago');
    const btnVolverProductos = document.getElementById('volverProductos');
    
    if (btnSiguienteCliente) {
        btnSiguienteCliente.addEventListener('click', function() {
            if (validarPasoCliente()) {
                guardarCliente();
                mostrarPaso(2);
            }
        });
    }
    
    if (btnVolverCliente) {
        btnVolverCliente.addEventListener('click', function() {
            mostrarPaso(1);
        });
    }
    
    if (btnSiguientePago) {
        btnSiguientePago.addEventListener('click', function() {
            if (carrito.length > 0) {
                mostrarPaso(3);
                actualizarResumenCarrito();
            } else {
                alert('Agrega al menos un producto al carrito');
            }
        });
    }
    
    if (btnVolverProductos) {
        btnVolverProductos.addEventListener('click', function() {
            mostrarPaso(2);
        });
    }
    
    // Buscar productos
    const inputBusqueda = document.getElementById('buscarProductoVenta');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keyup', function() {
            cargarProductosDisponibles(this.value);
        });
    }
    
    // Filtrar por categoría
    const selectCategoria = document.getElementById('filtroCategoriaVenta');
    if (selectCategoria) {
        selectCategoria.addEventListener('change', function() {
            // En una implementación real, filtraríamos por categoría
            cargarProductosDisponibles();
        });
    }
    
    // Método de pago
    const radiosPago = document.querySelectorAll('input[name="metodoPago"]');
    radiosPago.forEach(radio => {
        radio.addEventListener('change', function() {
            actualizarTotalConComision();
        });
    });
    
    // Descuento
    const inputDescuento = document.getElementById('descuento');
    if (inputDescuento) {
        inputDescuento.addEventListener('input', function() {
            actualizarResumenCarrito();
        });
    }
    
    // Finalizar venta
    const btnFinalizarVenta = document.getElementById('finalizarVenta');
    if (btnFinalizarVenta) {
        btnFinalizarVenta.addEventListener('click', function() {
            finalizarVenta();
        });
    }
    
    // Cancelar venta
    const btnCancelarVenta = document.getElementById('cancelarVenta');
    if (btnCancelarVenta) {
        btnCancelarVenta.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cancelar esta venta?')) {
                cancelarVenta();
            }
        });
    }
    
    // Actualizar ventas
    const btnActualizarVentas = document.getElementById('actualizarVentas');
    if (btnActualizarVentas) {
        btnActualizarVentas.addEventListener('click', function() {
            cargarVentasRecientes();
        });
    }
    
    // Modal de confirmación
    const modalConfirmar = document.getElementById('modalConfirmarVenta');
    if (modalConfirmar) {
        const btnCerrar = modalConfirmar.querySelector('.btn-cerrar-modal');
        const btnCancelarConfirmacion = document.getElementById('cancelarConfirmacion');
        const btnConfirmarVenta = document.getElementById('confirmarVentaFinal');
        
        if (btnCerrar) {
            btnCerrar.addEventListener('click', function() {
                modalConfirmar.style.display = 'none';
            });
        }
        
        if (btnCancelarConfirmacion) {
            btnCancelarConfirmacion.addEventListener('click', function() {
                modalConfirmar.style.display = 'none';
            });
        }
        
        if (btnConfirmarVenta) {
            btnConfirmarVenta.addEventListener('click', function() {
                procesarVenta();
                modalConfirmar.style.display = 'none';
            });
        }
        
        // Cerrar al hacer clic fuera
        modalConfirmar.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
}

function mostrarPaso(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.card-paso').forEach(card => {
        card.style.display = 'none';
    });
    
    // Mostrar paso actual
    const pasoElement = document.getElementById(`paso${paso === 1 ? 'Cliente' : paso === 2 ? 'Productos' : 'Pago'}`);
    if (pasoElement) {
        pasoElement.style.display = 'block';
    }
    
    pasoActual = paso;
}

function validarPasoCliente() {
    const nombre = document.getElementById('clienteNombre').value.trim();
    const dni = document.getElementById('clienteDNI').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    
    if (!nombre) {
        alert('El nombre del cliente es requerido');
        return false;
    }
    
    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
        alert('DNI inválido. Debe tener 8 dígitos');
        return false;
    }
    
    if (!telefono || telefono.length !== 9 || !/^\d+$/.test(telefono)) {
        alert('Teléfono inválido. Debe tener 9 dígitos');
        return false;
    }
    
    return true;
}

function guardarCliente() {
    const nombre = document.getElementById('clienteNombre').value.trim();
    const dni = document.getElementById('clienteDNI').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const email = document.getElementById('clienteEmail').value.trim();
    
    // Buscar si el cliente ya existe
    let clientes = SistemaDatos.obtenerClientes();
    let cliente = clientes.find(c => c.dni === dni);
    
    if (!cliente) {
        // Crear nuevo cliente
        cliente = {
            id: SistemaDatos.generarId('cliente'),
            nombre,
            dni,
            telefono,
            email,
            fechaRegistro: new Date().toISOString().split('T')[0],
            compras: 0,
            totalGastado: 0
        };
        
        clientes.push(cliente);
        SistemaDatos.guardarClientes(clientes);
    }
    
    clienteActual = cliente;
}

function agregarAlCarrito(productoId) {
    // Buscar producto
    const producto = SistemaDatos.obtenerProductos().find(p => p.id === productoId);
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    // Verificar stock
    if (producto.stock <= 0) {
        alert('Producto sin stock disponible');
        return;
    }
    
    // Buscar si ya está en el carrito
    const itemExistente = carrito.find(item => item.productoId === productoId);
    
    if (itemExistente) {
        // Verificar si hay suficiente stock para agregar uno más
        if (itemExistente.cantidad >= producto.stock) {
            alert('No hay suficiente stock disponible');
            return;
        }
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * producto.precioVenta;
    } else {
        // Agregar nuevo item
        carrito.push({
            productoId,
            nombre: producto.nombre,
            precio: producto.precioVenta,
            cantidad: 1,
            subtotal: producto.precioVenta
        });
    }
    
    // Actualizar carrito
    actualizarCarritoUI();
    
    // Mostrar mensaje
    alert('Producto agregado al carrito');
}

function actualizarCarritoUI() {
    const tbody = document.getElementById('carritoVenta');
    if (!tbody) return;
    
    // Limpiar carrito
    tbody.innerHTML = '';
    
    if (carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Carrito vacío</td>
            </tr>
        `;
        return;
    }
    
    // Agregar cada item
    carrito.forEach((item, index) => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>
                <input type="number" class="form-control cantidad-carrito" 
                       value="${item.cantidad}" min="1" data-index="${index}">
            </td>
            <td>S/. ${item.precio.toFixed(2)}</td>
            <td>S/. ${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-eliminar-carrito" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    // Agregar eventos a los inputs de cantidad
    document.querySelectorAll('.cantidad-carrito').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const nuevaCantidad = parseInt(this.value);
            
            if (nuevaCantidad < 1) {
                this.value = 1;
                return;
            }
            
            // Verificar stock
            const item = carrito[index];
            const producto = SistemaDatos.obtenerProductos().find(p => p.id === item.productoId);
            
            if (nuevaCantidad > producto.stock) {
                alert(`Solo hay ${producto.stock} unidades disponibles`);
                this.value = producto.stock;
                nuevaCantidad = producto.stock;
            }
            
            item.cantidad = nuevaCantidad;
            item.subtotal = nuevaCantidad * item.precio;
            
            actualizarCarritoUI();
            actualizarResumenCarrito();
        });
    });
    
    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.btn-eliminar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            carrito.splice(index, 1);
            actualizarCarritoUI();
            actualizarResumenCarrito();
        });
    });
}

function actualizarResumenCarrito() {
    // Calcular subtotal
    const subtotal = carrito.reduce((total, item) => total + item.subtotal, 0);
    
    // Obtener descuento
    const descuentoInput = document.getElementById('descuento');
    const descuento = descuentoInput ? parseFloat(descuentoInput.value) || 0 : 0;
    
    // Calcular total
    let total = subtotal - descuento;
    
    // Aplicar comisión si es pago con tarjeta
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
    if (metodoPago && metodoPago.value === 'tarjeta') {
        const config = SistemaDatos.obtenerConfiguracion();
        const comision = config.comisionTarjeta || 0.05;
        total = total * (1 + comision);
        
        // Mostrar campo de tarjeta
        const campoTarjeta = document.getElementById('campoTarjeta');
        const montoTarjeta = document.getElementById('montoTarjeta');
        
        if (campoTarjeta) campoTarjeta.style.display = 'block';
        if (montoTarjeta) montoTarjeta.value = `S/. ${total.toFixed(2)}`;
    } else {
        // Ocultar campo de tarjeta
        const campoTarjeta = document.getElementById('campoTarjeta');
        if (campoTarjeta) campoTarjeta.style.display = 'none';
    }
    
    // Actualizar UI
    const elSubtotal = document.getElementById('subtotalCarrito');
    const elDescuento = document.getElementById('descuentoCarrito');
    const elTotal = document.getElementById('totalCarrito');
    
    if (elSubtotal) elSubtotal.textContent = `S/. ${subtotal.toFixed(2)}`;
    if (elDescuento) elDescuento.textContent = `S/. ${descuento.toFixed(2)}`;
    if (elTotal) elTotal.textContent = `S/. ${total.toFixed(2)}`;
}

function actualizarTotalConComision() {
    actualizarResumenCarrito();
}

function finalizarVenta() {
    if (!clienteActual) {
        alert('Error: Cliente no definido');
        return;
    }
    
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Calcular total final
    const subtotal = carrito.reduce((total, item) => total + item.subtotal, 0);
    const descuentoInput = document.getElementById('descuento');
    const descuento = descuentoInput ? parseFloat(descuentoInput.value) || 0 : 0;
    let total = subtotal - descuento;
    
    // Aplicar comisión si es tarjeta
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
    if (metodoPago && metodoPago.value === 'tarjeta') {
        const config = SistemaDatos.obtenerConfiguracion();
        const comision = config.comisionTarjeta || 0.05;
        total = total * (1 + comision);
    }
    
    // Mostrar modal de confirmación
    const modal = document.getElementById('modalConfirmarVenta');
    const clienteResumen = document.getElementById('clienteResumen');
    const totalResumen = document.getElementById('totalResumen');
    const metodoPagoResumen = document.getElementById('metodoPagoResumen');
    const fechaResumen = document.getElementById('fechaResumen');
    
    if (clienteResumen) clienteResumen.textContent = clienteActual.nombre;
    if (totalResumen) totalResumen.textContent = `S/. ${total.toFixed(2)}`;
    if (metodoPagoResumen) metodoPagoResumen.textContent = metodoPago ? metodoPago.value : 'efectivo';
    if (fechaResumen) fechaResumen.textContent = new Date().toLocaleDateString('es-PE');
    
    if (modal) modal.style.display = 'flex';
}

function procesarVenta() {
    // Preparar datos de la venta
    const venta = {
        id: SistemaDatos.generarId('venta'),
        clienteId: clienteActual.id,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        productos: carrito.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        subtotal: carrito.reduce((total, item) => total + item.subtotal, 0),
        descuento: parseFloat(document.getElementById('descuento').value) || 0,
        total: parseFloat(document.getElementById('totalCarrito').textContent.replace('S/. ', '')),
        metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
        estado: 'completada',
        vendedor: 'Administrador'
    };
    
    // Actualizar stock de productos
    let productos = SistemaDatos.obtenerProductos();
    
    carrito.forEach(item => {
        const productoIndex = productos.findIndex(p => p.id === item.productoId);
        if (productoIndex !== -1) {
            productos[productoIndex].stock -= item.cantidad;
            
            // Actualizar estado del producto
            productos[productoIndex] = SistemaDatos.actualizarEstadoProducto(productos[productoIndex]);
        }
    });
    
    // Actualizar cliente
    let clientes = SistemaDatos.obtenerClientes();
    const clienteIndex = clientes.findIndex(c => c.id === clienteActual.id);
    if (clienteIndex !== -1) {
        clientes[clienteIndex].compras++;
        clientes[clienteIndex].totalGastado += venta.total;
    }
    
    // Guardar venta
    let ventas = SistemaDatos.obtenerVentas();
    ventas.push(venta);
    
    // Guardar todos los cambios
    SistemaDatos.guardarProductos(productos);
    SistemaDatos.guardarClientes(clientes);
    SistemaDatos.guardarVentas(ventas);
    
    // Mostrar confirmación
    alert(`Venta #${venta.id} registrada exitosamente\nTotal: S/. ${venta.total.toFixed(2)}`);
    
    // Resetear venta
    cancelarVenta();
    
    // Recargar datos
    cargarVentasRecientes();
}

function cancelarVenta() {
    // Resetear todo
    carrito = [];
    clienteActual = null;
    pasoActual = 1;
    
    // Limpiar formularios
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteDNI').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('descuento').value = '0';
    
    // Resetear método de pago
    const radioEfectivo = document.querySelector('input[value="efectivo"]');
    if (radioEfectivo) radioEfectivo.checked = true;
    
    // Ocultar campo de tarjeta
    const campoTarjeta = document.getElementById('campoTarjeta');
    if (campoTarjeta) campoTarjeta.style.display = 'none';
    
    // Volver al paso 1
    mostrarPaso(1);
    
    // Actualizar UI
    actualizarCarritoUI();
    actualizarResumenCarrito();
}