// Gestión del Sistema - Jessica Boutique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Módulo de Gestión cargado');
    
    // Inicializar gestión
    inicializarGestion();
    
    // Configurar eventos
    configurarEventosGestion();
});

// Inicializar gestión
function inicializarGestion() {
    // Cargar configuración actual
    cargarConfiguracionActual();
    
    // Cargar catálogos
    cargarCatalogos();
    
    // Cargar información del sistema
    cargarInformacionSistema();
    
    // Actualizar información de respaldos
    actualizarInfoRespaldo();
}

// Cargar configuración actual
function cargarConfiguracionActual() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Tema
    document.getElementById('temaSistema').value = config.tema || 'claro';
    
    // Moneda
    document.getElementById('monedaSistema').value = config.moneda || 'S/';
    
    // Alerta de stock
    document.getElementById('alertaStock').value = config.alertaStock || 5;
    
    // Comisión tarjeta
    document.getElementById('comisionTarjeta').value = config.comisionTarjeta || 5;
}

// Guardar configuración
function guardarConfiguracion() {
    const config = {
        tema: document.getElementById('temaSistema').value,
        moneda: document.getElementById('monedaSistema').value,
        alertaStock: parseInt(document.getElementById('alertaStock').value) || 5,
        comisionTarjeta: parseFloat(document.getElementById('comisionTarjeta').value) || 5
    };
    
    // Validar
    if (config.alertaStock < 1) {
        mostrarMensaje('error', 'La alerta de stock debe ser al menos 1');
        return false;
    }
    
    if (config.comisionTarjeta < 0 || config.comisionTarjeta > 100) {
        mostrarMensaje('error', 'La comisión por tarjeta debe estar entre 0 y 100%');
        return false;
    }
    
    // Guardar
    SistemaDatos.guardarConfiguracion(config);
    mostrarMensaje('success', 'Configuración guardada correctamente');
    
    // Aplicar tema inmediatamente
    if (window.Sistema && Sistema.cambiarTema) {
        Sistema.cambiarTema();
    }
    
    return true;
}

// Cargar catálogos
function cargarCatalogos() {
    const config = SistemaDatos.obtenerConfiguracion();
    
    // Cargar categorías
    cargarListaCatalogo('listaCategorias', config.categorias, 'categoria');
    
    // Cargar colores
    cargarListaCatalogo('listaColores', config.colores, 'color');
    
    // Cargar tallas
    cargarListaCatalogo('listaTallas', config.tallas, 'talla');
    
    // Cargar tallas de pantalón
    cargarListaCatalogo('listaTallasPantalon', config.tallasPantalon, 'tallaPantalon');
}

// Cargar lista de catálogo
function cargarListaCatalogo(elementoId, items, tipo) {
    const contenedor = document.getElementById(elementoId);
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (!items || items.length === 0) {
        contenedor.innerHTML = '<div class="catalogo-vacio">No hay elementos</div>';
        return;
    }
    
    items.forEach((item, index) => {
        const elemento = document.createElement('div');
        elemento.className = 'item-catalogo';
        elemento.innerHTML = `
            <span>${item}</span>
            <button class="btn btn-sm btn-danger eliminar-item" data-tipo="${tipo}" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        contenedor.appendChild(elemento);
    });
    
    // Agregar eventos a botones de eliminar
    contenedor.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.getAttribute('data-tipo');
            const index = parseInt(this.getAttribute('data-index'));
            eliminarItemCatalogo(tipo, index);
        });
    });
}

// Agregar item a catálogo
function agregarItemCatalogo(tipo, valor) {
    if (!valor || valor.trim() === '') {
        mostrarMensaje('error', 'El valor no puede estar vacío');
        return false;
    }
    
    const config = SistemaDatos.obtenerConfiguracion();
    valor = valor.trim();
    
    // Verificar si ya existe
    let existe = false;
    switch(tipo) {
        case 'categoria':
            existe = config.categorias.includes(valor);
            if (!existe) config.categorias.push(valor);
            break;
        case 'color':
            existe = config.colores.includes(valor);
            if (!existe) config.colores.push(valor);
            break;
        case 'talla':
            existe = config.tallas.includes(valor);
            if (!existe) config.tallas.push(valor);
            break;
        case 'tallaPantalon':
            existe = config.tallasPantalon.includes(valor);
            if (!existe) config.tallasPantalon.push(valor);
            break;
    }
    
    if (existe) {
        mostrarMensaje('error', 'Este elemento ya existe en el catálogo');
        return false;
    }
    
    // Guardar y actualizar
    SistemaDatos.guardarConfiguracion(config);
    cargarCatalogos();
    
    // Limpiar campo
    document.getElementById(`nueva${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).value = '';
    
    mostrarMensaje('success', 'Elemento agregado al catálogo');
    return true;
}

// Eliminar item de catálogo
function eliminarItemCatalogo(tipo, index) {
    const config = SistemaDatos.obtenerConfiguracion();
    
    switch(tipo) {
        case 'categoria':
            if (config.categorias.length <= 1) {
                mostrarMensaje('error', 'Debe haber al menos una categoría');
                return false;
            }
            config.categorias.splice(index, 1);
            break;
        case 'color':
            if (config.colores.length <= 1) {
                mostrarMensaje('error', 'Debe haber al menos un color');
                return false;
            }
            config.colores.splice(index, 1);
            break;
        case 'talla':
            if (config.tallas.length <= 1) {
                mostrarMensaje('error', 'Debe haber al menos una talla');
                return false;
            }
            config.tallas.splice(index, 1);
            break;
        case 'tallaPantalon':
            if (config.tallasPantalon.length <= 1) {
                mostrarMensaje('error', 'Debe haber al menos una talla de pantalón');
                return false;
            }
            config.tallasPantalon.splice(index, 1);
            break;
    }
    
    SistemaDatos.guardarConfiguracion(config);
    cargarCatalogos();
    mostrarMensaje('success', 'Elemento eliminado del catálogo');
    return true;
}

// Respaldar datos
function respaldarDatos() {
    try {
        mostrarMensaje('info', 'Generando respaldo...');
        
        // Usar función de exportación del sistema de datos
        if (SistemaDatos.exportarDatos) {
            SistemaDatos.exportarDatos();
            actualizarInfoRespaldo();
            mostrarMensaje('success', 'Respaldo generado correctamente');
        } else {
            throw new Error('Función de exportación no disponible');
        }
    } catch (error) {
        console.error('Error al respaldar:', error);
        mostrarMensaje('error', 'Error al generar respaldo');
    }
}

// Restaurar datos
function restaurarDatos(archivo) {
    if (!archivo) {
        mostrarMensaje('error', 'No se seleccionó archivo');
        return false;
    }
    
    if (archivo.type !== 'application/json') {
        mostrarMensaje('error', 'El archivo debe ser JSON');
        return false;
    }
    
    if (!confirm('¿Estás seguro de restaurar desde este archivo? Se sobrescribirán los datos actuales.')) {
        return false;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Validar estructura básica
            if (!datos.productos || !datos.configuracion) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Guardar datos
            localStorage.setItem('jessicaBoutique', JSON.stringify(datos));
            
            mostrarMensaje('success', 'Datos restaurados correctamente. Recargando...');
            
            // Recargar página después de 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error al restaurar:', error);
            mostrarMensaje('error', `Error al restaurar: ${error.message}`);
        }
    };
    
    reader.onerror = function() {
        mostrarMensaje('error', 'Error al leer el archivo');
    };
    
    reader.readAsText(archivo);
}

// Restablecer sistema
function restablecerSistema() {
    const texto = document.getElementById('confirmarTexto').value;
    
    if (texto !== 'ELIMINAR') {
        mostrarMensaje('error', 'Debes escribir "ELIMINAR" para confirmar');
        return false;
    }
    
    if (!confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción eliminará TODOS los datos permanentemente.')) {
        return false;
    }
    
    try {
        // Eliminar todos los datos
        localStorage.removeItem('jessicaBoutique');
        
        mostrarMensaje('success', 'Sistema restablecido. Recargando...');
        
        // Recargar página después de 2 segundos
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Error al restablecer:', error);
        mostrarMensaje('error', 'Error al restablecer el sistema');
        return false;
    }
}

// Cargar información del sistema
function cargarInformacionSistema() {
    const datos = SistemaDatos.obtenerDatos();
    
    // Productos
    document.getElementById('infoProductos').textContent = datos.productos?.length || 0;
    
    // Ventas
    document.getElementById('infoVentas').textContent = datos.ventas?.length || 0;
    
    // Clientes
    document.getElementById('infoClientes').textContent = datos.clientes?.length || 0;
    
    // Almacenamiento
    const almacenamiento = JSON.stringify(datos).length;
    document.getElementById('infoAlmacenamiento').textContent = `${(almacenamiento / 1024).toFixed(2)} KB`;
    
    // Navegador
    document.getElementById('infoNavegador').textContent = detectarNavegador();
    
    // Para el modal de restablecimiento
    document.getElementById('contadorProductosEliminar').textContent = datos.productos?.length || 0;
    document.getElementById('contadorVentasEliminar').textContent = datos.ventas?.length || 0;
    document.getElementById('contadorClientesEliminar').textContent = datos.clientes?.length || 0;
}

// Detectar navegador
function detectarNavegador() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        return 'Firefox';
    } else if (userAgent.includes('Edge')) {
        return 'Edge';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return 'Safari';
    } else {
        return 'Otro';
    }
}

// Actualizar información de respaldo
function actualizarInfoRespaldo() {
    const ultimoRespaldo = localStorage.getItem('ultimoRespaldo');
    
    if (ultimoRespaldo) {
        document.getElementById('ultimoRespaldo').textContent = new Date(ultimoRespaldo).toLocaleString();
    } else {
        document.getElementById('ultimoRespaldo').textContent = 'Nunca';
    }
}

// Configurar eventos
function configurarEventosGestion() {
    // Guardar configuración
    document.getElementById('guardarConfiguracion').addEventListener('click', guardarConfiguracion);
    
    // Agregar elementos a catálogos
    document.getElementById('agregarCategoria').addEventListener('click', function() {
        const valor = document.getElementById('nuevaCategoria').value;
        agregarItemCatalogo('categoria', valor);
    });
    
    document.getElementById('agregarColor').addEventListener('click', function() {
        const valor = document.getElementById('nuevoColor').value;
        agregarItemCatalogo('color', valor);
    });
    
    document.getElementById('agregarTalla').addEventListener('click', function() {
        const valor = document.getElementById('nuevaTalla').value;
        agregarItemCatalogo('talla', valor);
    });
    
    document.getElementById('agregarTallaPantalon').addEventListener('click', function() {
        const valor = document.getElementById('nuevaTallaPantalon').value;
        agregarItemCatalogo('tallaPantalon', valor);
    });
    
    // Permitir agregar con Enter
    ['nuevaCategoria', 'nuevoColor', 'nuevaTalla', 'nuevaTallaPantalon'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const tipo = id.replace('nueva', '').toLowerCase();
                    agregarItemCatalogo(tipo, this.value);
                }
            });
        }
    });
    
    // Respaldar datos
    document.getElementById('respaldarDatos').addEventListener('click', respaldarDatos);
    
    // Restaurar datos
    document.getElementById('seleccionarArchivo').addEventListener('click', function() {
        document.getElementById('archivoRestaurar').click();
    });
    
    document.getElementById('archivoRestaurar').addEventListener('change', function(e) {
        const btnRestaurar = document.getElementById('restaurarDatos');
        if (e.target.files.length > 0) {
            btnRestaurar.disabled = false;
            btnRestaurar.onclick = function() {
                restaurarDatos(e.target.files[0]);
            };
        } else {
            btnRestaurar.disabled = true;
        }
    });
    
    // Restablecer sistema
    document.getElementById('restablecerSistema').addEventListener('click', function() {
        document.getElementById('modalRestablecer').style.display = 'flex';
        document.getElementById('confirmarTexto').value = '';
        document.getElementById('confirmarRestablecer').disabled = true;
    });
    
    // Confirmación de restablecimiento
    document.getElementById('confirmarTexto').addEventListener('input', function() {
        const btnConfirmar = document.getElementById('confirmarRestablecer');
        btnConfirmar.disabled = this.value !== 'ELIMINAR';
    });
    
    document.getElementById('confirmarRestablecer').addEventListener('click', restablecerSistema);
    
    document.getElementById('cancelarRestablecer').addEventListener('click', function() {
        document.getElementById('modalRestablecer').style.display = 'none';
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

// Función para mostrar mensajes
function mostrarMensaje(tipo, mensaje, duracion = 3000) {
    // Usar sistema de mensajes si está disponible
    if (window.Sistema && Sistema.mostrarMensaje) {
        Sistema.mostrarMensaje(tipo, mensaje, duracion);
        return;
    }
    
    // Fallback básico
    const colores = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo] || '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    mensajeDiv.textContent = mensaje;
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (mensajeDiv.parentElement) {
                mensajeDiv.parentElement.removeChild(mensajeDiv);
            }
        }, 300);
    }, duracion);
}