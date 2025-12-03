// Ventas - Jessica Boutique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Módulo de Ventas cargado');
    
    // Inicializar ventas
    inicializarVentas();
    
    // Configurar eventos
    configurarEventosVentas();
});

// Estado de la venta
let estadoVenta = {
    pasoActual: 1,
    cliente: null,
    carrito: [],
    subtotal: 0,
    descuento: 0,
    total: 0
};

// Inicializar ventas
function inicializarVentas() {
    // Cargar categorías para filtro
    cargarCategoriasVenta();
    
    // Cargar lista de productos
    cargarProductosVenta();
    
    // Cargar ventas recientes
    cargarVentasRecientes();
}

// Cargar categorías para filtro
function cargarCategoriasVenta() {
    const select = document.getElementById('filtroCategoriaVenta');
    if (!select) return;
    
    const config = SistemaDatos.obtenerConfiguracion();
    
    select.innerHTML = '<option value="todas">Todas las categorías</option>';
    config.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });
}

// Cargar lista de productos
function cargarProductosVenta() {
    const contenedor = document.getElementById('listaProductosVenta');
    if (!contenedor) return;
    
    const productos = SistemaDatos.obtenerProductos().filter(p => p.stock > 0);
    
    contenedor.innerHTML = '';
    
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="productos-vacio">
                <i class="fas fa-box-open"></i>
                <p>No hay productos disponibles para la venta</p>
                <a href="agregar-producto.html" class="btn btn-primary">Agregar Productos</a>
            </div>
        `;
        return;
    }
    
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-item';
        productoDiv.dataset.id = producto.id;
        
        let estadoClass = '';
        let estadoText = '';
        
        if (producto.estado === 'lowstock') {
            estadoClass = 'stock-bajo';
            estadoText = 'Stock bajo';
        }
        
        productoDiv.innerHTML = `
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <div class="producto-detalles">
                    <span class="producto-categoria">${producto.categoria}</span>
                    <span class="producto-talla">Talla: ${producto.talla}</span>
                    <span class="producto-color">Color: ${producto.color}</span>
                </div>
                <div class="producto-stock ${estadoClass}">
                    <i class="fas fa-box"></i> Stock: ${producto.stock} ${estadoText ? `- ${estadoText}` : ''}
                </div>
            </div>
            <div class="producto-precio">
                <div class="precio-venta">S/. ${producto.precioVenta.toFixed(2)}</div>
                <div class="producto-acciones">
                    <input type="number" class="cantidad-producto" min="1" max="${producto.stock}" value="1">
                    <button class="btn btn-primary btn-agregar-carrito">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        
        contenedor.appendChild(productoDiv);
    });
    
    // Agregar eventos a los botones
    contenedor.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
            const productoDiv = this.closest('.producto-item');
            agregarProductoAlCarrito(productoDiv);
        });
    });
}

// Agregar producto al carrito
function agregarProductoAlCarrito(productoDiv) {
    const productoId = parseInt(productoDiv.dataset.id);
    const cantidadInput = productoDiv.querySelector('.cantidad-producto');
    const cantidad = parseInt(cantidadInput.value) || 1;
    
    // Validar cantidad
    if (cantidad < 1) {
        mostrarMensaje('error', 'La cantidad debe ser al menos 1');
        return;
    }
    
    // Buscar producto
    const producto = SistemaDatos.buscarProducto(productoId);
    if (!producto) {
        mostrarMensaje('error', 'Producto no encontrado');
        return;
    }
    
    // Validar stock
    if (producto.stock < cantidad) {
        mostrarMensaje('error', `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
        cantidadInput.value = producto.stock;
        return;
    }
    
    // Verificar si ya está en el carrito
    const itemIndex = estadoVenta.carrito.findIndex(item => item.productoId === productoId);
    
    if (itemIndex !== -1) {
        // Actualizar cantidad
        const nuevaCantidad = estadoVenta.carrito[itemIndex].cantidad + cantidad;
        if (producto.stock < nuevaCantidad) {
            mostrarMensaje('error', `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
            return;
        }
        estadoVenta.carrito[itemIndex].cantidad = nuevaCantidad;
    } else {
        // Agregar nuevo item
        estadoVenta.carrito.push({
            productoId: productoId,
            nombre: producto.nombre,
            precio: producto.precioVenta,
            cantidad: cantidad
        });
    }
    
    // Actualizar carrito
    actualizarCarrito();
    
    // Feedback visual
    mostrarMensaje('success', 'Producto agregado al carrito');
    
    // Resetear cantidad
    cantidadInput.value = 1;
}

// Actualizar carrito
function actualizarCarrito() {
    const tbody = document.getElementById('carritoVenta');
    tbody.innerHTML = '';
    
    estadoVenta.subtotal = 0;
    
    if (estadoVenta.carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">El carrito está vacío</td>
            </tr>
        `;
    } else {
        estadoVenta.carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            estadoVenta.subtotal += subtotal;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nombre}</td>
                <td>
                    <input type="number" class="cantidad-carrito" 
                           value="${item.cantidad}" min="1" data-index="${index}">
                </td>
                <td>S/. ${item.precio.toFixed(2)}</td>
                <td>S/. ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-eliminar-carrito" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Actualizar totales
    calcularTotales();
    
    // Agregar eventos
    tbody.querySelectorAll('.cantidad-carrito').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const nuevaCantidad = parseInt(this.value) || 1;
            actualizarCantidadCarrito(index, nuevaCantidad);
        });
    });
    
    tbody.querySelectorAll('.btn-eliminar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            eliminarDelCarrito(index);
        });
    });
}

// Actualizar cantidad en carrito
function actualizarCantidadCarrito(index, cantidad) {
    if (cantidad < 1) {
        cantidad = 1;
    }
    
    const item = estadoVenta.carrito[index];
    const producto = SistemaDatos.buscarProducto(item.productoId);
    
    if (!producto) {
        mostrarMensaje('error', 'Producto no encontrado');
        return;
    }
    
    if (producto.stock < cantidad) {
        mostrarMensaje('error', `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
        // Resetear a stock máximo
        const input = document.querySelector(`.cantidad-carrito[data-index="${index}"]`);
        if (input) {
            input.value = producto.stock;
        }
        cantidad = producto.stock;
    }
    
    estadoVenta.carrito[index].cantidad = cantidad;
    actualizarCarrito();
}

// Eliminar del carrito
function eliminarDelCarrito(index) {
    estadoVenta.carrito.splice(index, 1);
    actualizarCarrito();
    mostrarMensaje('info', 'Producto eliminado del carrito');
}

// Calcular totales
function calcularTotales() {
    estadoVenta.descuento = parseFloat(document.getElementById('descuento').value) || 0;
    estadoVenta.total = estadoVenta.subtotal - estadoVenta.descuento;
    
    // Verificar método de pago para comisión
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
    if (metodoPago && metodoPago.value === 'tarjeta') {
        const config = SistemaDatos.obtenerConfiguracion();
        const comision = estadoVenta.total * (config.comisionTarjeta / 100);
        estadoVenta.total += comision;
        document.getElementById('montoTarjeta').value = `S/. ${estadoVenta.total.toFixed(2)}`;
    }
    
    // Actualizar UI
    document.getElementById('subtotalCarrito').textContent = `S/. ${estadoVenta.subtotal.toFixed(2)}`;
    document.getElementById('descuentoCarrito').textContent = `S/. ${estadoVenta.descuento.toFixed(2)}`;
    document.getElementById('totalCarrito').textContent = `S/. ${estadoVenta.total.toFixed(2)}`;
}

// Cambiar paso en el proceso de venta
function cambiarPaso(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.card-paso').forEach(card => {
        card.style.display = 'none';
    });
    
    // Mostrar paso actual
    document.getElementById(`paso${paso}`).style.display = 'block';
    estadoVenta.pasoActual = paso;
}

// Validar datos del cliente
function validarCliente() {
    const nombre = document.getElementById('clienteNombre').value.trim();
    const dni = document.getElementById('clienteDNI').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const email = document.getElementById('clienteEmail').value.trim();
    
    if (!nombre) {
        mostrarMensaje('error', 'El nombre del cliente es requerido');
        return false;
    }
    
    if (!dni || dni.length !== 8) {
        mostrarMensaje('error', 'El DNI debe tener 8 dígitos');
        return false;
    }
    
    if (!telefono || telefono.length !== 9) {
        mostrarMensaje('error', 'El teléfono debe tener 9 dígitos');
        return false;
    }
    
    if (email && !validarEmail(email)) {
        mostrarMensaje('error', 'El email no es válido');
        return false;
    }
    
    // Guardar datos del cliente
    estadoVenta.cliente = {
        nombre: nombre,
        dni: dni,
        telefono: telefono,
        email: email || ''
    };
    
    return true;
}

// Validar carrito
function validarCarrito() {
    if (estadoVenta.carrito.length === 0) {
        mostrarMensaje('error', 'Debe agregar al menos un producto al carrito');
        return false;
    }
    
    // Verificar stock de todos los productos
    for (const item of estadoVenta.carrito) {
        const producto = SistemaDatos.buscarProducto(item.productoId);
        if (!producto) {
            mostrarMensaje('error', `Producto "${item.nombre}" no encontrado`);
            return false;
        }
        
        if (producto.stock < item.cantidad) {
            mostrarMensaje('error', `Stock insuficiente de "${item.nombre}". Solo hay ${producto.stock} unidades`);
            return false;
        }
    }
    
    return true;
}

// Finalizar venta
function finalizarVenta() {
    // Validar datos
    if (!validarCliente()) {
        cambiarPaso(1);
        return;
    }
    
    if (!validarCarrito()) {
        cambiarPaso(2);
        return;
    }
    
    // Calcular total final
    calcularTotales();
    
    // Preparar datos para confirmación
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
    const metodoTexto = {
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia',
        'tarjeta': 'Tarjeta (+5% comisión)'
    }[metodoPago];
    
    // Mostrar resumen en modal
    document.getElementById('clienteResumen').textContent = estadoVenta.cliente.nombre;
    document.getElementById('totalResumen').textContent = `S/. ${estadoVenta.total.toFixed(2)}`;
    document.getElementById('metodoPagoResumen').textContent = metodoTexto;
    document.getElementById('fechaResumen').textContent = new Date().toLocaleDateString('es-PE');
    
    // Mostrar modal de confirmación
    document.getElementById('modalConfirmarVenta').style.display = 'flex';
}

// Confirmar y guardar venta
function confirmarVenta() {
    try {
        // Generar ID de venta
        const ventaId = SistemaDatos.generarId('venta');
        
        // Buscar o crear cliente
        let cliente = SistemaDatos.buscarClientePorDNI(estadoVenta.cliente.dni);
        
        if (!cliente) {
            // Crear nuevo cliente
            cliente = {
                id: SistemaDatos.generarId('cliente'),
                nombre: estadoVenta.cliente.nombre,
                dni: estadoVenta.cliente.dni,
                telefono: estadoVenta.cliente.telefono,
                email: estadoVenta.cliente.email || '',
                fechaRegistro: new Date().toISOString().split('T')[0],
                compras: 0,
                totalGastado: 0
            };
            
            const clientes = SistemaDatos.obtenerClientes();
            clientes.push(cliente);
            SistemaDatos.guardarClientes(clientes);
        }
        
        // Actualizar stock de productos
        const productos = SistemaDatos.obtenerProductos();
        
        estadoVenta.carrito.forEach(item => {
            const productoIndex = productos.findIndex(p => p.id === item.productoId);
            if (productoIndex !== -1) {
                productos[productoIndex].stock -= item.cantidad;
                // Actualizar estado del producto
                if (productos[productoIndex].stock === 0) {
                    productos[productoIndex].estado = 'outofstock';
                } else if (productos[productoIndex].stock <= productos[productoIndex].stockMinimo) {
                    productos[productoIndex].estado = 'lowstock';
                }
            }
        });
        
        SistemaDatos.guardarProductos(productos);
        
        // Crear objeto de venta
        const venta = {
            id: ventaId,
            clienteId: cliente.id,
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-PE', { hour12: false }),
            productos: estadoVenta.carrito.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precio: item.precio
            })),
            subtotal: estadoVenta.subtotal,
            descuento: estadoVenta.descuento,
            total: estadoVenta.total,
            metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
            estado: 'completada',
            vendedor: 'Sistema'
        };
        
        // Guardar venta
        const ventas = SistemaDatos.obtenerVentas();
        ventas.push(venta);
        SistemaDatos.guardarVentas(ventas);
        
        // Actualizar cliente
        cliente.compras++;
        cliente.totalGastado += estadoVenta.total;
        
        const clientes = SistemaDatos.obtenerClientes();
        const clienteIndex = clientes.findIndex(c => c.id === cliente.id);
        if (clienteIndex !== -1) {
            clientes[clienteIndex] = cliente;
            SistemaDatos.guardarClientes(clientes);
        }
        
        // Mostrar comprobante
        mostrarComprobante(venta, cliente);
        
        // Resetear estado de venta
        resetearVenta();
        
        // Actualizar ventas recientes
        cargarVentasRecientes();
        
        // Cerrar modal
        document.getElementById('modalConfirmarVenta').style.display = 'none';
        
        mostrarMensaje('success', 'Venta registrada exitosamente');
        
    } catch (error) {
        console.error('Error al guardar venta:', error);
        mostrarMensaje('error', 'Error al procesar la venta');
    }
}

// Mostrar comprobante
function mostrarComprobante(venta, cliente) {
    const comprobanteHTML = `
        <div class="comprobante">
            <div class="comprobante-header">
                <h2><i class="fas fa-store"></i> Jessica Boutique</h2>
                <p>COMPROBANTE DE VENTA</p>
            </div>
            <div class="comprobante-info">
                <p><strong>N° Venta:</strong> ${venta.id}</p>
                <p><strong>Fecha:</strong> ${venta.fecha} ${venta.hora}</p>
                <p><strong>Cliente:</strong> ${cliente.nombre}</p>
                <p><strong>DNI:</strong> ${cliente.dni}</p>
            </div>
            <div class="comprobante-detalle">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.productos.map(item => `
                            <tr>
                                <td>${item.productoId}</td>
                                <td>${item.cantidad}</td>
                                <td>S/. ${item.precio.toFixed(2)}</td>
                                <td>S/. ${(item.precio * item.cantidad).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="comprobante-totales">
                <p><strong>Subtotal:</strong> S/. ${venta.subtotal.toFixed(2)}</p>
                <p><strong>Descuento:</strong> S/. ${venta.descuento.toFixed(2)}</p>
                <p><strong>Total:</strong> S/. ${venta.total.toFixed(2)}</p>
                <p><strong>Método de Pago:</strong> ${venta.metodoPago}</p>
            </div>
            <div class="comprobante-footer">
                <p>¡Gracias por su compra!</p>
                <p>Vuelva pronto</p>
            </div>
        </div>
    `;
    
    // Crear ventana de impresión
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
        <head>
            <title>Comprobante Venta ${venta.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .comprobante { max-width: 400px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                .comprobante-header { text-align: center; margin-bottom: 20px; }
                .comprobante-totales { margin-top: 20px; }
                @media print {
                    .no-print { display: none; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            ${comprobanteHTML}
            <div style="text-align: center; margin-top: 20px;" class="no-print">
                <button onclick="window.print()">Imprimir</button>
                <button onclick="window.close()">Cerrar</button>
            </div>
        </body>
        </html>
    `);
    ventana.document.close();
}

// Resetear venta
function resetearVenta() {
    estadoVenta = {
        pasoActual: 1,
        cliente: null,
        carrito: [],
        subtotal: 0,
        descuento: 0,
        total: 0
    };
    
    // Resetear formularios
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteDNI').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('descuento').value = '0';
    
    // Volver al paso 1
    cambiarPaso(1);
    
    // Actualizar carrito
    actualizarCarrito();
}

// Cancelar venta
function cancelarVenta() {
    if (estadoVenta.carrito.length > 0) {
        if (!confirm('¿Estás seguro de cancelar la venta? Se perderán todos los productos del carrito.')) {
            return;
        }
    }
    
    resetearVenta();
    mostrarMensaje('info', 'Venta cancelada');
}

// Cargar ventas recientes
function cargarVentasRecientes() {
    const tbody = document.getElementById('ventasRecientes');
    if (!tbody) return;
    
    const ventas = SistemaDatos.obtenerVentas();
    const clientes = SistemaDatos.obtenerClientes();
    
    // Ordenar por fecha más reciente
    ventas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));
    
    tbody.innerHTML = '';
    
    ventas.slice(0, 10).forEach(venta => {
        const cliente = clientes.find(c => c.id === venta.clienteId);
        const productosCount = venta.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venta.id}</td>
            <td>${cliente?.nombre || 'Cliente no encontrado'}</td>
            <td>${productosCount} productos</td>
            <td>S/. ${venta.total.toFixed(2)}</td>
            <td>${venta.fecha}</td>
            <td>
                <span class="estado-${venta.estado}">
                    ${venta.estado === 'completada' ? 'Completada' : venta.estado}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay ventas registradas</td>
            </tr>
        `;
    }
}

// Configurar eventos
function configurarEventosVentas() {
    // Navegación entre pasos
    document.getElementById('siguienteProductos').addEventListener('click', function() {
        if (validarCliente()) {
            cambiarPaso(2);
        }
    });
    
    document.getElementById('siguientePago').addEventListener('click', function() {
        if (validarCarrito()) {
            cambiarPaso(3);
        }
    });
    
    document.getElementById('volverCliente').addEventListener('click', function() {
        cambiarPaso(1);
    });
    
    document.getElementById('volverProductos').addEventListener('click', function() {
        cambiarPaso(2);
    });
    
    // Método de pago
    document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const campoTarjeta = document.getElementById('campoTarjeta');
            if (this.value === 'tarjeta') {
                campoTarjeta.style.display = 'block';
            } else {
                campoTarjeta.style.display = 'none';
            }
            calcularTotales();
        });
    });
    
    // Descuento
    document.getElementById('descuento').addEventListener('input', calcularTotales);
    
    // Buscar productos
    document.getElementById('buscarProductoVenta').addEventListener('input', buscarProductos);
    document.getElementById('filtroCategoriaVenta').addEventListener('change', buscarProductos);
    
    // Finalizar venta
    document.getElementById('finalizarVenta').addEventListener('click', finalizarVenta);
    
    // Cancelar venta
    document.getElementById('cancelarVenta').addEventListener('click', cancelarVenta);
    
    // Actualizar ventas recientes
    document.getElementById('actualizarVentas').addEventListener('click', cargarVentasRecientes);
    
    // Confirmación de venta
    document.getElementById('confirmarVentaFinal').addEventListener('click', confirmarVenta);
    document.getElementById('cancelarConfirmacion').addEventListener('click', function() {
        document.getElementById('modalConfirmarVenta').style.display = 'none';
    });
    
    // Cerrar modales
    document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// Buscar productos
function buscarProductos() {
    const busqueda = document.getElementById('buscarProductoVenta').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoriaVenta').value;
    
    const productos = SistemaDatos.obtenerProductos().filter(p => p.stock > 0);
    const contenedor = document.getElementById('listaProductosVenta');
    
    if (!busqueda && categoria === 'todas') {
        cargarProductosVenta();
        return;
    }
    
    const productosFiltrados = productos.filter(producto => {
        const coincideBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.codigo?.toLowerCase().includes(busqueda);
        
        const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
        
        return coincideBusqueda && coincideCategoria;
    });
    
    // Actualizar lista
    contenedor.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="productos-vacio">
                <i class="fas fa-search"></i>
                <p>No se encontraron productos</p>
            </div>
        `;
        return;
    }
    
    productosFiltrados.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-item';
        productoDiv.dataset.id = producto.id;
        
        let estadoClass = '';
        let estadoText = '';
        
        if (producto.estado === 'lowstock') {
            estadoClass = 'stock-bajo';
            estadoText = 'Stock bajo';
        }
        
        productoDiv.innerHTML = `
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <div class="producto-detalles">
                    <span class="producto-categoria">${producto.categoria}</span>
                    <span class="producto-talla">Talla: ${producto.talla}</span>
                    <span class="producto-color">Color: ${producto.color}</span>
                </div>
                <div class="producto-stock ${estadoClass}">
                    <i class="fas fa-box"></i> Stock: ${producto.stock} ${estadoText ? `- ${estadoText}` : ''}
                </div>
            </div>
            <div class="producto-precio">
                <div class="precio-venta">S/. ${producto.precioVenta.toFixed(2)}</div>
                <div class="producto-acciones">
                    <input type="number" class="cantidad-producto" min="1" max="${producto.stock}" value="1">
                    <button class="btn btn-primary btn-agregar-carrito">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        
        contenedor.appendChild(productoDiv);
    });
    
    // Agregar eventos
    contenedor.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
            const productoDiv = this.closest('.producto-item');
            agregarProductoAlCarrito(productoDiv);
        });
    });
}

// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Mostrar mensaje
function mostrarMensaje(tipo, mensaje) {
    if (window.Sistema && Sistema.mostrarMensaje) {
        Sistema.mostrarMensaje(tipo, mensaje);
        return;
    }
    
    // Fallback básico
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}