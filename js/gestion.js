let tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

function inicializarGestion() {
    cargarColores();
    cargarCategorias();
    cargarTallas();
    cargarConfiguracion();
    actualizarInformacionSistema();
    inicializarEventosGestion();
    rediseñarBackupSeccion();
}

function inicializarEventosGestion() {
    const radiosTema = document.querySelectorAll('input[name="tema"]');
    radiosTema.forEach(radio => {
        radio.addEventListener('change', function() {
            aplicarTema(this.value);
        });
    });
    
    const temaGuardado = localStorage.getItem('tema_jessica') || 'claro';
    const radioActual = document.querySelector(`input[name="tema"][value="${temaGuardado}"]`);
    if (radioActual) {
        radioActual.checked = true;
    }
    aplicarTema(temaGuardado);
}

function aplicarTema(tema) {
    document.body.setAttribute('data-tema', tema);
    localStorage.setItem('tema_jessica', tema);
    
    const root = document.documentElement;
    if (tema === 'oscuro') {
        root.style.setProperty('--blanco', '#1a1a1a');
        root.style.setProperty('--gris-claro', '#2d2d2d');
        root.style.setProperty('--gris-medio', '#404040');
        root.style.setProperty('--gris-oscuro', '#b3b3b3');
        root.style.setProperty('color', '#e6e6e6');
    } else {
        root.style.setProperty('--blanco', '#ffffff');
        root.style.setProperty('--gris-claro', '#fafafa');
        root.style.setProperty('--gris-medio', '#eeeeee');
        root.style.setProperty('--gris-oscuro', '#757575');
        root.style.setProperty('color', '#424242');
    }
}

function cargarColores() {
    const listaColores = document.getElementById('lista-colores');
    if (!listaColores) return;
    
    listaColores.innerHTML = '';
    
    datos.colores.forEach((color, index) => {
        let colorHex = '#757575';
        
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
    
    const enUso = datos.productos.some(producto => 
        producto.color.toLowerCase() === color.toLowerCase()
    );
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. El color está en uso por productos.', 'error');
        return;
    }
    
    mostrarConfirmacion(
        `¿Eliminar el color "${color}"?`,
        { peligroso: true }
    ).then(resultado => {
        if (resultado) {
            datos.colores.splice(index, 1);
            guardarDatos();
            cargarColores();
            mostrarNotificacion('Color eliminado', 'exito');
        }
    });
}

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
        const nuevoLower = nuevoNombre.trim().toLowerCase();
        const existe = datos.categorias.some((cat, i) => 
            i !== index && cat.toLowerCase() === nuevoLower
        );
        
        if (existe) {
            mostrarNotificacion('Esta categoría ya existe', 'error');
            return;
        }
        
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
    
    const enUso = datos.productos.some(producto => producto.categoria === categoria);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. La categoría está en uso por productos.', 'error');
        return;
    }
    
    mostrarConfirmacion(
        `¿Eliminar la categoría "${categoria}"?`,
        { peligroso: true }
    ).then(resultado => {
        if (resultado) {
            datos.categorias.splice(index, 1);
            guardarDatos();
            cargarCategorias();
            mostrarNotificacion('Categoría eliminada', 'exito');
        }
    });
}

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
        
        const existe = tallasDisponibles.some((talla, i) => 
            i !== index && talla === nuevaTalla
        );
        
        if (existe) {
            mostrarNotificacion('Esta talla ya existe', 'error');
            return;
        }
        
        datos.productos.forEach(producto => {
            if (producto.talla === tallaActual) {
                producto.talla = nuevaTalla;
            }
        });
        
        tallasDisponibles[index] = nuevaTalla;
        guardarTallas();
        cargarTallas();
        guardarDatos();
        mostrarNotificacion('Talla actualizada', 'exito');
    }
}

function eliminarTalla(index) {
    const talla = tallasDisponibles[index];
    
    const enUso = datos.productos.some(producto => producto.talla === talla);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. La talla está en uso por productos.', 'error');
        return;
    }
    
    mostrarConfirmacion(
        `¿Eliminar la talla "${talla}"?`,
        { peligroso: true }
    ).then(resultado => {
        if (resultado) {
            tallasDisponibles.splice(index, 1);
            guardarTallas();
            cargarTallas();
            mostrarNotificacion('Talla eliminada', 'exito');
        }
    });
}

function guardarTallas() {
    localStorage.setItem('tallas_jessica', JSON.stringify(tallasDisponibles));
}

function cargarConfiguracion() {
    const tallasGuardadas = localStorage.getItem('tallas_jessica');
    if (tallasGuardadas) {
        tallasDisponibles = JSON.parse(tallasGuardadas);
    }
    
    const tasaIGVGuardada = localStorage.getItem('tasa_igv_jessica');
    if (tasaIGVGuardada) {
        datos.config.tasaIGV = parseFloat(tasaIGVGuardada) / 100;
    }
    
    const alertaStockGuardada = localStorage.getItem('alerta_stock_jessica');
    if (alertaStockGuardada) {
        datos.config.alertaStock = parseInt(alertaStockGuardada);
    }
    
    const temaGuardado = localStorage.getItem('tema_jessica');
    if (temaGuardado) {
        document.body.setAttribute('data-tema', temaGuardado);
        const radioTema = document.querySelector(`input[name="tema"][value="${temaGuardado}"]`);
        if (radioTema) {
            radioTema.checked = true;
        }
    }
    
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
    const tasaIGVInput = document.getElementById('tasa-igv');
    if (tasaIGVInput) {
        const tasa = parseFloat(tasaIGVInput.value) / 100;
        datos.config.tasaIGV = tasa;
        localStorage.setItem('tasa_igv_jessica', (tasa * 100).toFixed(1));
    }
    
    const alertaStockInput = document.getElementById('alertas-stock');
    if (alertaStockInput) {
        const alerta = parseInt(alertaStockInput.value);
        datos.config.alertaStock = alerta;
        localStorage.setItem('alerta_stock_jessica', alerta);
    }
    
    const temaSeleccionado = document.querySelector('input[name="tema"]:checked');
    if (temaSeleccionado) {
        document.body.setAttribute('data-tema', temaSeleccionado.value);
        localStorage.setItem('tema_jessica', temaSeleccionado.value);
    }
    
    mostrarNotificacion('Configuración actualizada', 'exito');
}

function exportarDatosCompleto() {
    const datosExportar = {
        productos: datos.productos,
        colores: datos.colores,
        categorias: datos.categorias,
        ventas: datos.ventas,
        tallasDisponibles: tallasDisponibles,
        config: datos.config,
        fechaExportacion: new Date().toISOString(),
        version: '2.0',
        sistema: 'Jessica Boutique'
    };
    
    exportarJSON(datosExportar, 'backup-completo-jessica-boutique');
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
    
    mostrarConfirmacion(
        '¿Importar backup?',
        'Se sobreescribirán TODOS los datos actuales (productos, ventas, categorías, colores, configuraciones).',
        {
            peligroso: true,
            textoConfirmar: 'Importar Todo'
        }
    ).then(resultado => {
        if (resultado) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.productos || !importedData.ventas) {
                        mostrarNotificacion('Archivo de backup inválido', 'error');
                        return;
                    }
                    
                    datos.productos = importedData.productos || [];
                    datos.colores = importedData.colores || datos.colores;
                    datos.categorias = importedData.categorias || datos.categorias;
                    datos.ventas = importedData.ventas || [];
                    datos.config = importedData.config || datos.config;
                    
                    if (importedData.tallasDisponibles) {
                        tallasDisponibles = importedData.tallasDisponibles;
                    }
                    
                    guardarDatos();
                    guardarTallas();
                    
                    cargarColores();
                    cargarCategorias();
                    cargarTallas();
                    actualizarInformacionSistema();
                    
                    mostrarNotificacion('Backup importado correctamente. Todos los datos han sido restaurados.', 'exito');
                    
                    event.target.value = '';
                    
                } catch (error) {
                    mostrarNotificacion('Error al importar el backup', 'error');
                }
            };
            
            reader.readAsText(file);
        }
    });
}

function rediseñarBackupSeccion() {
    const backupCard = document.querySelector('.backup-card');
    if (backupCard) {
        backupCard.innerHTML = `
            <h4><i class="fas fa-database"></i> Respaldo de Datos</h4>
            <p>Exporta o importa TODOS los datos del sistema</p>
            
            <div class="acciones-backup-simple">
                <button class="btn-principal" onclick="exportarDatosCompleto()">
                    <i class="fas fa-download"></i> Exportar Todo
                </button>
                <div class="importar-container">
                    <input type="file" id="importar-backup-file-real" 
                           accept=".json" style="display: none;">
                    <button class="btn-secundario" onclick="document.getElementById('importar-backup-file-real').click()">
                        <i class="fas fa-upload"></i> Importar Backup
                    </button>
                </div>
                <button class="btn-secundario peligro" onclick="mostrarOpcionesLimpiar()">
                    <i class="fas fa-trash-alt"></i> Limpiar Datos
                </button>
            </div>
            
            <div class="info-backup-simple">
                <p><i class="fas fa-info-circle"></i> Exporta todos los datos (productos, ventas, categorías, colores) en un archivo JSON</p>
            </div>
        `;
        
        const inputFile = document.getElementById('importar-backup-file-real');
        if (inputFile) {
            inputFile.addEventListener('change', importarBackup);
        }
    }
}

function mostrarOpcionesLimpiar() {
    mostrarConfirmacion(
        '¿Qué deseas hacer?',
        {
            titulo: 'Opciones de limpieza',
            textoCancelar: 'Cancelar',
            customButtons: [
                {
                    text: 'Limpiar Ventas Antiguas',
                    class: 'btn-secundario',
                    action: limpiarVentasAntiguas
                },
                {
                    text: 'Restablecer Todo',
                    class: 'btn-principal peligro',
                    action: restablecerSistema
                }
            ]
        }
    );
}

function limpiarVentasAntiguas() {
    mostrarConfirmacion(
        '¿Eliminar ventas de hace más de 1 año? Esta acción no se puede deshacer.',
        {
            peligroso: true,
            textoConfirmar: 'Eliminar Ventas Antiguas'
        }
    ).then(resultado => {
        if (resultado) {
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
    });
}

function restablecerSistema() {
    mostrarConfirmacion(
        '¿Estás seguro de restablecer el sistema? Se eliminarán todos los datos excepto configuraciones. Esta acción no se puede deshacer.',
        {
            peligroso: true,
            textoConfirmar: 'Restablecer Todo'
        }
    ).then(resultado => {
        if (resultado) {
            const configGuardada = {
                tasaIGV: datos.config.tasaIGV,
                alertaStock: datos.config.alertaStock || 5
            };
            
            datos.productos = [];
            datos.ventas = [];
            datos.config.ultimoIdVenta = 0;
            datos.config = { ...datos.config, ...configGuardada };
            
            guardarDatos();
            
            cargarColores();
            cargarCategorias();
            cargarTallas();
            actualizarInformacionSistema();
            
            mostrarNotificacion('Sistema restablecido correctamente', 'exito');
        }
    });
}

function actualizarInformacionSistema() {
    const totalProductosElement = document.getElementById('info-total-productos');
    if (totalProductosElement) {
        totalProductosElement.textContent = datos.productos.length;
    }
    
    const totalVentasElement = document.getElementById('info-total-ventas');
    if (totalVentasElement) {
        totalVentasElement.textContent = datos.ventas.length;
    }
    
    const totalClientesElement = document.getElementById('info-total-clientes');
    if (totalClientesElement) {
        const clientesUnicos = new Set(datos.ventas.map(v => v.cliente.nombre)).size;
        totalClientesElement.textContent = clientesUnicos;
    }
    
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
    
    const tamanoDatosElement = document.getElementById('info-tamano-datos');
    if (tamanoDatosElement) {
        const datosString = JSON.stringify(datos);
        const tamañoBytes = new Blob([datosString]).size;
        const tamañoKB = (tamañoBytes / 1024).toFixed(2);
        tamanoDatosElement.textContent = `${tamañoKB} KB`;
    }
}