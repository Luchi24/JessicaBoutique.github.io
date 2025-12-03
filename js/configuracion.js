// Configuración del sistema para Jessica Boutique
const Configuracion = (function() {
    // Variables globales del módulo
    let configuracion = null;

    // Inicializar módulo
    function inicializar() {
        if (document.getElementById('configuracion-container')) {
            cargarConfiguracion();
            configurarEventos();
            cargarListasConfiguracion();
        }
    }

    // Cargar configuración actual
    function cargarConfiguracion() {
        configuracion = SistemaDatos.obtenerConfiguracion();
    }

    // Configurar eventos
    function configurarEventos() {
        // Guardar configuración
        document.getElementById('btn-guardar-config')?.addEventListener('click', guardarConfiguracion);
        
        // Gestión de categorías
        document.getElementById('btn-agregar-categoria')?.addEventListener('click', agregarCategoria);
        document.getElementById('input-nueva-categoria')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarCategoria();
        });
        
        // Gestión de colores
        document.getElementById('btn-agregar-color')?.addEventListener('click', agregarColor);
        document.getElementById('input-nuevo-color')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarColor();
        });
        
        // Gestión de tallas
        document.getElementById('btn-agregar-talla')?.addEventListener('click', agregarTalla);
        document.getElementById('input-nueva-talla')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarTalla();
        });
        
        // Gestión de tallas de pantalón
        document.getElementById('btn-agregar-talla-pantalon')?.addEventListener('click', agregarTallaPantalon);
        document.getElementById('input-nueva-talla-pantalon')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarTallaPantalon();
        });
        
        // Exportar/importar datos
        document.getElementById('btn-exportar-datos')?.addEventListener('click', exportarDatos);
        document.getElementById('btn-importar-datos')?.addEventListener('click', () => {
            document.getElementById('input-importar-datos').click();
        });
        document.getElementById('input-importar-datos')?.addEventListener('change', importarDatos);
        
        // Restablecer datos
        document.getElementById('btn-restablecer-datos')?.addEventListener('click', restablecerDatos);
    }

    // Cargar listas de configuración en la interfaz
    function cargarListasConfiguracion() {
        cargarListaCategorias();
        cargarListaColores();
        cargarListaTallas();
        cargarListaTallasPantalon();
        
        // Cargar valores actuales en los formularios
        document.getElementById('select-tema').value = configuracion.tema;
        document.getElementById('input-alerta-stock').value = configuracion.alertaStock;
        document.getElementById('input-comision-tarjeta').value = configuracion.comisionTarjeta * 100;
        document.getElementById('select-moneda').value = configuracion.moneda;
    }

    // Cargar lista de categorías
    function cargarListaCategorias() {
        const lista = document.getElementById('lista-categorias');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (configuracion.categorias.length === 0) {
            lista.innerHTML = '<li class="list-group-item">No hay categorías</li>';
            return;
        }
        
        configuracion.categorias.forEach((categoria, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${categoria}
                <button class="btn btn-danger btn-sm btn-eliminar-categoria" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            lista.appendChild(li);
        });
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.btn-eliminar-categoria').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                eliminarCategoria(index);
            });
        });
    }

    // Cargar lista de colores
    function cargarListaColores() {
        const lista = document.getElementById('lista-colores');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (configuracion.colores.length === 0) {
            lista.innerHTML = '<li class="list-group-item">No hay colores</li>';
            return;
        }
        
        configuracion.colores.forEach((color, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>
                    <span class="color-preview" style="background-color: ${obtenerColorHex(color)}; width: 20px; height: 20px; display: inline-block; margin-right: 10px; border-radius: 3px;"></span>
                    ${color}
                </span>
                <button class="btn btn-danger btn-sm btn-eliminar-color" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            lista.appendChild(li);
        });
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.btn-eliminar-color').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                eliminarColor(index);
            });
        });
    }

    // Obtener color HEX basado en nombre
    function obtenerColorHex(nombreColor) {
        const colores = {
            'Rosado': '#ff66b2',
            'Morado': '#9c27b0',
            'Lila': '#c8a2c8',
            'Negro': '#222222',
            'Blanco': '#ffffff',
            'Azul': '#2196f3',
            'Rojo': '#f44336',
            'Verde': '#4caf50',
            'Amarillo': '#ffeb3b',
            'Naranja': '#ff9800'
        };
        return colores[nombreColor] || '#cccccc';
    }

    // Cargar lista de tallas
    function cargarListaTallas() {
        const lista = document.getElementById('lista-tallas');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (configuracion.tallas.length === 0) {
            lista.innerHTML = '<li class="list-group-item">No hay tallas</li>';
            return;
        }
        
        configuracion.tallas.forEach((talla, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${talla}
                <button class="btn btn-danger btn-sm btn-eliminar-talla" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            lista.appendChild(li);
        });
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.btn-eliminar-talla').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                eliminarTalla(index);
            });
        });
    }

    // Cargar lista de tallas de pantalón
    function cargarListaTallasPantalon() {
        const lista = document.getElementById('lista-tallas-pantalon');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (configuracion.tallasPantalon.length === 0) {
            lista.innerHTML = '<li class="list-group-item">No hay tallas de pantalón</li>';
            return;
        }
        
        configuracion.tallasPantalon.forEach((talla, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${talla}
                <button class="btn btn-danger btn-sm btn-eliminar-talla-pantalon" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            lista.appendChild(li);
        });
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.btn-eliminar-talla-pantalon').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                eliminarTallaPantalon(index);
            });
        });
    }

    // Guardar configuración
    function guardarConfiguracion() {
        // Obtener valores del formulario
        configuracion.tema = document.getElementById('select-tema').value;
        configuracion.alertaStock = parseInt(document.getElementById('input-alerta-stock').value) || 5;
        configuracion.comisionTarjeta = (parseFloat(document.getElementById('input-comision-tarjeta').value) || 5) / 100;
        configuracion.moneda = document.getElementById('select-moneda').value;
        
        // Guardar configuración
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Aplicar cambios inmediatos
        if (configuracion.tema === 'oscuro') {
            document.body.classList.add('modo-oscuro');
        } else {
            document.body.classList.remove('modo-oscuro');
        }
        
        Sistema.mostrarMensaje('success', 'Configuración guardada correctamente');
    }

    // Agregar categoría
    function agregarCategoria() {
        const input = document.getElementById('input-nueva-categoria');
        const nombre = input.value.trim();
        
        if (!nombre) {
            Sistema.mostrarMensaje('error', 'Ingresa un nombre para la categoría');
            return;
        }
        
        if (configuracion.categorias.includes(nombre)) {
            Sistema.mostrarMensaje('error', 'Esta categoría ya existe');
            return;
        }
        
        configuracion.categorias.push(nombre);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaCategorias();
        input.value = '';
        
        Sistema.mostrarMensaje('success', `Categoría "${nombre}" agregada`);
    }

    // Eliminar categoría
    function eliminarCategoria(index) {
        const categoria = configuracion.categorias[index];
        
        if (!confirm(`¿Eliminar la categoría "${categoria}"?`)) {
            return;
        }
        
        configuracion.categorias.splice(index, 1);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaCategorias();
        
        Sistema.mostrarMensaje('success', `Categoría "${categoria}" eliminada`);
    }

    // Agregar color
    function agregarColor() {
        const input = document.getElementById('input-nuevo-color');
        const nombre = input.value.trim();
        
        if (!nombre) {
            Sistema.mostrarMensaje('error', 'Ingresa un nombre para el color');
            return;
        }
        
        if (configuracion.colores.includes(nombre)) {
            Sistema.mostrarMensaje('error', 'Este color ya existe');
            return;
        }
        
        configuracion.colores.push(nombre);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaColores();
        input.value = '';
        
        Sistema.mostrarMensaje('success', `Color "${nombre}" agregado`);
    }

    // Eliminar color
    function eliminarColor(index) {
        const color = configuracion.colores[index];
        
        if (!confirm(`¿Eliminar el color "${color}"?`)) {
            return;
        }
        
        configuracion.colores.splice(index, 1);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaColores();
        
        Sistema.mostrarMensaje('success', `Color "${color}" eliminado`);
    }

    // Agregar talla
    function agregarTalla() {
        const input = document.getElementById('input-nueva-talla');
        const nombre = input.value.trim().toUpperCase();
        
        if (!nombre) {
            Sistema.mostrarMensaje('error', 'Ingresa una talla');
            return;
        }
        
        if (configuracion.tallas.includes(nombre)) {
            Sistema.mostrarMensaje('error', 'Esta talla ya existe');
            return;
        }
        
        configuracion.tallas.push(nombre);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaTallas();
        input.value = '';
        
        Sistema.mostrarMensaje('success', `Talla "${nombre}" agregada`);
    }

    // Eliminar talla
    function eliminarTalla(index) {
        const talla = configuracion.tallas[index];
        
        if (!confirm(`¿Eliminar la talla "${talla}"?`)) {
            return;
        }
        
        configuracion.tallas.splice(index, 1);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaTallas();
        
        Sistema.mostrarMensaje('success', `Talla "${talla}" eliminada`);
    }

    // Agregar talla de pantalón
    function agregarTallaPantalon() {
        const input = document.getElementById('input-nueva-talla-pantalon');
        const nombre = input.value.trim();
        
        if (!nombre) {
            Sistema.mostrarMensaje('error', 'Ingresa una talla de pantalón');
            return;
        }
        
        if (configuracion.tallasPantalon.includes(nombre)) {
            Sistema.mostrarMensaje('error', 'Esta talla de pantalón ya existe');
            return;
        }
        
        configuracion.tallasPantalon.push(nombre);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaTallasPantalon();
        input.value = '';
        
        Sistema.mostrarMensaje('success', `Talla de pantalón "${nombre}" agregada`);
    }

    // Eliminar talla de pantalón
    function eliminarTallaPantalon(index) {
        const talla = configuracion.tallasPantalon[index];
        
        if (!confirm(`¿Eliminar la talla de pantalón "${talla}"?`)) {
            return;
        }
        
        configuracion.tallasPantalon.splice(index, 1);
        SistemaDatos.guardarConfiguracion(configuracion);
        
        // Actualizar interfaz
        cargarListaTallasPantalon();
        
        Sistema.mostrarMensaje('success', `Talla de pantalón "${talla}" eliminada`);
    }

    // Exportar datos
    function exportarDatos() {
        Sistema.exportarDatosSistema();
    }

    // Importar datos
    async function importarDatos(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;
        
        if (!confirm('¿Importar datos? Se sobrescribirán todos los datos actuales.')) {
            event.target.value = '';
            return;
        }
        
        const resultado = await Sistema.importarDatosSistema(archivo);
        if (resultado) {
            // Recargar configuración
            cargarConfiguracion();
            cargarListasConfiguracion();
        }
        
        event.target.value = '';
    }

    // Restablecer datos a valores de ejemplo
    function restablecerDatos() {
        if (!confirm('¿Restablecer todos los datos a valores de ejemplo? Se perderán todos los datos actuales.')) {
            return;
        }
        
        SistemaDatos.restablecerDatosEjemplo();
        Sistema.mostrarMensaje('success', 'Datos restablecidos correctamente');
        
        // Recargar la página después de 1.5 segundos
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializar);

    // API pública
    return {
        guardarConfiguracion,
        agregarCategoria,
        eliminarCategoria,
        agregarColor,
        eliminarColor,
        agregarTalla,
        eliminarTalla,
        agregarTallaPantalon,
        eliminarTallaPantalon,
        exportarDatos,
        importarDatos,
        restablecerDatos
    };
})();