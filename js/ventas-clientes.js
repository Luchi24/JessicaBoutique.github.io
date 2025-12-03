// Gestión de ventas y clientes para Jessica Boutique
const VentasClientes = (function() {
    // Variables globales del módulo
    let carrito = [];
    let clienteActual = null;
    let metodoPago = 'efectivo';

    // Inicializar módulo
    function inicializar() {
        if (document.getElementById('ventas-container')) {
            cargarProductosParaVenta();
            configurarEventosVenta();
            actualizarResumenVenta();
        }
        
        if (document.getElementById('clientes-container')) {
            cargarClientes();
            configurarEventosClientes();
        }
    }

    // Cargar productos para venta
    function cargarProductosParaVenta() {
        const selectProducto = document.getElementById('select-producto');
        if (!selectProducto) return;
        
        const productos = SistemaDatos.obtenerProductos();
        
        selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';
        productos.forEach(producto => {
            if (producto.stock > 0) {
                selectProducto.innerHTML += `
                    <option value="${producto.id}" 
                            data-precio="${producto.precioVenta}"
                            data-stock="${producto.stock}">
                        ${producto.nombre} - ${producto.talla} (${producto.color}) - Stock: ${producto.stock} - ${Sistema.formatearMoneda(producto.precioVenta)}
                    </option>
                `;
            }
        });
        
        // Actualizar precio cuando se selecciona un producto
        selectProducto.addEventListener('change', function() {
            const opcion = this.options[this.selectedIndex];
            const precio = opcion.dataset.precio;
            document.getElementById('precio-unitario').value = precio || '';
        });
    }

    // Configurar eventos de venta
    function configurarEventosVenta() {
        // Agregar producto al carrito
        document.getElementById('btn-agregar-carrito')?.addEventListener('click', agregarAlCarrito);
        
        // Buscar cliente por DNI
        document.getElementById('btn-buscar-cliente')?.addEventListener('click', buscarCliente);
        
        // Método de pago
        document.getElementById('metodo-pago')?.addEventListener('change', function() {
            metodoPago = this.value;
            actualizarResumenVenta();
        });
        
        // Finalizar venta
        document.getElementById('btn-finalizar-venta')?.addEventListener('click', finalizarVenta);
        
        // Limpiar venta
        document.getElementById('btn-limpiar-venta')?.addEventListener('click', limpiarVenta);
        
        // Delegación de eventos para el carrito
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-eliminar-item')) {
                const index = e.target.closest('.btn-eliminar-item').dataset.index;
                eliminarDelCarrito(parseInt(index));
            }
            
            if (e.target.closest('.btn-modificar-cantidad')) {
                const index = e.target.closest('.btn-modificar-cantidad').dataset.index;
                const accion = e.target.closest('.btn-modificar-cantidad').dataset.accion;
                modificarCantidad(parseInt(index), accion);
            }
        });
    }

    // Agregar producto al carrito
    function agregarAlCarrito() {
        const selectProducto = document.getElementById('select-producto');
        const inputCantidad = document.getElementById('cantidad');
        
        const productoId = parseInt(selectProducto.value);
        const cantidad = parseInt(inputCantidad.value);
        
        if (!productoId || cantidad < 1) {
            Sistema.mostrarMensaje('error', 'Selecciona un producto y una cantidad válida');
            return;
        }
        
        const producto = SistemaDatos.buscarProducto(productoId);
        if (!producto) {
            Sistema.mostrarMensaje('error', 'Producto no encontrado');
            return;
        }
        
        // Verificar stock disponible
        if (producto.stock < cantidad) {
            Sistema.mostrarMensaje('error', `Stock insuficiente. Disponible: ${producto.stock}`);
            return;
        }
        
        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.find(item => item.productoId === productoId);
        
        if (itemExistente) {
            // Actualizar cantidad si ya existe
            const nuevaCantidad = itemExistente.cantidad + cantidad;
            if (producto.stock < nuevaCantidad) {
                Sistema.mostrarMensaje('error', `Stock insuficiente. Disponible: ${producto.stock}`);
                return;
            }
            itemExistente.cantidad = nuevaCantidad;
            itemExistente.subtotal = nuevaCantidad * producto.precioVenta;
        } else {
            // Agregar nuevo item
            carrito.push({
                productoId: productoId,
                nombre: producto.nombre,
                cantidad: cantidad,
                precio: producto.precioVenta,
                subtotal: cantidad * producto.precioVenta
            });
        }
        
        // Limpiar formulario
        selectProducto.value = '';
        inputCantidad.value = 1;
        document.getElementById('precio-unitario').value = '';
        
        // Actualizar interfaz
        actualizarCarrito();
        actualizarResumenVenta();
        
        Sistema.mostrarMensaje('success', 'Producto agregado al carrito');
    }

    // Actualizar carrito en la interfaz
    function actualizarCarrito() {
        const tbody = document.getElementById('carrito-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (carrito.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No hay productos en el carrito
                    </td>
                </tr>
            `;
            return;
        }
        
        carrito.forEach((item, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>
                    <div class="cantidad-control">
                        <button class="btn btn-sm btn-modificar-cantidad" data-index="${index}" data-accion="decrementar">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cantidad-valor">${item.cantidad}</span>
                        <button class="btn btn-sm btn-modificar-cantidad" data-index="${index}" data-accion="incrementar">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td>${Sistema.formatearMoneda(item.precio)}</td>
                <td>${Sistema.formatearMoneda(item.subtotal)}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-eliminar-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Eliminar producto del carrito
    function eliminarDelCarrito(index) {
        if (index >= 0 && index < carrito.length) {
            carrito.splice(index, 1);
            actualizarCarrito();
            actualizarResumenVenta();
            Sistema.mostrarMensaje('info', 'Producto eliminado del carrito');
        }
    }

    // Modificar cantidad de un producto en el carrito
    function modificarCantidad(index, accion) {
        if (index < 0 || index >= carrito.length) return;
        
        const item = carrito[index];
        const producto = SistemaDatos.buscarProducto(item.productoId);
        
        if (!producto) return;
        
        if (accion === 'incrementar') {
            if (producto.stock > item.cantidad) {
                item.cantidad++;
            } else {
                Sistema.mostrarMensaje('error', 'No hay más stock disponible');
                return;
            }
        } else if (accion === 'decrementar') {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                // Si la cantidad es 1, eliminar el producto
                eliminarDelCarrito(index);
                return;
            }
        }
        
        item.subtotal = item.cantidad * item.precio;
        
        actualizarCarrito();
        actualizarResumenVenta();
    }

    // Actualizar resumen de venta
    function actualizarResumenVenta() {
        const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const config = SistemaDatos.obtenerConfiguracion();
        
        let total = subtotal;
        let comision = 0;
        
        // Calcular comisión por tarjeta
        if (metodoPago === 'tarjeta') {
            comision = subtotal * config.comisionTarjeta;
            total = subtotal + comision;
        }
        
        // Actualizar interfaz
        document.getElementById('subtotal-venta').textContent = Sistema.formatearMoneda(subtotal);
        document.getElementById('comision-venta').textContent = Sistema.formatearMoneda(comision);
        document.getElementById('total-venta').textContent = Sistema.formatearMoneda(total);
        
        // Mostrar/ocultar comisión
        document.getElementById('comision-container').style.display = 
            metodoPago === 'tarjeta' ? 'block' : 'none';
    }

    // Buscar cliente por DNI
    function buscarCliente() {
        const inputDNI = document.getElementById('cliente-dni');
        const dni = inputDNI.value.trim();
        
        if (!Sistema.validarDNI(dni)) {
            Sistema.mostrarMensaje('error', 'DNI inválido. Debe tener 8 dígitos');
            return;
        }
        
        clienteActual = SistemaDatos.buscarClientePorDNI(dni);
        
        if (clienteActual) {
            // Cliente existente
            document.getElementById('cliente-nombre').value = clienteActual.nombre;
            document.getElementById('cliente-telefono').value = clienteActual.telefono;
            document.getElementById('cliente-email').value = clienteActual.email || '';
            
            Sistema.mostrarMensaje('success', `Cliente encontrado: ${clienteActual.nombre}`);
        } else {
            // Nuevo cliente
            document.getElementById('cliente-nombre').value = '';
            document.getElementById('cliente-telefono').value = '';
            document.getElementById('cliente-email').value = '';
            
            Sistema.mostrarMensaje('info', 'Cliente no encontrado. Completa los datos para crear uno nuevo');
        }
    }

    // Finalizar venta
    function finalizarVenta() {
        // Validar carrito
        if (carrito.length === 0) {
            Sistema.mostrarMensaje('error', 'No hay productos en el carrito');
            return;
        }
        
        // Validar cliente
        const nombreCliente = document.getElementById('cliente-nombre').value.trim();
        const dniCliente = document.getElementById('cliente-dni').value.trim();
        const telefonoCliente = document.getElementById('cliente-telefono').value.trim();
        
        if (!nombreCliente || !dniCliente || !telefonoCliente) {
            Sistema.mostrarMensaje('error', 'Completa todos los datos del cliente');
            return;
        }
        
        if (!Sistema.validarDNI(dniCliente)) {
            Sistema.mostrarMensaje('error', 'DNI inválido');
            return;
        }
        
        if (!Sistema.validarTelefono(telefonoCliente)) {
            Sistema.mostrarMensaje('error', 'Teléfono inválido');
            return;
        }
        
        const emailCliente = document.getElementById('cliente-email').value.trim();
        if (emailCliente && !Sistema.validarEmail(emailCliente)) {
            Sistema.mostrarMensaje('error', 'Email inválido');
            return;
        }
        
        // Validar método de pago
        if (!metodoPago) {
            Sistema.mostrarMensaje('error', 'Selecciona un método de pago');
            return;
        }
        
        // Confirmar venta
        if (!confirm('¿Confirmar venta?')) {
            return;
        }
        
        // Procesar venta
        procesarVenta(nombreCliente, dniCliente, telefonoCliente, emailCliente);
    }

    // Procesar venta
    function procesarVenta(nombreCliente, dniCliente, telefonoCliente, emailCliente) {
        Sistema.mostrarLoader('Procesando venta...');
        
        try {
            // 1. Actualizar o crear cliente
            let cliente = SistemaDatos.buscarClientePorDNI(dniCliente);
            
            if (!cliente) {
                // Crear nuevo cliente
                cliente = {
                    id: SistemaDatos.generarId('cliente'),
                    nombre: nombreCliente,
                    dni: dniCliente,
                    telefono: telefonoCliente,
                    email: emailCliente,
                    fechaRegistro: new Date().toISOString().split('T')[0],
                    compras: 0,
                    totalGastado: 0
                };
                
                const clientes = SistemaDatos.obtenerClientes();
                clientes.push(cliente);
                SistemaDatos.guardarClientes(clientes);
            }
            
            // 2. Calcular totales
            const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
            const config = SistemaDatos.obtenerConfiguracion();
            let comision = 0;
            
            if (metodoPago === 'tarjeta') {
                comision = subtotal * config.comisionTarjeta;
            }
            
            const total = subtotal + comision;
            
            // 3. Crear venta
            const venta = {
                id: SistemaDatos.generarId('venta'),
                clienteId: cliente.id,
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                productos: carrito.map(item => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precio: item.precio
                })),
                subtotal: subtotal,
                descuento: 0,
                comision: comision,
                total: total,
                metodoPago: metodoPago,
                estado: 'completada',
                vendedor: 'Sistema'
            };
            
            // 4. Actualizar stock de productos
            const productos = SistemaDatos.obtenerProductos();
            
            carrito.forEach(itemCarrito => {
                const productoIndex = productos.findIndex(p => p.id === itemCarrito.productoId);
                if (productoIndex !== -1) {
                    productos[productoIndex].stock -= itemCarrito.cantidad;
                    productos[productoIndex] = SistemaDatos.actualizarEstadoProducto(productos[productoIndex]);
                }
            });
            
            // 5. Actualizar cliente (incrementar compras)
            cliente.compras++;
            cliente.totalGastado += total;
            
            // 6. Guardar todos los cambios
            const ventas = SistemaDatos.obtenerVentas();
            ventas.push(venta);
            
            SistemaDatos.guardarProductos(productos);
            SistemaDatos.guardarVentas(ventas);
            SistemaDatos.guardarClientes(SistemaDatos.obtenerClientes());
            
            // 7. Generar comprobante
            generarComprobante(venta, cliente);
            
            // 8. Limpiar venta
            setTimeout(() => {
                limpiarVenta();
                Sistema.mostrarMensaje('success', `Venta completada. Total: ${Sistema.formatearMoneda(total)}`);
                Sistema.ocultarLoader();
            }, 1000);
            
        } catch (error) {
            Sistema.ocultarLoader();
            Sistema.mostrarMensaje('error', `Error al procesar venta: ${error.message}`);
            console.error(error);
        }
    }

    // Generar comprobante de venta
    function generarComprobante(venta, cliente) {
        const comprobanteHTML = `
            <div class="comprobante-venta">
                <h3>Jessica Boutique</h3>
                <p>Comprobante de Venta</p>
                <hr>
                <p><strong>Venta #:</strong> ${venta.id}</p>
                <p><strong>Fecha:</strong> ${venta.fecha} ${venta.hora}</p>
                <p><strong>Cliente:</strong> ${cliente.nombre}</p>
                <p><strong>DNI:</strong> ${cliente.dni}</p>
                <hr>
                <h4>Productos:</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.productos.map(item => {
                            const producto = SistemaDatos.buscarProducto(item.productoId);
                            return `
                                <tr>
                                    <td>${producto?.nombre || 'Producto'}</td>
                                    <td>${item.cantidad}</td>
                                    <td>${Sistema.formatearMoneda(item.precio)}</td>
                                    <td>${Sistema.formatearMoneda(item.cantidad * item.precio)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <hr>
                <p><strong>Subtotal:</strong> ${Sistema.formatearMoneda(venta.subtotal)}</p>
                ${venta.comision > 0 ? `<p><strong>Comisión (${SistemaDatos.obtenerConfiguracion().comisionTarjeta * 100}%):</strong> ${Sistema.formatearMoneda(venta.comision)}</p>` : ''}
                <p><strong>Total:</strong> ${Sistema.formatearMoneda(venta.total)}</p>
                <p><strong>Método de pago:</strong> ${obtenerTextoMetodoPago(venta.metodoPago)}</p>
                <hr>
                <p>¡Gracias por su compra!</p>
            </div>
        `;
        
        // Mostrar comprobante en modal
        const modal = document.getElementById('modal-comprobante');
        if (modal) {
            modal.querySelector('.modal-body').innerHTML = comprobanteHTML;
            modal.style.display = 'block';
        }
        
        // También se podría imprimir
        // window.print();
    }

    // Obtener texto del método de pago
    function obtenerTextoMetodoPago(metodo) {
        const metodos = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia'
        };
        return metodos[metodo] || metodo;
    }

    // Limpiar venta actual
    function limpiarVenta() {
        carrito = [];
        clienteActual = null;
        metodoPago = 'efectivo';
        
        // Limpiar formularios
        document.getElementById('cliente-dni').value = '';
        document.getElementById('cliente-nombre').value = '';
        document.getElementById('cliente-telefono').value = '';
        document.getElementById('cliente-email').value = '';
        document.getElementById('metodo-pago').value = 'efectivo';
        
        // Actualizar interfaz
        actualizarCarrito();
        actualizarResumenVenta();
        cargarProductosParaVenta();
        
        // Cerrar modal de comprobante si está abierto
        const modal = document.getElementById('modal-comprobante');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Cargar clientes para gestión
    function cargarClientes() {
        const tbody = document.getElementById('clientes-body');
        if (!tbody) return;
        
        const clientes = SistemaDatos.obtenerClientes();
        
        tbody.innerHTML = '';
        
        if (clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No hay clientes registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        clientes.forEach(cliente => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.compras}</td>
                <td>${Sistema.formatearMoneda(cliente.totalGastado)}</td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Configurar eventos de clientes
    function configurarEventosClientes() {
        // Búsqueda de clientes
        document.getElementById('input-buscar-cliente')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') buscarClientes();
        });
        
        document.getElementById('btn-buscar-cliente')?.addEventListener('click', buscarClientes);
    }

    // Buscar clientes
    function buscarClientes() {
        const input = document.getElementById('input-buscar-cliente');
        const termino = input.value.toLowerCase().trim();
        
        const clientes = SistemaDatos.obtenerClientes();
        const tbody = document.getElementById('clientes-body');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const clientesFiltrados = termino ? 
            clientes.filter(c => 
                c.nombre.toLowerCase().includes(termino) ||
                c.dni.includes(termino) ||
                c.telefono.includes(termino) ||
                (c.email && c.email.toLowerCase().includes(termino))
            ) : clientes;
        
        if (clientesFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No se encontraron clientes
                    </td>
                </tr>
            `;
            return;
        }
        
        clientesFiltrados.forEach(cliente => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.compras}</td>
                <td>${Sistema.formatearMoneda(cliente.totalGastado)}</td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializar);

    // API pública
    return {
        agregarAlCarrito,
        eliminarDelCarrito,
        modificarCantidad,
        buscarCliente,
        finalizarVenta,
        limpiarVenta
    };
})();