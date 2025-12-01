/**
 * CONFIG.JS - Sistema de configuración para Jessica Boutique
 * Maneja todas las configuraciones del sistema, persistencia y validación
 */

// Configuración por defecto del sistema
const DEFAULT_CONFIG = {
    // Configuración general
    general: {
        boutiqueName: "Jessica Boutique",
        boutiqueDescription: "Boutique de moda especializada en ropa y accesorios elegantes para mujeres.",
        contactPhone: "+1 (555) 123-4567",
        contactEmail: "info@jessicaboutique.com",
        currency: "USD",
        taxRate: 16,
        timezone: "America/Mexico_City",
        language: "es",
        dateFormat: "DD/MM/YYYY",
        decimalPlaces: 2,
        theme: "light", // light, dark, auto
        enableAnimations: true
    },
    
    // Configuración de inventario
    inventory: {
        lowStockThreshold: 5,
        optimalStockLevel: 20,
        autoGenerateCodes: true,
        allowDuplicateCodes: false,
        defaultCategory: "ropa",
        enableBarcodeScanner: false,
        showStockHistory: true,
        enableBatchOperations: true,
        autoArchiveInactive: false,
        archiveAfterDays: 90
    },
    
    // Configuración de notificaciones
    notifications: {
        lowStockAlerts: true,
        stockOutAlerts: true,
        emailNotifications: true,
        pushNotifications: true,
        reportFrequency: "weekly", // daily, weekly, monthly
        reportEmail: "admin@jessicaboutique.com",
        alertSound: true,
        desktopNotifications: true,
        notifyOnLogin: true,
        notifyOnBackup: true
    },
    
    // Configuración de usuarios
    users: {
        maxUsers: 5,
        requireEmailVerification: false,
        allowRegistration: false,
        defaultRole: "editor",
        sessionTimeout: 30, // minutos
        enable2FA: false,
        passwordComplexity: "medium", // low, medium, high
        loginAttempts: 5,
        lockoutTime: 15 // minutos
    },
    
    // Configuración de backup
    backup: {
        autoBackup: true,
        backupFrequency: "daily", // daily, weekly, monthly
        backupTime: "02:00",
        keepBackups: 30, // días
        backupProducts: true,
        backupCategories: true,
        backupSettings: true,
        backupMedia: false,
        cloudBackup: false,
        backupLocation: "local" // local, cloud, both
    },
    
    // Configuración de integraciones
    integrations: {
        enableEcommerce: false,
        enablePOS: false,
        enableAccounting: false,
        enableShipping: false,
        enableSMS: false,
        enableEmailMarketing: false,
        apiEnabled: false,
        apiKey: "",
        webhookUrl: "",
        syncFrequency: "hourly"
    },
    
    // Configuración avanzada
    advanced: {
        debugMode: false,
        enableLogging: true,
        logRetention: 30, // días
        cacheEnabled: true,
        cacheDuration: 300, // segundos
        enableCompression: true,
        enableCDN: false,
        maintenanceMode: false,
        forceHTTPS: true,
        enableCORS: true,
        maxUploadSize: 10, // MB
        allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf"]
    }
};

class ConfigManager {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.isLoading = false;
        this.hasUnsavedChanges = false;
        this.init();
    }
    
    /**
     * Inicializa el gestor de configuración
     */
    async init() {
        console.log('🔧 Inicializando ConfigManager...');
        
        // Cargar configuración guardada
        await this.loadSavedConfig();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Aplicar configuración inicial
        this.applyConfig();
        
        console.log('✅ ConfigManager inicializado');
    }
    
    /**
     * Carga la configuración guardada del localStorage
     */
    async loadSavedConfig() {
        try {
            const savedConfig = localStorage.getItem('jessica_boutique_config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.config = this.deepMerge(this.config, parsed);
                console.log('📂 Configuración cargada del localStorage');
            }
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            // Si hay error, usar configuración por defecto
            this.config = { ...DEFAULT_CONFIG };
        }
    }
    
    /**
     * Guarda la configuración actual en localStorage
     */
    async saveConfig() {
        try {
            localStorage.setItem('jessica_boutique_config', JSON.stringify(this.config));
            this.hasUnsavedChanges = false;
            console.log('💾 Configuración guardada en localStorage');
            
            // Disparar evento de configuración guardada
            this.dispatchEvent('config:saved', this.config);
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            return false;
        }
    }
    
    /**
     * Restablece la configuración a los valores por defecto
     */
    async resetConfig() {
        if (confirm('⚠️ ¿Estás seguro de restablecer toda la configuración a los valores por defecto? Esto no se puede deshacer.')) {
            this.config = { ...DEFAULT_CONFIG };
            await this.saveConfig();
            this.applyConfig();
            
            // Mostrar notificación
            this.showNotification('Configuración restablecida a valores por defecto', 'success');
            
            console.log('🔄 Configuración restablecida');
            return true;
        }
        return false;
    }
    
    /**
     * Obtiene un valor de configuración específico
     * @param {string} path - Ruta a la configuración (ej: 'general.currency')
     * @param {any} defaultValue - Valor por defecto si no existe
     * @returns {any} Valor de la configuración
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    /**
     * Establece un valor de configuración específico
     * @param {string} path - Ruta a la configuración
     * @param {any} value - Nuevo valor
     * @param {boolean} saveImmediately - Guardar inmediatamente
     */
    set(path, value, saveImmediately = false) {
        const keys = path.split('.');
        let obj = this.config;
        
        // Navegar hasta el penúltimo objeto
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        // Establecer el valor final
        const lastKey = keys[keys.length - 1];
        const oldValue = obj[lastKey];
        
        if (oldValue !== value) {
            obj[lastKey] = value;
            this.hasUnsavedChanges = true;
            
            // Disparar evento de cambio
            this.dispatchEvent('config:changed', { path, oldValue, newValue: value });
            
            // Aplicar cambios específicos si es necesario
            this.applyConfigChange(path, value);
            
            // Guardar si se solicita
            if (saveImmediately) {
                this.saveConfig();
            }
        }
    }
    
    /**
     * Aplica cambios específicos de configuración
     * @param {string} path - Ruta de la configuración
     * @param {any} value - Nuevo valor
     */
    applyConfigChange(path, value) {
        switch (path) {
            case 'general.theme':
                this.applyTheme(value);
                break;
                
            case 'general.language':
                this.applyLanguage(value);
                break;
                
            case 'general.currency':
                this.applyCurrency(value);
                break;
                
            case 'general.enableAnimations':
                this.applyAnimations(value);
                break;
                
            case 'notifications.lowStockAlerts':
                this.toggleLowStockAlerts(value);
                break;
                
            case 'advanced.debugMode':
                this.toggleDebugMode(value);
                break;
                
            case 'advanced.maintenanceMode':
                this.toggleMaintenanceMode(value);
                break;
        }
    }
    
    /**
     * Aplica toda la configuración al sistema
     */
    applyConfig() {
        console.log('🎨 Aplicando configuración del sistema...');
        
        // Aplicar tema
        this.applyTheme(this.get('general.theme'));
        
        // Aplicar idioma
        this.applyLanguage(this.get('general.language'));
        
        // Aplicar moneda
        this.applyCurrency(this.get('general.currency'));
        
        // Aplicar animaciones
        this.applyAnimations(this.get('general.enableAnimations'));
        
        // Configurar notificaciones
        this.toggleLowStockAlerts(this.get('notifications.lowStockAlerts'));
        
        // Configurar modo debug
        this.toggleDebugMode(this.get('advanced.debugMode'));
        
        // Actualizar UI con valores de configuración
        this.updateConfigUI();
        
        console.log('✅ Configuración aplicada');
    }
    
    /**
     * Aplica el tema seleccionado
     * @param {string} theme - Tema (light, dark, auto)
     */
    applyTheme(theme) {
        const html = document.documentElement;
        
        // Remover clases de tema anteriores
        html.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            // Detectar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
            
            // Escuchar cambios en la preferencia del sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                html.classList.toggle('theme-dark', e.matches);
                html.classList.toggle('theme-light', !e.matches);
            });
        } else {
            html.classList.add(`theme-${theme}`);
        }
        
        // Guardar en localStorage para consistencia
        localStorage.setItem('user-theme', theme);
        
        console.log(`🎨 Tema aplicado: ${theme}`);
    }
    
    /**
     * Aplica el idioma seleccionado
     * @param {string} language - Código de idioma
     */
    applyLanguage(language) {
        // Por ahora solo actualizamos el atributo HTML
        document.documentElement.lang = language;
        
        // En una implementación real, cargaríamos archivos de traducción
        console.log(`🌐 Idioma aplicado: ${language}`);
    }
    
    /**
     * Aplica la moneda seleccionada
     * @param {string} currency - Código de moneda
     */
    applyCurrency(currency) {
        // Actualizar símbolos de moneda en la UI
        const currencyElements = document.querySelectorAll('[data-currency]');
        currencyElements.forEach(el => {
            el.textContent = this.getCurrencySymbol(currency);
        });
        
        console.log(`💰 Moneda aplicada: ${currency}`);
    }
    
    /**
     * Obtiene el símbolo de moneda
     * @param {string} currency - Código de moneda
     * @returns {string} Símbolo de moneda
     */
    getCurrencySymbol(currency) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'MXN': '$',
            'COP': '$',
            'GBP': '£'
        };
        
        return symbols[currency] || '$';
    }
    
    /**
     * Aplica la configuración de animaciones
     * @param {boolean} enabled - Animaciones habilitadas
     */
    applyAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
        
        console.log(`🎬 Animaciones ${enabled ? 'habilitadas' : 'deshabilitadas'}`);
    }
    
    /**
     * Activa/desactiva alertas de stock bajo
     * @param {boolean} enabled - Alertas habilitadas
     */
    toggleLowStockAlerts(enabled) {
        // En una implementación real, configuraría las notificaciones push
        console.log(`📢 Alertas de stock bajo ${enabled ? 'activadas' : 'desactivadas'}`);
    }
    
    /**
     * Activa/desactiva el modo debug
     * @param {boolean} enabled - Modo debug habilitado
     */
    toggleDebugMode(enabled) {
        if (enabled) {
            window.DEBUG = true;
            console.log('🐛 Modo debug activado');
        } else {
            window.DEBUG = false;
        }
    }
    
    /**
     * Activa/desactiva el modo mantenimiento
     * @param {boolean} enabled - Modo mantenimiento habilitado
     */
    toggleMaintenanceMode(enabled) {
        if (enabled) {
            this.showMaintenanceBanner();
            console.log('🛠️ Modo mantenimiento activado');
        } else {
            this.hideMaintenanceBanner();
        }
    }
    
    /**
     * Muestra banner de mantenimiento
     */
    showMaintenanceBanner() {
        const banner = document.createElement('div');
        banner.id = 'maintenance-banner';
        banner.innerHTML = `
            <div class="maintenance-banner">
                <i data-lucide="wrench"></i>
                <span>Sistema en mantenimiento. Algunas funciones pueden no estar disponibles.</span>
            </div>
        `;
        
        document.body.prepend(banner);
        lucide.createIcons();
    }
    
    /**
     * Oculta banner de mantenimiento
     */
    hideMaintenanceBanner() {
        const banner = document.getElementById('maintenance-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    /**
     * Configura los event listeners para la UI de configuración
     */
    setupEventListeners() {
        // Guardar configuración al hacer clic en botón guardar
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="save-config"]')) {
                this.saveConfig();
                this.showNotification('Configuración guardada exitosamente', 'success');
            }
            
            // Restablecer configuración
            if (e.target.closest('[data-action="reset-config"]')) {
                this.resetConfig();
            }
            
            // Exportar configuración
            if (e.target.closest('[data-action="export-config"]')) {
                this.exportConfig();
            }
            
            // Importar configuración
            if (e.target.closest('[data-action="import-config"]')) {
                document.getElementById('config-import-file').click();
            }
        });
        
        // Cambios en inputs de configuración
        document.addEventListener('change', (e) => {
            const input = e.target;
            
            // Inputs con data-config-path
            if (input.hasAttribute('data-config-path')) {
                const path = input.getAttribute('data-config-path');
                let value;
                
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = parseFloat(input.value);
                } else {
                    value = input.value;
                }
                
                this.set(path, value);
                
                // Mostrar indicador de cambios no guardados
                this.showUnsavedChangesIndicator();
            }
        });
        
        // Importar configuración desde archivo
        const importInput = document.getElementById('config-import-file');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                this.importConfigFromFile(e.target.files[0]);
            });
        }
        
        // Escuchar cambios en preferencia de tema del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.get('general.theme') === 'auto') {
                this.applyTheme('auto');
            }
        });
    }
    
    /**
     * Actualiza la UI con los valores actuales de configuración
     */
    updateConfigUI() {
        // Actualizar todos los inputs con data-config-path
        document.querySelectorAll('[data-config-path]').forEach(input => {
            const path = input.getAttribute('data-config-path');
            const value = this.get(path);
            
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        });
        
        // Actualizar selectores de tema
        const themeSelectors = document.querySelectorAll('[name="theme"]');
        themeSelectors.forEach(selector => {
            if (selector.value === this.get('general.theme')) {
                selector.checked = true;
            }
        });
        
        // Actualizar indicadores de estado
        this.updateStatusIndicators();
    }
    
    /**
     * Actualiza indicadores de estado en la UI
     */
    updateStatusIndicators() {
        // Indicador de tema
        const themeIndicator = document.querySelector('[data-status="theme"]');
        if (themeIndicator) {
            themeIndicator.textContent = this.get('general.theme');
        }
        
        // Indicador de moneda
        const currencyIndicator = document.querySelector('[data-status="currency"]');
        if (currencyIndicator) {
            currencyIndicator.textContent = this.get('general.currency');
        }
        
        // Indicador de notificaciones
        const notificationsIndicator = document.querySelector('[data-status="notifications"]');
        if (notificationsIndicator) {
            const enabled = this.get('notifications.lowStockAlerts') ? 'Activadas' : 'Desactivadas';
            notificationsIndicator.textContent = enabled;
        }
    }
    
    /**
     * Muestra indicador de cambios no guardados
     */
    showUnsavedChangesIndicator() {
        if (this.hasUnsavedChanges) {
            const indicator = document.getElementById('unsaved-changes-indicator');
            if (indicator) {
                indicator.classList.remove('hidden');
            }
            
            // También podríamos mostrar un toast
            if (typeof window.showToast === 'function') {
                window.showToast('Tienes cambios sin guardar', 'warning');
            }
        }
    }
    
    /**
     * Oculta indicador de cambios no guardados
     */
    hideUnsavedChangesIndicator() {
        const indicator = document.getElementById('unsaved-changes-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
    
    /**
     * Exporta la configuración actual como archivo JSON
     */
    exportConfig() {
        const configData = {
            ...this.config,
            _meta: {
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
                boutique: this.get('general.boutiqueName')
            }
        };
        
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `jessica-boutique-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Configuración exportada exitosamente', 'success');
    }
    
    /**
     * Importa configuración desde un archivo JSON
     * @param {File} file - Archivo JSON de configuración
     */
    async importConfigFromFile(file) {
        if (!file || file.type !== 'application/json') {
            this.showNotification('Por favor selecciona un archivo JSON válido', 'error');
            return;
        }
        
        try {
            const text = await file.text();
            const importedConfig = JSON.parse(text);
            
            // Validar estructura básica
            if (!this.validateConfigStructure(importedConfig)) {
                throw new Error('Estructura de configuración inválida');
            }
            
            // Fusionar con configuración actual
            this.config = this.deepMerge(this.config, importedConfig);
            
            // Guardar
            await this.saveConfig();
            
            // Aplicar nueva configuración
            this.applyConfig();
            
            this.showNotification('Configuración importada exitosamente', 'success');
            
        } catch (error) {
            console.error('❌ Error importando configuración:', error);
            this.showNotification('Error importando configuración: ' + error.message, 'error');
        }
    }
    
    /**
     * Valida la estructura de un objeto de configuración
     * @param {object} config - Configuración a validar
     * @returns {boolean} True si la estructura es válida
     */
    validateConfigStructure(config) {
        // Validación básica - en producción esto sería más robusto
        const requiredSections = ['general', 'inventory', 'notifications'];
        return requiredSections.every(section => config[section] && typeof config[section] === 'object');
    }
    
    /**
     * Crea un respaldo de la configuración
     * @returns {Promise<object>} Objeto de respaldo
     */
    async createBackup() {
        const backup = {
            config: this.config,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        
        // Guardar en localStorage como respaldo
        const backups = JSON.parse(localStorage.getItem('config_backups') || '[]');
        backups.push(backup);
        
        // Mantener solo los últimos 10 respaldos
        if (backups.length > 10) {
            backups.shift();
        }
        
        localStorage.setItem('config_backups', JSON.stringify(backups));
        
        console.log('📦 Respaldo de configuración creado');
        return backup;
    }
    
    /**
     * Restaura configuración desde un respaldo
     * @param {number} index - Índice del respaldo
     */
    async restoreFromBackup(index) {
        const backups = JSON.parse(localStorage.getItem('config_backups') || '[]');
        
        if (index >= 0 && index < backups.length) {
            const backup = backups[index];
            this.config = backup.config;
            await this.saveConfig();
            this.applyConfig();
            
            this.showNotification('Configuración restaurada desde respaldo', 'success');
            return true;
        }
        
        return false;
    }
    
    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // Usar sistema de toast global si está disponible
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Fallback simple
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Fusiona objetos profundamente
     * @param {object} target - Objeto objetivo
     * @param {object} source - Objeto fuente
     * @returns {object} Objeto fusionado
     */
    deepMerge(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }
        
        return output;
    }
    
    /**
     * Verifica si un valor es un objeto
     * @param {any} item - Valor a verificar
     * @returns {boolean} True si es un objeto
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    /**
     * Dispara un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {any} detail - Detalles del evento
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Obtiene estadísticas de configuración
     * @returns {object} Estadísticas
     */
    getStats() {
        return {
            totalSettings: this.countSettings(this.config),
            lastModified: localStorage.getItem('config_last_modified') || 'Nunca',
            backupCount: JSON.parse(localStorage.getItem('config_backups') || '[]').length,
            configSize: JSON.stringify(this.config).length
        };
    }
    
    /**
     * Cuenta el total de configuraciones
     * @param {object} obj - Objeto a contar
     * @returns {number} Número total de configuraciones
     */
    countSettings(obj) {
        let count = 0;
        
        for (const key in obj) {
            if (this.isObject(obj[key])) {
                count += this.countSettings(obj[key]);
            } else {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * Valida una configuración específica
     * @param {string} path - Ruta de la configuración
     * @param {any} value - Valor a validar
     * @returns {object} Resultado de validación
     */
    validateSetting(path, value) {
        const validations = {
            'general.taxRate': (val) => ({
                valid: val >= 0 && val <= 100,
                message: 'La tasa de impuesto debe estar entre 0 y 100'
            }),
            'inventory.lowStockThreshold': (val) => ({
                valid: val >= 0,
                message: 'El umbral de stock bajo no puede ser negativo'
            }),
            'notifications.reportEmail': (val) => ({
                valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                message: 'Por favor ingresa un email válido'
            })
        };
        
        if (validations[path]) {
            return validations[path](value);
        }
        
        return { valid: true, message: '' };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar ConfigManager globalmente
    window.ConfigManager = new ConfigManager();
    
    // También hacerlo accesible como una instancia global
    window.appConfig = window.ConfigManager;
    
    console.log('🎛️  Sistema de configuración listo');
});

// Exportar para módulos (si se usa ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, DEFAULT_CONFIG };
}