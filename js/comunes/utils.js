// Utilidades generales - Jessica Boutique
const Utils = (function() {
    // Generar un ID único
    function generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Formatear número como moneda
    function formatearMoneda(valor, moneda = 'PEN') {
        const formatter = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: moneda
        });
        return formatter.format(valor);
    }

    // Formatear fecha
    function formatearFecha(fecha, formato = 'dd/mm/yyyy') {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return fecha;

        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const anio = date.getFullYear();
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');

        switch (formato) {
            case 'dd/mm/yyyy':
                return `${dia}/${mes}/${anio}`;
            case 'yyyy-mm-dd':
                return `${anio}-${mes}-${dia}`;
            case 'dd/mm/yyyy hh:mm':
                return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
            default:
                return fecha;
        }
    }

    // Validar email
    function validarEmail(email) {
        if (!email) return true; // Email opcional
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validar DNI (Perú)
    function validarDNI(dni) {
        if (!dni) return false;
        return /^\d{8}$/.test(dni.toString());
    }

    // Validar teléfono (Perú)
    function validarTelefono(telefono) {
        if (!telefono) return false;
        return /^9\d{8}$/.test(telefono.toString());
    }

    // Capitalizar texto
    function capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    // Limpiar texto (remover acentos y caracteres especiales)
    function limpiarTexto(texto) {
        if (!texto) return '';
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    // Debounce para eventos
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Obtener parámetros de URL
    function obtenerParametrosURL() {
        const params = {};
        const queryString = window.location.search.slice(1);
        const pairs = queryString.split('&');
        
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        
        return params;
    }

    // Copiar al portapapeles
    async function copiarAlPortapapeles(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
            return false;
        }
    }

    // Descargar archivo
    function descargarArchivo(contenido, nombre, tipo = 'text/plain') {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Mostrar notificación
    function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
        // Crear contenedor si no existe
        let contenedor = document.getElementById('notificaciones-globales');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'notificaciones-globales';
            contenedor.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 300px;
            `;
            document.body.appendChild(contenedor);
        }

        // Crear notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <div class="notificacion-contenido">
                <i class="fas ${obtenerIconoNotificacion(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        // Estilos básicos
        notificacion.style.cssText = `
            background: ${obtenerColorNotificacion(tipo)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;

        contenedor.appendChild(notificacion);

        // Auto-remover
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentElement) {
                    notificacion.remove();
                }
            }, 300);
        }, duracion);

        // Agregar animaciones si no existen
        if (!document.querySelector('#animaciones-notificaciones')) {
            const style = document.createElement('style');
            style.id = 'animaciones-notificaciones';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function obtenerIconoNotificacion(tipo) {
        const iconos = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return iconos[tipo] || 'fa-info-circle';
    }

    function obtenerColorNotificacion(tipo) {
        const colores = {
            'success': '#4caf50',
            'error': '#f44336',
            'warning': '#ff9800',
            'info': '#2196f3'
        };
        return colores[tipo] || '#2196f3';
    }

    // API pública
    return {
        generarId,
        formatearMoneda,
        formatearFecha,
        validarEmail,
        validarDNI,
        validarTelefono,
        capitalizar,
        limpiarTexto,
        debounce,
        obtenerParametrosURL,
        copiarAlPortapapeles,
        descargarArchivo,
        mostrarNotificacion
    };
})();

// Hacer disponible globalmente
window.Utils = Utils;