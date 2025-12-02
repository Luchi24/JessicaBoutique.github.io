// Variables globales para gestión
let tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

// Inicializar página de gestión
function inicializarGestion() {
    cargarColores();
    cargarCategorias();
    cargarTallas();
    cargarConfiguracion();
    actualizarInformacionSistema();
}

// Gestión de colores
function cargarColores() {
    const listaColores = document.getElementById('lista-colores');
    if (!listaColores) return;
    
    listaColores.innerHTML = '';
    
    datos.colores.forEach((color, index) => {
        // Determinar color para preview basado en nombre
        let colorHex = '#757575'; // Gris por defecto
        
        const coloresMap = {
            'rojo': '#f44336',
            'azul': '#2196f3',
            'verde': '#4caf50',
            'negro': '#000000',
            'blanco': '#ffffff',
            'rosa': '#e91e63',
            'morado': '#9c27b0',
            'amarillo': '#ffeb3b',
            'naranja': '#ff9800',
            'gris': '#9e9e9e',
            'marron': '#795548',
            'celeste': '#03a9f4',
            'turquesa': '#00bcd4',
            'lila': '#ba68c8',
            'beige': '#d7ccc8'
        };
        
        const colorLower = color.toLowerCase();
        for (const [nombre, hex] of Object.entries(coloresMap)) {
            if (colorLower.includes(nombre)) {
                colorHex = hex;
                break;
            }
        }
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-gestion';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-color" style="background-color: ${colorHex};"></div>
                <span>${color}</span>
            </div>
            <div class="item-acciones">
                <button class="btn-editar-item" onclick="editarColor(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-eliminar-item" onclick="eliminarColor(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        listaColores.appendChild(itemDiv);
    });
}

function agregarColor() {
    const input = document.getElementById('nuevo-color');
    const nuevoColor = input.value.trim();
    
    if (!nuevoColor) {
        mostrarNotificacion('Ingresa un nombre de color', 'error');
        return;
    }
    
    // Verificar si ya existe (case insensitive)
    const colorLower = nuevoColor.toLowerCase();
    const existe = datos.colores.some(color => color.toLowerCase() === colorLower);
    
    if (existe) {
        mostrarNotificacion('Este color ya existe', 'error');
        return;
    }
    
    datos.colores.push(nuevoColor);
    guardarDatos();
    cargarColores();
    
    input.value = '';
    mostrarNotificacion('Color agregado correctamente', 'exito');
}

function editarColor(index) {
    const colorActual = datos.colores[index];
    const nuevoNombre = prompt('Editar nombre del color:', colorActual);
    
    if (nuevoNombre && nuevoNombre.trim() !== '' && nuevoNombre !== colorActual) {
        // Verificar si el nuevo nombre ya existe
        const nuevoLower = nuevoNombre.trim().toLowerCase();
        const existe = datos.colores.some((color, i) => 
            i !== index && color.toLowerCase() === nuevoLower
        );
        
        if (existe) {
            mostrarNotificacion('Este color ya existe', 'error');
            return;
        }
        
        datos.colores[index] = nuevoNombre.trim();
        guardarDatos();
        cargarColores();
        mostrarNotificacion('Color actualizado', 'exito');
    }
}

function eliminarColor(index) {
    const color = datos.colores[index];
    
    // Verificar si el color está en uso
    const enUso = datos.productos.some(producto => 
        producto.color.toLowerCase() === color.toLowerCase()
    );
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. El color está en uso por productos.', 'error');
        return;
    }
    
    if (confirm(`¿Eliminar el color "${color}"?`)) {
        datos.colores.splice(index, 1);
        guardarDatos();
        cargarColores();
        mostrarNotificacion('Color eliminado', 'exito');
    }
}

// Gestión de categorías
function cargarCategorias() {
    const listaCategorias = document.getElementById('lista-categorias');
    if (!listaCategorias) return;
    
    listaCategorias.innerHTML = '';
    
    datos.categorias.forEach((categoria, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-gestion';
        itemDiv.innerHTML = `
            <div class="item-info">
                <i class="fas fa-folder"></i>
                <span>${categoria}</span>
            </div>
            <div class="item-acciones">
                <button class="btn-editar-item" onclick="editarCategoria(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-eliminar-item" onclick="eliminarCategoria(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        listaCategorias.appendChild(itemDiv);
    });
}

function agregarCategoria() {
    const input = document.getElementById('nueva-categoria');
    const nuevaCategoria = input.value.trim();
    
    if (!nuevaCategoria) {
        mostrarNotificacion('Ingresa un nombre de categoría', 'error');
        return;
    }
    
    // Verificar si ya existe
    const categoriaLower = nuevaCategoria.toLowerCase();
    const existe = datos.categorias.some(cat => cat.toLowerCase() === categoriaLower);
    
    if (existe) {
        mostrarNotificacion('Esta categoría ya existe', 'error');
        return;
    }
    
    datos.categorias.push(nuevaCategoria);
    guardarDatos();
    cargarCategorias();
    
    input.value = '';
    mostrarNotificacion('Categoría agregada correctamente', 'exito');
}

function editarCategoria(index) {
    const categoriaActual = datos.categorias[index];
    const nuevoNombre = prompt('Editar nombre de la categoría:', categoriaActual);
    
    if (nuevoNombre && nuevoNombre.trim() !== '' && nuevoNombre !== categoriaActual) {
        // Verificar si el nuevo nombre ya existe
        const nuevoLower = nuevoNombre.trim().toLowerCase();
        const existe = datos.categorias.some((cat, i) => 
            i !== index && cat.toLowerCase() === nuevoLower
        );
        
        if (existe) {
            mostrarNotificacion('Esta categoría ya existe', 'error');
            return;
        }
        
        // Actualizar productos que usan esta categoría
        datos.productos.forEach(producto => {
            if (producto.categoria === categoriaActual) {
                producto.categoria = nuevoNombre.trim();
            }
        });
        
        datos.categorias[index] = nuevoNombre.trim();
        guardarDatos();
        cargarCategorias();
        mostrarNotificacion('Categoría actualizada', 'exito');
    }
}

function eliminarCategoria(index) {
    const categoria = datos.categorias[index];
    
    // Verificar si la categoría está en uso
    const enUso = datos.productos.some(producto => producto.categoria === categoria);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. La categoría está en uso por productos.', 'error');
        return;
    }
    
    if (confirm(`¿Eliminar la categoría "${categoria}"?`)) {
        datos.categorias.splice(index, 1);
        guardarDatos();
        cargarCategorias();
        mostrarNotificacion('Categoría eliminada', 'exito');
    }
}

// Gestión de tallas
function cargarTallas() {
    const listaTallas = document.getElementById('lista-tallas');
    if (!listaTallas) return;
    
    listaTallas.innerHTML = '';
    
    tallasDisponibles.forEach((talla, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-gestion';
        itemDiv.innerHTML = `
            <div class="item-info">
                <i class="fas fa-ruler"></i>
                <span>${talla}</span>
            </div>
            <div class="item-acciones">
                <button class="btn-editar-item" onclick="editarTalla(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-eliminar-item" onclick="eliminarTalla(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        listaTallas.appendChild(itemDiv);
    });
}

function agregarTalla() {
    const input = document.getElementById('nueva-talla');
    const nuevaTalla = input.value.trim().toUpperCase();
    
    if (!nuevaTalla) {
        mostrarNotificacion('Ingresa un nombre de talla', 'error');
        return;
    }
    
    // Verificar si ya existe
    const existe = tallasDisponibles.some(talla => talla === nuevaTalla);
    
    if (existe) {
        mostrarNotificacion('Esta talla ya existe', 'error');
        return;
    }
    
    tallasDisponibles.push(nuevaTalla);
    guardarTallas();
    cargarTallas();
    
    input.value = '';
    mostrarNotificacion('Talla agregada correctamente', 'exito');
}

function editarTalla(index) {
    const tallaActual = tallasDisponibles[index];
    const nuevoNombre = prompt('Editar nombre de la talla:', tallaActual);
    
    if (nuevoNombre && nuevoNombre.trim().toUpperCase() !== '' && nuevoNombre.toUpperCase() !== tallaActual) {
        const nuevaTalla = nuevoNombre.trim().toUpperCase();
        
        // Verificar si el nuevo nombre ya existe
        const existe = tallasDisponibles.some((talla, i) => 
            i !== index && talla === nuevaTalla
        );
        
        if (existe) {
            mostrarNotificacion('Esta talla ya existe', 'error');
            return;
        }
        
        // Actualizar productos que usan esta talla
        datos.productos.forEach(producto => {
            if (producto.talla === tallaActual) {
                producto.talla = nuevaTalla;
            }
        });
        
        tallasDisponibles[index] = nuevaTalla;
        guardarTallas();
        cargarTallas();
        guardarDatos(); // Guardar cambios en productos
        mostrarNotificacion('Talla actualizada', 'exito');
    }
}

function eliminarTalla(index) {
    const talla = tallasDisponibles[index];
    
    // Verificar si la talla está en uso
    const enUso = datos.productos.some(producto => producto.talla === talla);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. La talla está en uso por productos.', 'error');
        return;
    }
    
    if (confirm(`¿Eliminar la talla "${talla}"?`)) {
        tallasDisponibles.splice(index, 1);
        guardarTallas();
        cargarTallas();
        mostrarNotificacion('Talla eliminada', 'exito');
    }
}

function guardarTallas() {
    localStorage.setItem('tallas_jessica', JSON.stringify(tallasDisponibles));
}

// Configuración general
function cargarConfiguracion() {
    // Cargar tallas desde localStorage
    const tallasGuardadas = localStorage.getItem('tallas_jessica');
    if (tallasGuardadas) {
        tallasDisponibles = JSON.parse(tallasGuardadas);
    }
    
    // Cargar tasa IGV
    const tasaIGVGuardada = localStorage.getItem('tasa_igv_jessica');
    if (tasaIGVGuardada) {
        datos.config.tasaIGV = parseFloat(tasaIGVGuardada) / 100;
    }
    
    // Cargar alerta stock
    const alertaStockGuardada = localStorage.getItem('alerta_stock_jessica');
    if (alertaStockGuardada) {
        datos.config.alertaStock = parseInt(alertaStockGuardada);
    }
    
    // Cargar tema
    const temaGuardado = localStorage.getItem('tema_jessica');
    if (temaGuardado) {
        document.body.setAttribute('data-tema', temaGuardado);
        const radioTema = document.querySelector(`input[name="tema"][value="${temaGuardado}"]`);
        if (radioTema) {
            radioTema.checked = true;
        }
    }
    
    // Actualizar inputs
    const tasaIGVInput = document.getElementById('tasa-igv');
    const alertaStockInput = document.getElementById('alertas-stock');
    
    if (tasaIGVInput) {
        tasaIGVInput.value = (datos.config.tasaIGV * 100).toFixed(1);
    }
    
    if (alertaStockInput && datos.config.alertaStock) {
        alertaStockInput.value = datos.config.alertaStock;
    }
}

function actualizarConfiguracion() {
    // Actualizar tasa IGV
    const tasaIGVInput = document.getElementById('tasa-igv');
    if (tasaIGVInput) {
        const tasa = parseFloat(tasaIGVInput.value) / 100;
        datos.config.tasaIGV = tasa;
        localStorage.setItem('tasa_igv_jessica', (tasa * 100).toFixed(1));
    }
    
    // Actualizar alerta stock
    const alertaStockInput = document.getElementById('alertas-stock');
    if (alertaStockInput) {
        const alerta = parseInt(alertaStockInput.value);
        datos.config.alertaStock = alerta;
        localStorage.setItem('alerta_stock_jessica', alerta);
    }
    
    // Actualizar tema
    const temaSeleccionado = document.querySelector('input[name="tema"]:checked');
    if (temaSeleccionado) {
        document.body.setAttribute('data-tema', temaSeleccionado.value);
        localStorage.setItem('tema_jessica', temaSeleccionado.value);
    }
    
    mostrarNotificacion('Configuración actualizada', 'exito');
}

// Backup de datos
function exportarDatosCompleto() {
    const datosExportar = {
        ...datos,
        tallasDisponibles: tallasDisponibles,
        fechaExportacion: new Date().toISOString(),
        version: '2.0'
    };
    
    exportarJSON(datosExportar, 'backup-completo-jessica-boutique');
}

function exportarSoloVentas() {
    const datosVentas = {
        ventas: datos.ventas,
        fechaExportacion: new Date().toISOString(),
        tipo: 'ventas'
    };
    
    exportarJSON(datosVentas, 'ventas-jessica-boutique');
}

function exportarSoloInventario() {
    const datosInventario = {
        productos: datos.productos,
        colores: datos.colores,
        categorias: datos.categorias,
        tallasDisponibles: tallasDisponibles,
        fechaExportacion: new Date().toISOString(),
        tipo: 'inventario'
    };
    
    exportarJSON(datosInventario, 'inventario-jessica-boutique');
}

function exportarJSON(datosExportar, nombreArchivo) {
    const dataStr = JSON.stringify(datosExportar, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${nombreArchivo}-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    mostrarNotificacion('Datos exportados correctamente', 'exito');
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        mostrarNotificacion('Por favor, selecciona un archivo JSON', 'error');
        return;
    }
    
    mostrarConfirmacionPeligro(
        'Importar Backup',
        '¿Estás seguro de importar este backup? Se sobreescribirán los datos actuales.',
        function() {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData) {
                        mostrarNotificacion('Archivo JSON inválido', 'error');
                        return;
                    }
                    
                    // Importar según el tipo de backup
                    if (importedData.ventas && importedData.productos) {
                        // Backup completo
                        datos.productos = importedData.productos || [];
                        datos.colores = importedData.colores || datos.colores;
                        datos.categorias = importedData.categorias || datos.categorias;
                        datos.ventas = importedData.ventas || [];
                        tallasDisponibles = importedData.tallasDisponibles || tallasDisponibles;
                    } else if (importedData.ventas) {
                        // Solo ventas
                        datos.ventas = importedData.ventas || [];
                    } else if (importedData.productos) {
                        // Solo inventario
                        datos.productos = importedData.productos || [];
                        datos.colores = importedData.colores || datos.colores;
                        datos.categorias = importedData.categorias || datos.categorias;
                        tallasDisponibles = importedData.tallasDisponibles || tallasDisponibles;
                    }
                    
                    guardarDatos();
                    guardarTallas();
                    
                    // Recargar vistas
                    cargarColores();
                    cargarCategorias();
                    cargarTallas();
                    actualizarInformacionSistema();
                    
                    mostrarNotificacion('Backup importado correctamente', 'exito');
                } catch (error) {
                    console.error('Error importing backup:', error);
                    mostrarNotificacion('Error al importar el backup', 'error');
                }
            };
            
            reader.readAsText(file);
        }
    );
}

function limpiarVentasAntiguas() {
    mostrarConfirmacionPeligro(
        'Limpiar Ventas Antiguas',
        '¿Eliminar ventas de hace más de 1 año? Esta acción no se puede deshacer.',
        function() {
            const unAnioAtras = new Date();
            unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
            
            const ventasFiltradas = datos.ventas.filter(venta => {
                return new Date(venta.fecha) > unAnioAtras;
            });
            
            const eliminadas = datos.ventas.length - ventasFiltradas.length;
            datos.ventas = ventasFiltradas;
            guardarDatos();
            
            actualizarInformacionSistema();
            
            mostrarNotificacion(`Se eliminaron ${eliminadas} ventas antiguas`, 'exito');
        }
    );
}

function restablecerSistema() {
    mostrarConfirmacionPeligro(
        'Restablecer Sistema',
        '¿Estás seguro de restablecer el sistema? Se eliminarán todos los datos excepto configuraciones. Esta acción no se puede deshacer.',
        function() {
            // Mantener solo configuraciones básicas
            const configGuardada = {
                tasaIGV: datos.config.tasaIGV,
                alertaStock: datos.config.alertaStock || 5
            };
            
            // Restablecer datos
            datos.productos = [];
            datos.ventas = [];
            datos.config.ultimoIdVenta = 0;
            datos.config = { ...datos.config, ...configGuardada };
            
            guardarDatos();
            
            // Recargar vistas
            cargarColores();
            cargarCategorias();
            cargarTallas();
            actualizarInformacionSistema();
            
            mostrarNotificacion('Sistema restablecido correctamente', 'exito');
        }
    );
}

// Información del sistema
function actualizarInformacionSistema() {
    // Total productos
    const totalProductosElement = document.getElementById('info-total-productos');
    if (totalProductosElement) {
        totalProductosElement.textContent = datos.productos.length;
    }
    
    // Total ventas
    const totalVentasElement = document.getElementById('info-total-ventas');
    if (totalVentasElement) {
        totalVentasElement.textContent = datos.ventas.length;
    }
    
    // Total clientes únicos
    const totalClientesElement = document.getElementById('info-total-clientes');
    if (totalClientesElement) {
        const clientesUnicos = new Set(datos.ventas.map(v => v.cliente.nombre)).size;
        totalClientesElement.textContent = clientesUnicos;
    }
    
    // Última actividad
    const ultimaActividadElement = document.getElementById('info-ultima-actividad');
    if (ultimaActividadElement) {
        if (datos.ventas.length > 0) {
            const ultimaVenta = datos.ventas.sort((a, b) => 
                new Date(b.fecha) - new Date(a.fecha)
            )[0];
            
            const fecha = new Date(ultimaVenta.fecha);
            ultimaActividadElement.textContent = fecha.toLocaleDateString('es-PE');
        } else {
            ultimaActividadElement.textContent = 'Ninguna';
        }
    }
    
    // Tamaño de datos
    const tamanoDatosElement = document.getElementById('info-tamano-datos');
    if (tamanoDatosElement) {
        const datosString = JSON.stringify(datos);
        const tamañoBytes = new Blob([datosString]).size;
        const tamañoKB = (tamañoBytes / 1024).toFixed(2);
        tamanoDatosElement.textContent = `${tamañoKB} KB`;
    }
}

// Funciones auxiliares
function mostrarConfirmacionPeligro(titulo, mensaje, callback) {
    const modal = document.getElementById('modal-peligro');
    const tituloElement = document.querySelector('#modal-peligro h3');
    const mensajeElement = document.getElementById('mensaje-peligro');
    const btnConfirmar = document.getElementById('btn-confirmar-peligro');
    
    if (modal && tituloElement && mensajeElement && btnConfirmar) {
        tituloElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${titulo}`;
        mensajeElement.textContent = mensaje;
        
        // Configurar evento del botón
        btnConfirmar.onclick = function() {
            callback();
            cerrarModal('modal-peligro');
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
    document.addEventListener('DOMContentLoaded', inicializarGestion);
} else {
    inicializarGestion();
}