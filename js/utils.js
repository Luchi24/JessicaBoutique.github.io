/**
 * Utilidades generales para Jessica Boutique
 * Funciones reutilizables y helpers
 */

// ==================== MANEJO DE FECHAS ====================
const DateUtils = {
    /**
     * Formatea una fecha en formato legible
     * @param {Date|string} date - Fecha a formatear
     * @param {string} format - Formato deseado
     * @returns {string} Fecha formateada
     */
    formatDate(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Fecha inválida';

        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        const formats = {
            'DD/MM/YYYY': `${day}/${month}/${year}`,
            'YYYY-MM-DD': `${year}-${month}-${day}`,
            'DD/MM/YYYY HH:mm': `${day}/${month}/${year} ${hours}:${minutes}`,
            'relative': this.getRelativeTime(d)
        };

        return formats[format] || `${day}/${month}/${year}`;
    },

    /**
     * Obtiene el tiempo relativo (hace X tiempo)
     * @param {Date} date - Fecha de referencia
     * @returns {string} Tiempo relativo
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'hace unos segundos';
        if (diffMin < 60) return `hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
        if (diffHour < 24) return `hace ${diffHour} hora${diffHour !== 1 ? 's' : ''}`;
        if (diffDay < 7) return `hace ${diffDay} día${diffDay !== 1 ? 's' : ''}`;
        
        return this.formatDate(date, 'DD/MM/YYYY');
    },

    /**
     * Valida si una fecha es válida
     * @param {string} dateString - String de fecha
     * @returns {boolean} True si es válida
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
};

// ==================== MANEJO DE FORMATOS ====================
const FormatUtils = {
    /**
     * Formatea un número como moneda
     * @param {number} amount - Cantidad a formatear
     * @param {string} currency - Código de moneda
     * @returns {string} Cantidad formateada
     */
    formatCurrency(amount, currency = 'USD') {
        const currencies = {
            'USD': '$',
            'EUR': '€',
            'MXN': '$',
            'COP': '$'
        };
        
        const symbol = currencies[currency] || '$';
        
        // Si es un número entero, mostrar sin decimales
        if (Number.isInteger(amount)) {
            return `${symbol}${amount.toLocaleString()}`;
        }
        
        return `${symbol}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    /**
     * Formatea un número con separadores de miles
     * @param {number} number - Número a formatear
     * @returns {string} Número formateado
     */
    formatNumber(number) {
        if (typeof number !== 'number') return '0';
        return number.toLocaleString();
    },

    /**
     * Recorta un texto a un máximo de caracteres
     * @param {string} text - Texto a recortar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto recortado
     */
    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Convierte bytes a formato legible (KB, MB, GB)
     * @param {number} bytes - Bytes a convertir
     * @returns {string} Tamaño formateado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// ==================== VALIDACIONES ====================
const ValidationUtils = {
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valida un teléfono
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} True si es válido
     */
    isValidPhone(phone) {
        const regex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return regex.test(phone);
    },

    /**
     * Valida que un campo no esté vacío
     * @param {*} value - Valor a validar
     * @returns {boolean} True si no está vacío
     */
    isNotEmpty(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !isNaN(value);
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
    },

    /**
     * Valida un código de producto
     * @param {string} code - Código a validar
     * @returns {boolean} True si es válido
     */
    isValidProductCode(code) {
        const regex = /^[A-Z0-9\-_]{3,}$/;
        return regex.test(code);
    }
};

// ==================== MANEJO DE ARRAYS Y OBJETOS ====================
const ArrayUtils = {
    /**
     * Ordena un array de objetos por una propiedad
     * @param {Array} array - Array a ordenar
     * @param {string} key - Clave por la que ordenar
     * @param {string} order - 'asc' o 'desc'
     * @returns {Array} Array ordenado
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];
            
            // Manejar strings case-insensitive
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filtra un array por múltiples criterios
     * @param {Array} array - Array a filtrar
     * @param {Object} filters - Objeto con filtros
     * @returns {Array} Array filtrado
     */
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === undefined || value === null) return true;
                
                const itemValue = item[key];
                
                // Si el filtro es una función
                if (typeof value === 'function') {
                    return value(itemValue);
                }
                
                // Si el filtro es un array (buscar en array)
                if (Array.isArray(value)) {
                    return value.includes(itemValue);
                }
                
                // Comparación directa
                return itemValue === value;
            });
        });
    },

    /**
     * Agrupa un array por una propiedad
     * @param {Array} array - Array a agrupar
     * @param {string} key - Clave por la que agrupar
     * @returns {Object} Objeto con grupos
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    },

    /**
     * Elimina duplicados de un array
     * @param {Array} array - Array con posibles duplicados
     * @param {string} key - Clave para identificar duplicados (opcional)
     * @returns {Array} Array sin duplicados
     */
    removeDuplicates(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
};

// ==================== MANEJO DE LOCALSTORAGE ====================
const StorageUtils = {
    /**
     * Guarda datos en localStorage
     * @param {string} key - Clave para guardar
     * @param {*} value - Valor a guardar
     */
    setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(`jessica_${key}`, serialized);
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    },

    /**
     * Obtiene datos de localStorage
     * @param {string} key - Clave a obtener
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} Valor almacenado o defaultValue
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`jessica_${key}`);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Error obteniendo de localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Elimina datos de localStorage
     * @param {string} key - Clave a eliminar
     */
    removeItem(key) {
        try {
            localStorage.removeItem(`jessica_${key}`);
        } catch (error) {
            console.error('Error eliminando de localStorage:', error);
        }
    },

    /**
     * Limpia todos los datos de la aplicación
     */
    clearAll() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith('jessica_'))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    },

    /**
     * Obtiene todas las claves de la aplicación
     * @returns {Array} Lista de claves
     */
    getAllKeys() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith('jessica_'))
            .map(key => key.replace('jessica_', ''));
    }
};

// ==================== MANEJO DE ARCHIVOS ====================
const FileUtils = {
    /**
     * Convierte un archivo a base64
     * @param {File} file - Archivo a convertir
     * @returns {Promise<string>} Promise con el base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    /**
     * Valida el tipo de archivo
     * @param {File} file - Archivo a validar
     * @param {Array} allowedTypes - Tipos MIME permitidos
     * @returns {boolean} True si es válido
     */
    isValidFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
        return allowedTypes.includes(file.type);
    },

    /**
     * Valida el tamaño del archivo
     * @param {File} file - Archivo a validar
     * @param {number} maxSizeMB - Tamaño máximo en MB
     * @returns {boolean} True si es válido
     */
    isValidFileSize(file, maxSizeMB = 5) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }
};

// ==================== MANEJO DE URLS ====================
const UrlUtils = {
    /**
     * Obtiene parámetros de la URL
     * @param {string} param - Parámetro a obtener
     * @returns {string|null} Valor del parámetro
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Actualiza un parámetro en la URL sin recargar
     * @param {string} param - Parámetro a actualizar
     * @param {string} value - Nuevo valor
     */
    updateUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Remueve un parámetro de la URL
     * @param {string} param - Parámetro a remover
     */
    removeUrlParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    }
};

// ==================== MANEJO DE EVENTOS ====================
const EventUtils = {
    /**
     * Dispara un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {*} detail - Datos del evento
     */
    dispatch(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    },

    /**
     * Escucha un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar
     */
    listen(eventName, callback) {
        window.addEventListener(eventName, callback);
    },

    /**
     * Deja de escuchar un evento
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función registrada
     */
    remove(eventName, callback) {
        window.removeEventListener(eventName, callback);
    }
};

// ==================== MANEJO DE ERRORES ====================
const ErrorUtils = {
    /**
     * Maneja errores de forma consistente
     * @param {Error} error - Error a manejar
     * @param {string} context - Contexto del error
     */
    handle(error, context = 'Aplicación') {
        console.error(`[${context}] Error:`, error);
        
        // Mostrar toast de error si está disponible
        if (typeof window.showToast === 'function') {
            const message = error.message || 'Ocurrió un error inesperado';
            window.showToast(`${context}: ${message}`, 'error');
        }
    },

    /**
     * Crea un error personalizado
     * @param {string} message - Mensaje del error
     * @param {string} code - Código del error
     * @returns {Error} Error personalizado
     */
    create(message, code = 'UNKNOWN_ERROR') {
        const error = new Error(message);
        error.code = code;
        error.timestamp = new Date().toISOString();
        return error;
    }
};

// ==================== FUNCIONES DE AYUDA ====================
const HelperUtils = {
    /**
     * Debounce function para optimizar eventos
     * @param {Function} func - Función a debounce
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función debounced
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function para limitar ejecuciones
     * @param {Function} func - Función a throttle
     * @param {number} limit - Límite de tiempo en ms
     * @returns {Function} Función throttled
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Genera un ID único
     * @param {string} prefix - Prefijo opcional
     * @returns {string} ID único
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Duerme por un tiempo específico
     * @param {number} ms - Milisegundos a dormir
     * @returns {Promise} Promise que se resuelve después del tiempo
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Clona un objeto/array profundamente
     * @param {*} obj - Objeto a clonar
     * @returns {*} Clon del objeto
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
};

// ==================== EXPORTACIÓN ====================
window.Utils = {
    // Fechas
    formatDate: DateUtils.formatDate,
    getRelativeTime: DateUtils.getRelativeTime,
    isValidDate: DateUtils.isValidDate,

    // Formatos
    formatCurrency: FormatUtils.formatCurrency,
    formatNumber: FormatUtils.formatNumber,
    truncateText: FormatUtils.truncateText,
    formatFileSize: FormatUtils.formatFileSize,

    // Validaciones
    isValidEmail: ValidationUtils.isValidEmail,
    isValidPhone: ValidationUtils.isValidPhone,
    isNotEmpty: ValidationUtils.isNotEmpty,
    isValidProductCode: ValidationUtils.isValidProductCode,

    // Arrays y objetos
    sortBy: ArrayUtils.sortBy,
    filterBy: ArrayUtils.filterBy,
    groupBy: ArrayUtils.groupBy,
    removeDuplicates: ArrayUtils.removeDuplicates,

    // LocalStorage
    setItem: StorageUtils.setItem,
    getItem: StorageUtils.getItem,
    removeItem: StorageUtils.removeItem,
    clearAll: StorageUtils.clearAll,
    getAllKeys: StorageUtils.getAllKeys,

    // Archivos
    fileToBase64: FileUtils.fileToBase64,
    isValidFileType: FileUtils.isValidFileType,
    isValidFileSize: FileUtils.isValidFileSize,

    // URLs
    getUrlParam: UrlUtils.getUrlParam,
    updateUrlParam: UrlUtils.updateUrlParam,
    removeUrlParam: UrlUtils.removeUrlParam,

    // Eventos
    dispatchEvent: EventUtils.dispatch,
    listenEvent: EventUtils.listen,
    removeEvent: EventUtils.remove,

    // Errores
    handleError: ErrorUtils.handle,
    createError: ErrorUtils.create,

    // Helpers
    debounce: HelperUtils.debounce,
    throttle: HelperUtils.throttle,
    generateId: HelperUtils.generateId,
    sleep: HelperUtils.sleep,
    deepClone: HelperUtils.deepClone,

    // Objetos completos (para acceso avanzado)
    Date: DateUtils,
    Format: FormatUtils,
    Validation: ValidationUtils,
    Array: ArrayUtils,
    Storage: StorageUtils,
    File: FileUtils,
    Url: UrlUtils,
    Event: EventUtils,
    Error: ErrorUtils,
    Helper: HelperUtils
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Utils cargados correctamente');
});

// Manejo de errores global
window.addEventListener('error', (event) => {
    ErrorUtils.handle(event.error, 'Global');
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorUtils.handle(event.reason, 'Promise no manejada');
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.Utils;
}