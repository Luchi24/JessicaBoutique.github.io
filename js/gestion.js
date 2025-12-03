// Gestión - JavaScript específico
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión - Inicializando...');
    
    // Cargar configuración actual
    cargarConfiguracionActual();
    
    // Cargar catálogos
    cargarCatalogos();
    
    // Cargar información del sistema
    cargarInformacionSistema();
    
    // Configurar eventos
    configurarEventosGestion();
});

function cargarConfiguracionActual() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Tema del sistema
    const selectTema = document.getElementById('temaSistema');
    if (selectTema) {
        selectTema.value = config.tema || 'claro';
    }
    
    // Moneda
    const selectMoneda = document.getElementById('monedaSistema');
    if (selectMoneda) {
        selectMoneda.value = config.moneda || 'S/';
    }
    
    // Alerta de stock
    const inputAlerta = document.getElementById('alertaStock');
    if (inputAlerta) {
        inputAlerta.value = config.alertaStock || 5;
    }
    
    // Comisión tarjeta
    const inputComision = document.getElementById('comisionTarjeta');
    if (inputComision) {
        inputComision.value = (config.comisionTarjeta || 0.05) * 100;
    }
}

function cargarCatalogos() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Cargar categorías
    cargarLista('listaCategorias', config.categorias, 'categoria');
    
    // Cargar colores
    cargarLista('listaColores', config.colores, 'color');
    
    // Cargar tallas generales
    cargarLista('listaTallas', config.tallas, 'talla');
    
    // Cargar tallas de pantalón
    cargarLista('listaTallasPantalon', config.tallasPantalon, 'tallaPantalon');
}

function cargarLista(elementoId, items, tipo) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;
    
    elemento.innerHTML = '';
    
    if (!items || items.length === 0) {
        elemento.innerHTML = '<p class="lista-vacia">No hay elementos</p>';
        return;
    }
    
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-lista';
        itemDiv.innerHTML = `
            <span>${item}</span>
            <button class="btn btn-danger btn-sm btn-eliminar-item" data-tipo="${tipo}" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elemento.appendChild(itemDiv);
    });
    
    // Agregar eventos a los botones de eliminar
    elemento.querySelectorAll('.btn-eliminar-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.getAttribute('data-tipo');
            const index = parseInt(this.getAttribute('data-index'));
            eliminarItemCatalogo(tipo, index);
        });
    });
}

function cargarInformacionSistema() {
    // Estadísticas
    const productos = SistemaDatos.obtenerProductos();
    const ventas = SistemaDatos.obtenerVentas();
    const clientes = SistemaDatos.obtenerClientes();
    
    document.getElementById('infoProductos').textContent = productos.length;
    document.getElementById('infoVentas').textContent = ventas.length;
    document.getElementById('infoClientes').textContent = clientes.length;
    
    // Uso de almacenamiento
    const datos = localStorage.getItem('jessicaBoutique');
    const tamano = datos ? (new Blob([datos]).size / 1024).toFixed(2) : 0;
    document.getElementById('infoAlmacenamiento').textContent = `${tamano} KB`;
    
    // Información del navegador
    const navegador = detectarNavegador();
    document.getElementById('infoNavegador').textContent = navegador;
    
    // Último respaldo
    const ultimoRespaldo = localStorage.getItem('ultimoRespaldo');
    document.getElementById('ultimoRespaldo').textContent = ultimoRespaldo || 'Nunca';
    
    // Contadores para modal de restablecimiento
    document.getElementById('contadorProductosEliminar').textContent = productos.length;
    document.getElementById('contadorVentasEliminar').textContent = ventas.length;
    document.getElementById('contadorClientesEliminar').textContent = clientes.length;
}

function detectarNavegador() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        return 'Google Chrome';
    } else if (userAgent.includes('Firefox')) {
        return 'Mozilla Firefox';
    } else if (userAgent.includes('Edg')) {
        return 'Microsoft Edge';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return 'Safari';
    } else {
        return 'Desconocido';
    }
}

function configurarEventosGestion() {
    // Guardar configuración
    const btnGuardarConfig = document.getElementById('guardarConfiguracion');
    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', guardarConfiguracion);
    }
    
    // Agregar elementos a catálogos
    const btnAgregarCategoria = document.getElementById('agregarCategoria');
    const btnAgregarColor = document.getElementById('agregarColor');
    const btnAgregarTalla = document.getElementById('agregarTalla');
    const btnAgregarTallaPantalon = document.getElementById('agregarTallaPantalon');
    
    if (btnAgregarCategoria) {
        btnAgregarCategoria.addEventListener('click', function() {
            agregarItemCatalogo('categoria');
        });
    }
    
    if (btnAgregarColor) {
        btnAgregarColor.addEventListener('click', function() {
            agregarItemCatalogo('color');
        });
    }
    
    if (btnAgregarTalla) {
        btnAgregarTalla.addEventListener('click', function() {
            agregarItemCatalogo('talla');
        });
    }
    
    if (btnAgregarTallaPantalon) {
        btnAgregarTallaPantalon.addEventListener('click', function() {
            agregarItemCatalogo('tallaPantalon');
        });
    }
    
    // Gestión de datos
    const btnRespaldar = document.getElementById('respaldarDatos');
    const btnSeleccionarArchivo = document.getElementById('seleccionarArchivo');
    const inputRestaurar = document.getElementById('archivoRestaurar');
    const btnRestaurar = document.getElementById('restaurarDatos');
    const btnRestablecer = document.getElementById('restablecerSistema');
    
    if (btnRespaldar) {
        btnRespaldar.addEventListener('click', respaldarDatos);
    }
    
    if (btnSeleccionarArchivo && inputRestaurar) {
        btnSeleccionarArchivo.addEventListener('click', function() {
            inputRestaurar.click();
        });
        
        inputRestaurar.addEventListener('change', function() {
            if (this.files.length > 0) {
                btnRestaurar.disabled = false;
            }
        });
    }
    
    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', restaurarDatos);
    }
    
    if (btnRestablecer) {
        btnRestablecer.addEventListener('click', function() {
            mostrarModalRestablecer();
        });
    }
    
    // Modal de restablecimiento
    const modalRestablecer = document.getElementById('modalRestablecer');
    if (modalRestablecer) {
        const btnCerrar = modalRestablecer.querySelector('.btn-cerrar-modal');
        const btnCancelar = document.getElementById('cancelarRestablecer');
        const btnConfirmar = document.getElementById('confirmarRestablecer');
        const inputConfirmar = document.getElementById('confirmarTexto');
        
        if (btnCerrar) {
            btnCerrar.addEventListener('click', function() {
                modalRestablecer.style.display = 'none';
                inputConfirmar.value = '';
                btnConfirmar.disabled = true;
            });
        }
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                modalRestablecer.style.display = 'none';
                inputConfirmar.value = '';
                btnConfirmar.disabled = true;
            });
        }
        
        if (inputConfirmar) {
            inputConfirmar.addEventListener('input', function() {
                btnConfirmar.disabled = this.value !== 'ELIMINAR';
            });
        }
        
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', function() {
                if (inputConfirmar.value === 'ELIMINAR') {
                    restablecerSistema();
                    modalRestablecer.style.display = 'none';
                    inputConfirmar.value = '';
                    btnConfirmar.disabled = true;
                }
            });
        }
        
        // Cerrar al hacer clic fuera
        modalRestablecer.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                inputConfirmar.value = '';
                btnConfirmar.disabled = true;
            }
        });
    }
}

function guardarConfiguracion() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Obtener valores del formulario
    const tema = document.getElementById('temaSistema').value;
    const moneda = document.getElementById('monedaSistema').value;
    const alertaStock = parseInt(document.getElementById('alertaStock').value);
    const comisionTarjeta = parseFloat(document.getElementById('comisionTarjeta').value) / 100;
    
    // Validar
    if (alertaStock < 1) {
        alert('La alerta de stock debe ser al menos 1');
        return;
    }
    
    if (comisionTarjeta < 0 || comisionTarjeta > 1) {
        alert('La comisión por tarjeta debe estar entre 0% y 100%');
        return;
    }
    
    // Actualizar configuración
    config.tema = tema;
    config.moneda = moneda;
    config.alertaStock = alertaStock;
    config.comisionTarjeta = comisionTarjeta;
    
    // Guardar
    SistemaDatos.guardarConfiguracion(config);
    
    // Aplicar tema inmediatamente
    if (tema === 'oscuro') {
        document.body.classList.add('modo-oscuro');
    } else {
        document.body.classList.remove('modo-oscuro');
    }
    
    alert('Configuración guardada correctamente');
}

function agregarItemCatalogo(tipo) {
    let inputId = '';
    let listaId = '';
    let propiedadConfig = '';
    
    switch(tipo) {
        case 'categoria':
            inputId = 'nuevaCategoria';
            listaId = 'listaCategorias';
            propiedadConfig = 'categorias';
            break;
        case 'color':
            inputId = 'nuevoColor';
            listaId = 'listaColores';
            propiedadConfig = 'colores';
            break;
        case 'talla':
            inputId = 'nuevaTalla';
            listaId = 'listaTallas';
            propiedadConfig = 'tallas';
            break;
        case 'tallaPantalon':
            inputId = 'nuevaTallaPantalon';
            listaId = 'listaTallasPantalon';
            propiedadConfig = 'tallasPantalon';
            break;
    }
    
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const valor = input.value.trim();
    
    if (!valor) {
        alert('Por favor, ingresa un valor');
        return;
    }
    
    // Obtener configuración actual
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Verificar si ya existe
    if (config[propiedadConfig].includes(valor)) {
        alert('Este valor ya existe en el catálogo');
        return;
    }
    
    // Agregar al catálogo
    config[propiedadConfig].push(valor);
    
    // Guardar
    SistemaDatos.guardarConfiguracion(config);
    
    // Actualizar lista
    cargarLista(listaId, config[propiedadConfig], tipo);
    
    // Limpiar input
    input.value = '';
    
    alert('Elemento agregado correctamente');
}

function eliminarItemCatalogo(tipo, index) {
    let propiedadConfig = '';
    let mensaje = '';
    
    switch(tipo) {
        case 'categoria':
            propiedadConfig = 'categorias';
            mensaje = '¿Estás seguro de que quieres eliminar esta categoría?';
            break;
        case 'color':
            propiedadConfig = 'colores';
            mensaje = '¿Estás seguro de que quieres eliminar este color?';
            break;
        case 'talla':
            propiedadConfig = 'tallas';
            mensaje = '¿Estás seguro de que quieres eliminar esta talla?';
            break;
        case 'tallaPantalon':
            propiedadConfig = 'tallasPantalon';
            mensaje = '¿Estás seguro de que quieres eliminar esta talla de pantalón?';
            break;
    }
    
    if (!confirm(mensaje)) {
        return;
    }
    
    // Obtener configuración actual
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Eliminar elemento
    config[propiedadConfig].splice(index, 1);
    
    // Guardar
    SistemaDatos.guardarConfiguracion(config);
    
    // Recargar catálogos
    cargarCatalogos();
    
    alert('Elemento eliminado correctamente');
}

function respaldarDatos() {
    // Obtener todos los datos
    const datos = SistemaDatos.obtenerDatos();
    
    // Agregar metadata
    const respaldo = {
        ...datos,
        metadata: {
            fechaRespaldo: new Date().toISOString(),
            versionSistema: '1.0.0',
            totalProductos: datos.productos.length,
            totalVentas: datos.ventas.length,
            totalClientes: datos.clientes.length
        }
    };
    
    // Convertir a JSON
    const datosStr = JSON.stringify(respaldo, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Crear y descargar archivo
    const fecha = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo-jessica-boutique-${fecha}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Guardar fecha del último respaldo
    localStorage.setItem('ultimoRespaldo', new Date().toLocaleDateString('es-PE'));
    
    // Actualizar información
    cargarInformacionSistema();
    
    alert('Respaldo creado correctamente');
}

function restaurarDatos() {
    const input = document.getElementById('archivoRestaurar');
    
    if (!input.files || input.files.length === 0) {
        alert('Por favor, selecciona un archivo');
        return;
    }
    
    const archivo = input.files[0];
    
    if (!archivo.name.endsWith('.json')) {
        alert('El archivo debe ser un JSON válido');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres restaurar estos datos? Se sobrescribirán todos los datos actuales.')) {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Validar estructura básica
            if (!datos.productos || !datos.ventas || !datos.clientes || !datos.configuracion) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Restaurar datos
            localStorage.setItem('jessicaBoutique', JSON.stringify(datos));
            
            // Recargar página
            alert('Datos restaurados correctamente. La página se recargará.');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            alert('Error al restaurar datos: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        alert('Error al leer el archivo');
    };
    
    reader.readAsText(archivo);
}

function mostrarModalRestablecer() {
    const modal = document.getElementById('modalRestablecer');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function restablecerSistema() {
    if (!confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción eliminará TODOS los datos y no se puede deshacer.')) {
        return;
    }
    
    // Eliminar todos los datos
    localStorage.removeItem('jessicaBoutique');
    
    // Recargar página para inicializar datos por defecto
    alert('Sistema restablecido. La página se recargará.');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}