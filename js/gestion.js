function inicializarGestion() {
    cargarCategorias();
    cargarColores();
    cargarAjustes();
    actualizarInformacion();
    
    document.getElementById('importar-archivo').addEventListener('change', importarDatos);
}

function cargarCategorias() {
    const container = document.getElementById('lista-categorias');
    if (!container) return;
    
    container.innerHTML = '';
    
    datos.categorias.forEach((categoria, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.8rem';
        div.style.borderBottom = '1px solid #eee';
        
        div.innerHTML = `
            <span>${categoria}</span>
            <button onclick="eliminarCategoria(${index})" 
                    style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(div);
    });
}

function cargarColores() {
    const container = document.getElementById('lista-colores');
    if (!container) return;
    
    container.innerHTML = '';
    
    datos.colores.forEach((color, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.8rem';
        div.style.borderBottom = '1px solid #eee';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <div style="width: 20px; height: 20px; border-radius: 50%; background: ${obtenerColorHex(color)}; border: 1px solid #ddd;"></div>
                <span>${color}</span>
            </div>
            <button onclick="eliminarColor(${index})" 
                    style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(div);
    });
}

function obtenerColorHex(nombre) {
    const colores = {
        'rojo': '#f44336',
        'azul': '#2196f3',
        'verde': '#4caf50',
        'negro': '#000000',
        'blanco': '#ffffff',
        'rosa': '#e91e63',
        'morado': '#9c27b0',
        'amarillo': '#ffeb3b',
        'naranja': '#ff9800',
        'gris': '#9e9e9e'
    };
    
    const nombreLower = nombre.toLowerCase();
    for (const [key, hex] of Object.entries(colores)) {
        if (nombreLower.includes(key)) {
            return hex;
        }
    }
    
    return '#757575';
}

function cargarAjustes() {
    document.getElementById('tasa-igv').value = (datos.config.tasaIGV * 100).toFixed(1);
    document.getElementById('alerta-stock').value = datos.config.alertaStock || 3;
}

function guardarAjustes() {
    const tasaIGV = parseFloat(document.getElementById('tasa-igv').value) / 100;
    const alertaStock = parseInt(document.getElementById('alerta-stock').value);
    
    datos.config.tasaIGV = tasaIGV;
    datos.config.alertaStock = alertaStock;
    
    guardarDatos();
    mostrarNotificacion('Ajustes guardados', 'exito');
}

async function agregarCategoria() {
    const input = document.getElementById('nueva-categoria');
    const nuevaCategoria = input.value.trim();
    
    if (!nuevaCategoria) {
        mostrarNotificacion('Escribe una categoría', 'error');
        return;
    }
    
    if (datos.categorias.includes(nuevaCategoria)) {
        mostrarNotificacion('Esta categoría ya existe', 'error');
        return;
    }
    
    datos.categorias.push(nuevaCategoria);
    guardarDatos();
    cargarCategorias();
    
    input.value = '';
    mostrarNotificacion('Categoría agregada', 'exito');
}

async function eliminarCategoria(index) {
    const categoria = datos.categorias[index];
    
    const enUso = datos.productos.some(p => p.categoria === categoria);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. Hay productos usando esta categoría.', 'error');
        return;
    }
    
    const confirmado = await mostrarConfirmacion(`¿Eliminar la categoría "${categoria}"?`);
    if (!confirmado) return;
    
    datos.categorias.splice(index, 1);
    guardarDatos();
    cargarCategorias();
    mostrarNotificacion('Categoría eliminada', 'exito');
}

async function agregarColor() {
    const input = document.getElementById('nuevo-color');
    const nuevoColor = input.value.trim();
    
    if (!nuevoColor) {
        mostrarNotificacion('Escribe un color', 'error');
        return;
    }
    
    if (datos.colores.includes(nuevoColor)) {
        mostrarNotificacion('Este color ya existe', 'error');
        return;
    }
    
    datos.colores.push(nuevoColor);
    guardarDatos();
    cargarColores();
    
    input.value = '';
    mostrarNotificacion('Color agregado', 'exito');
}

async function eliminarColor(index) {
    const color = datos.colores[index];
    
    const enUso = datos.productos.some(p => p.color === color);
    
    if (enUso) {
        mostrarNotificacion('No se puede eliminar. Hay productos usando este color.', 'error');
        return;
    }
    
    const confirmado = await mostrarConfirmacion(`¿Eliminar el color "${color}"?`);
    if (!confirmado) return;
    
    datos.colores.splice(index, 1);
    guardarDatos();
    cargarColores();
    mostrarNotificacion('Color eliminado', 'exito');
}

function exportarDatos() {
    const datosExportar = {
        productos: datos.productos,
        categorias: datos.categorias,
        colores: datos.colores,
        ventas: datos.ventas,
        config: datos.config,
        fechaExportacion: new Date().toISOString()
    };
    
    const datosStr = JSON.stringify(datosExportar, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-jessica-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    mostrarNotificacion('Datos exportados', 'exito');
}

async function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const confirmado = await mostrarConfirmacion(
        '¿Importar datos? Esto reemplazará TODOS los datos actuales.'
    );
    
    if (!confirmado) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datosImportados = JSON.parse(e.target.result);
            
            datos.productos = datosImportados.productos || [];
            datos.categorias = datosImportados.categorias || datos.categorias;
            datos.colores = datosImportados.colores || datos.colores;
            datos.ventas = datosImportados.ventas || [];
            datos.config = datosImportados.config || datos.config;
            
            guardarDatos();
            
            cargarCategorias();
            cargarColores();
            actualizarInformacion();
            
            event.target.value = '';
            mostrarNotificacion('Datos importados correctamente', 'exito');
            
        } catch (error) {
            mostrarNotificacion('Error al importar los datos', 'error');
        }
    };
    
    reader.readAsText(file);
}

function actualizarInformacion() {
    document.getElementById('info-productos').textContent = datos.productos.length;
    document.getElementById('info-ventas').textContent = datos.ventas.length;
}