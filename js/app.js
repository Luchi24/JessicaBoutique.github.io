/**
 * Aplicación principal de Jessica Boutique
 * Coordina todos los módulos y funcionalidades
 */

class JessicaBoutiqueApp {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
        this.config = {};
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        if (this.isInitialized) {
            console.warn('La aplicación ya está inicializada');
            return;
        }

        try {
            console.log('🚀 Iniciando Jessica Boutique App...');

            // 1. Cargar configuración
            await this.loadConfig();

            // 2. Inicializar módulos esenciales
            await this.initEssentialModules();

            // 3. Configurar eventos globales
            this.setupGlobalEvents();

            // 4. Inicializar UI
            await this.initUI();

            // 5. Verificar estado de la aplicación
            await this.checkAppStatus();

            // 6. Cargar datos iniciales
            await this.loadInitialData();

            // 7. Marcar como inicializada
            this.isInitialized = true;
            console.log('✅ Jessica Boutique App inicializada correctamente');

            // 8. Disparar evento de inicialización
            this.dispatchAppEvent('app:initialized');

        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Carga la configuración de la aplicación
     */
    async loadConfig() {
        console.log('📋 Cargando configuración...');

        // Configuración por defecto
        const defaultConfig = {
            app: {
                name: 'Jessica Boutique',
                version: '3.1.2',
                environment: 'development',
                debug: true
            },
            api: {
                baseUrl: '',
                timeout: 30000,
                retryAttempts: 3
            },
            inventory: {
                lowStockThreshold: 5,
                optimalStock: 20,
                autoGenerateCodes: true
            },
            notifications: {
                enabled: true,
                sound: true,
                desktop: false
            },
            theme: {
                primaryColor: '#ec4899',
                darkMode: false,
                fontSize: 'medium'
            },
            features: {
                multiLanguage: false,
                advancedReports: true,
                bulkOperations: true,
                importExport: true
            }
        };

        // Intentar cargar configuración guardada
        try {
            const savedConfig = Utils.getItem('app_config', {});
            this.config = { ...defaultConfig, ...savedConfig };
            console.log('Configuración cargada:', this.config);
        } catch (error) {
            console.warn('Error cargando configuración, usando valores por defecto:', error);
            this.config = defaultConfig;
        }

        // Aplicar configuración al DOM
        this.applyConfigToDOM();
    }

    /**
     * Aplica la configuración al DOM
     */
    applyConfigToDOM() {
        // Aplicar tema
        if (this.config.theme.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Aplicar tamaño de fuente
        document.documentElement.style.fontSize = this.getFontSizeValue(this.config.theme.fontSize);

        // Aplicar color primario como variable CSS
        document.documentElement.style.setProperty('--primary-color', this.config.theme.primaryColor);
    }

    /**
     * Obtiene el valor de tamaño de fuente
     * @param {string} size - Tamaño (small, medium, large)
     * @returns {string} Valor CSS
     */
    getFontSizeValue(size) {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px'
        };
        return sizes[size] || '16px';
    }

    /**
     * Inicializa módulos esenciales
     */
    async initEssentialModules() {
        console.log('🔧 Inicializando módulos esenciales...');

        // Módulo de Autenticación
        await this.initModule('auth', 'js/auth.js', {
            requireLogin: false,
            autoLogin: true
        });

        // Módulo de Datos
        await this.initModule('data', 'js/data.js', {
            autoSync: true,
            cacheEnabled: true
        });

        // Módulo de Notificaciones
        await this.initModule('notifications', 'js/notifications.js', {
            sound: this.config.notifications.sound,
            desktop: this.config.notifications.desktop
        });

        // Módulo de Reportes
        if (this.config.features.advancedReports) {
            await this.initModule('reports', 'js/reports.js');
        }

        // Módulo de Sincronización
        await this.initModule('sync', 'js/sync.js', {
            interval: 300000, // 5 minutos
            onError: 'retry'
        });
    }

    /**
     * Inicializa un módulo específico
     * @param {string} moduleName - Nombre del módulo
     * @param {string} modulePath - Ruta del archivo
     * @param {Object} options - Opciones del módulo
     */
    async initModule(moduleName, modulePath, options = {}) {
        console.log(`Inicializando módulo: ${moduleName}...`);

        try {
            // Verificar si el módulo ya está cargado
            if (this.modules.has(moduleName)) {
                console.log(`Módulo ${moduleName} ya está inicializado`);
                return this.modules.get(moduleName);
            }

            // Cargar el módulo dinámicamente
            const module = await this.loadModuleScript(modulePath);
            
            // Si el módulo tiene función de inicialización, ejecutarla
            if (typeof module.init === 'function') {
                await module.init(options);
            }

            // Guardar referencia al módulo
            this.modules.set(moduleName, module);
            console.log(`✅ Módulo ${moduleName} inicializado`);

            return module;

        } catch (error) {
            console.error(`❌ Error inicializando módulo ${moduleName}:`, error);
            
            // Crear un stub para el módulo fallido
            const stubModule = this.createModuleStub(moduleName);
            this.modules.set(moduleName, stubModule);
            
            return stubModule;
        }
    }

    /**
     * Carga un script de módulo dinámicamente
     * @param {string} path - Ruta del script
     * @returns {Promise<Object>} Módulo cargado
     */
    loadModuleScript(path) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado en window
            const moduleName = path.split('/').pop().replace('.js', '');
            if (window[moduleName]) {
                resolve(window[moduleName]);
                return;
            }

            // Cargar dinámicamente
            const script = document.createElement('script');
            script.src = path;
            script.async = true;
            
            script.onload = () => {
                // Dar tiempo para que el módulo se registre en window
                setTimeout(() => {
                    if (window[moduleName]) {
                        resolve(window[moduleName]);
                    } else {
                        reject(new Error(`Módulo ${moduleName} no se registró en window`));
                    }
                }, 100);
            };
            
            script.onerror = () => {
                reject(new Error(`Error cargando módulo: ${path}`));
            };
            
            document.body.appendChild(script);
        });
    }

    /**
     * Crea un stub para un módulo fallido
     * @param {string} moduleName - Nombre del módulo
     * @returns {Object} Stub del módulo
     */
    createModuleStub(moduleName) {
        console.warn(`Creando stub para módulo fallido: ${moduleName}`);
        
        return {
            name: moduleName,
            isStub: true,
            init: async () => console.warn(`Stub ${moduleName}: init no disponible`),
            isAvailable: () => false,
            getStatus: () => 'unavailable'
        };
    }

    /**
     * Configura eventos globales
     */
    setupGlobalEvents() {
        console.log('🎮 Configurando eventos globales...');

        // Conexión/Desconexión
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));

        // Visibilidad de la página
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Eventos de la aplicación
        window.addEventListener('app:refresh', this.handleRefresh.bind(this));
        window.addEventListener('app:logout', this.handleLogout.bind(this));
        window.addEventListener('app:settings-changed', this.handleSettingsChanged.bind(this));

        // Eventos de errores
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    /**
     * Maneja cambio a online
     */
    handleOnline() {
        console.log('🌐 Aplicación en línea');
        
        // Mostrar notificación
        if (typeof window.showToast === 'function') {
            window.showToast('Conexión restablecida', 'success');
        }
        
        // Sincronizar datos pendientes
        this.syncPendingData();
        
        // Actualizar estado en UI
        this.updateConnectionStatus(true);
    }

    /**
     * Maneja cambio a offline
     */
    handleOffline() {
        console.warn('📴 Aplicación sin conexión');
        
        // Mostrar notificación
        if (typeof window.showToast === 'function') {
            window.showToast('Sin conexión a internet', 'warning');
        }
        
        // Actualizar estado en UI
        this.updateConnectionStatus(false);
        
        // Habilitar modo offline
        this.enableOfflineMode();
    }

    /**
     * Maneja cambio de visibilidad de la página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ Aplicación en segundo plano');
            this.dispatchAppEvent('app:background');
        } else {
            console.log('👁️ Aplicación en primer plano');
            this.dispatchAppEvent('app:foreground');
            
            // Verificar actualizaciones si vuelve a primer plano
            this.checkForUpdates();
        }
    }

    /**
     * Maneja solicitud de refresco
     */
    handleRefresh() {
        console.log('🔄 Refrescando aplicación...');
        this.refreshApp();
    }

    /**
     * Maneja logout
     */
    handleLogout() {
        console.log('👋 Cerrando sesión...');
        this.logout();
    }

    /**
     * Maneja cambio de configuraciones
     */
    handleSettingsChanged(event) {
        console.log('⚙️ Configuraciones cambiadas:', event.detail);
        this.applyNewSettings(event.detail);
    }

    /**
     * Maneja errores globales
     */
    handleGlobalError(event) {
        console.error('💥 Error global:', event.error);
        this.logError(event.error, 'global_error');
    }

    /**
     * Maneja promesas no manejadas
     */
    handleUnhandledRejection(event) {
        console.error('💥 Promesa no manejada:', event.reason);
        this.logError(event.reason, 'unhandled_promise');
    }

    /**
     * Inicializa la interfaz de usuario
     */
    async initUI() {
        console.log('🎨 Inicializando UI...');

        // Inicializar componentes dinámicos
        await this.initComponents();

        // Configurar tema
        this.setupTheme();

        // Configurar idioma
        this.setupLanguage();

        // Configurar shortcuts
        this.setupKeyboardShortcuts();

        // Configurar tooltips
        this.setupTooltips();

        // Configurar modales
        this.setupModals();

        // Configurar notificaciones
        this.setupNotifications();
    }

    /**
     * Inicializa componentes dinámicos
     */
    async initComponents() {
        // Cargar componentes faltantes
        const components = ['header', 'footer', 'sidebar', 'notifications-panel'];
        
        for (const component of components) {
            try {
                await this.loadComponent(component);
            } catch (error) {
                console.warn(`Error cargando componente ${component}:`, error);
            }
        }
    }

    /**
     * Carga un componente dinámicamente
     * @param {string} componentName - Nombre del componente
     */
    async loadComponent(componentName) {
        const containerId = `${componentName}-container`;
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.warn(`Contenedor ${containerId} no encontrado`);
            return;
        }

        try {
            const response = await fetch(`components/${componentName}.html`);
            const html = await response.text();
            container.innerHTML = html;
            
            // Ejecutar scripts dentro del componente
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });
            
            console.log(`✅ Componente ${componentName} cargado`);
        } catch (error) {
            console.error(`❌ Error cargando componente ${componentName}:`, error);
            container.innerHTML = `
                <div class="p-4 bg-red-50 text-red-800 rounded-lg">
                    Error cargando ${componentName}: ${error.message}
                </div>
            `;
        }
    }

    /**
     * Configura el tema
     */
    setupTheme() {
        // Verificar tema guardado
        const savedTheme = Utils.getItem('theme', 'light');
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        
        // Configurar toggle de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                
                if (isDark) {
                    document.documentElement.classList.remove('dark');
                    Utils.setItem('theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    Utils.setItem('theme', 'dark');
                }
                
                this.dispatchAppEvent('theme:changed', { isDark: !isDark });
            });
        }
    }

    /**
     * Configura el idioma
     */
    setupLanguage() {
        if (this.config.features.multiLanguage) {
            // Implementar selector de idioma
            const langSelect = document.getElementById('language-select');
            if (langSelect) {
                langSelect.addEventListener('change', (e) => {
                    this.changeLanguage(e.target.value);
                });
            }
        }
    }

    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar si está en input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl/Cmd + S: Guardar
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSave();
            }

            // Ctrl/Cmd + F: Buscar
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.focusSearch();
            }

            // Ctrl/Cmd + K: Comandos
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showCommandPalette();
            }

            // Esc: Cerrar modales
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Configura tooltips
     */
    setupTooltips() {
        // Inicializar tooltips si existe una librería
        if (typeof tippy === 'function') {
            tippy('[data-tippy-content]', {
                theme: 'jessica',
                animation: 'scale',
                duration: [200, 150]
            });
        }
    }

    /**
     * Configura modales
     */
    setupModals() {
        // Configurar modales existentes
        document.querySelectorAll('[data-modal]').forEach(modalTrigger => {
            modalTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = modalTrigger.dataset.modal;
                this.openModal(modalId);
            });
        });
    }

    /**
     * Configura notificaciones
     */
    setupNotifications() {
        // Solicitar permiso para notificaciones
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Verifica el estado de la aplicación
     */
    async checkAppStatus() {
        console.log('🔍 Verificando estado de la aplicación...');

        // Verificar almacenamiento
        this.checkStorage();

        // Verificar conexión
        this.checkConnection();

        // Verificar actualizaciones
        await this.checkForUpdates();

        // Verificar integridad de datos
        await this.checkDataIntegrity();
    }

    /**
     * Verifica el almacenamiento disponible
     */
    checkStorage() {
        try {
            const testKey = 'storage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            console.log('✅ Almacenamiento disponible');
        } catch (error) {
            console.error('❌ Error en almacenamiento:', error);
            this.showStorageWarning();
        }
    }

    /**
     * Verifica la conexión a internet
     */
    checkConnection() {
        const isOnline = navigator.onLine;
        this.updateConnectionStatus(isOnline);
        
        if (!isOnline) {
            console.warn('⚠️ Sin conexión a internet');
            this.enableOfflineMode();
        }
    }

    /**
     * Verifica actualizaciones
     */
    async checkForUpdates() {
        if (!this.config.app.debug) {
            try {
                const response = await fetch('version.json', { cache: 'no-store' });
                const latestVersion = await response.json();
                
                if (latestVersion.version !== this.config.app.version) {
                    this.showUpdateAvailable(latestVersion);
                }
            } catch (error) {
                console.warn('No se pudo verificar actualizaciones:', error);
            }
        }
    }

    /**
     * Verifica integridad de datos
     */
    async checkDataIntegrity() {
        try {
            const data = Utils.getItem('app_data', {});
            
            // Verificar estructura básica
            if (!data.products || !data.categories) {
                console.warn('Datos corruptos o incompletos');
                await this.repairData();
            }
        } catch (error) {
            console.error('Error verificando integridad de datos:', error);
        }
    }

    /**
     * Carga datos iniciales
     */
    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');

        try {
            // Cargar productos
            await this.loadProducts();

            // Cargar categorías
            await this.loadCategories();

            // Cargar estadísticas
            await this.loadStatistics();

            // Cargar configuraciones de usuario
            await this.loadUserSettings();

            console.log('✅ Datos iniciales cargados');
            
            // Disparar evento de datos cargados
            this.dispatchAppEvent('data:loaded');

        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            this.showDataLoadError(error);
        }
    }

    /**
     * Maneja errores de inicialización
     * @param {Error} error - Error ocurrido
     */
    handleInitError(error) {
        // Mostrar pantalla de error
        const errorScreen = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div class="max-w-md w-full text-center">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="alert-triangle" class="w-10 h-10 text-red-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-3">Error de Inicialización</h1>
                    <p class="text-gray-600 mb-6">${error.message}</p>
                    <div class="space-y-3">
                        <button onclick="window.location.reload()" 
                                class="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Reintentar
                        </button>
                        <button onclick="this.resetApp()" 
                                class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Restablecer Aplicación
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = errorScreen;
    }

    /**
     * Actualiza el estado de conexión en la UI
     * @param {boolean} isOnline - Si está en línea
     */
    updateConnectionStatus(isOnline) {
        const indicator = document.getElementById('connection-indicator');
        if (indicator) {
            indicator.classList.toggle('bg-green-500', isOnline);
            indicator.classList.toggle('bg-red-500', !isOnline);
            indicator.title = isOnline ? 'En línea' : 'Sin conexión';
        }
    }

    /**
     * Habilita el modo offline
     */
    enableOfflineMode() {
        // Mostrar banner de offline
        const offlineBanner = document.getElementById('offline-banner');
        if (offlineBanner) {
            offlineBanner.classList.remove('hidden');
        }
        
        // Deshabilitar funciones que requieren conexión
        document.querySelectorAll('[data-requires-online]').forEach(element => {
            element.classList.add('opacity-50', 'cursor-not-allowed');
            element.setAttribute('disabled', 'disabled');
        });
    }

    /**
     * Deshabilita el modo offline
     */
    disableOfflineMode() {
        // Ocultar banner de offline
        const offlineBanner = document.getElementById('offline-banner');
        if (offlineBanner) {
            offlineBanner.classList.add('hidden');
        }
        
        // Habilitar funciones
        document.querySelectorAll('[data-requires-online]').forEach(element => {
            element.classList.remove('opacity-50', 'cursor-not-allowed');
            element.removeAttribute('disabled');
        });
    }

    /**
     * Sincroniza datos pendientes
     */
    async syncPendingData() {
        const syncModule = this.modules.get('sync');
        if (syncModule && !syncModule.isStub) {
            await syncModule.syncPending();
        }
    }

    /**
     * Refresca la aplicación
     */
    refreshApp() {
        // Limpiar cache
        Utils.clearAll();
        
        // Recargar página
        window.location.reload();
    }

    /**
     * Cierra sesión
     */
    logout() {
        // Limpiar datos de sesión
        Utils.removeItem('auth_token');
        Utils.removeItem('user_data');
        
        // Redirigir a login
        window.location.href = 'login.html';
    }

    /**
     * Aplica nuevas configuraciones
     * @param {Object} newSettings - Nuevas configuraciones
     */
    applyNewSettings(newSettings) {
        // Actualizar configuración
        this.config = { ...this.config, ...newSettings };
        
        // Guardar
        Utils.setItem('app_config', this.config);
        
        // Aplicar cambios
        this.applyConfigToDOM();
        
        // Notificar módulos
        this.dispatchAppEvent('settings:applied', newSettings);
    }

    /**
     * Dispara un evento de la aplicación
     * @param {string} eventName - Nombre del evento
     * @param {Object} detail - Detalles del evento
     */
    dispatchAppEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    /**
     * Registra un error
     * @param {Error} error - Error a registrar
     * @param {string} category - Categoría del error
     */
    logError(error, category = 'unknown') {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            category,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Guardar en localStorage
        const errors = Utils.getItem('error_logs', []);
        errors.push(errorLog);
        Utils.setItem('error_logs', errors.slice(-50)); // Mantener últimos 50 errores
        
        // Enviar a servidor si hay conexión
        if (navigator.onLine) {
            this.sendErrorReport(errorLog);
        }
    }

    /**
     * Envía reporte de error al servidor
     * @param {Object} errorLog - Log del error
     */
    async sendErrorReport(errorLog) {
        try {
            await fetch('/api/logs/error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorLog)
            });
        } catch (error) {
            console.warn('No se pudo enviar reporte de error:', error);
        }
    }

    /**
     * Muestra advertencia de almacenamiento
     */
    showStorageWarning() {
        if (typeof window.showToast === 'function') {
            window.showToast('El almacenamiento local está lleno o no disponible. Algunas funciones pueden no trabajar correctamente.', 'warning', 5000);
        }
    }

    /**
     * Muestra actualización disponible
     * @param {Object} updateInfo - Información de la actualización
     */
    showUpdateAvailable(updateInfo) {
        const modalContent = `
            <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <i data-lucide="download" class="w-6 h-6 text-blue-600"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">Actualización Disponible</h3>
                        <p class="text-gray-600">Versión ${updateInfo.version}</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-800 mb-2">Novedades:</h4>
                    <ul class="space-y-2 text-sm text-gray-600">
                        ${updateInfo.changelog?.map(item => `<li>• ${item}</li>`).join('') || '<li>Mejoras de rendimiento y correcciones de errores</li>'}
                    </ul>
                </div>
                
                <div class="flex justify-end gap-3">
                    <button onclick="closeModal()" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl">
                        Más tarde
                    </button>
                    <button onclick="this.updateApp()" class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                        Actualizar Ahora
                    </button>
                </div>
            </div>
        `;
        
        if (typeof window.showModal === 'function') {
            window.showModal(modalContent);
        }
    }

    /**
     * Actualiza la aplicación
     */
    updateApp() {
        // Recargar para aplicar actualización
        window.location.reload();
    }

    /**
     * Muestra error de carga de datos
     * @param {Error} error - Error ocurrido
     */
    showDataLoadError(error) {
        if (typeof window.showToast === 'function') {
            window.showToast('Error cargando datos. Usando datos locales.', 'error');
        }
        
        // Usar datos de respaldo
        this.useFallbackData();
    }

    /**
     * Usa datos de respaldo
     */
    useFallbackData() {
        // Implementar lógica de datos de respaldo
        console.log('Usando datos de respaldo...');
    }

    /**
     * Repara datos corruptos
     */
    async repairData() {
        console.log('Reparando datos...');
        
        // Crear estructura básica si no existe
        const defaultData = {
            products: [],
            categories: [],
            customers: [],
            suppliers: [],
            lastSync: null
        };
        
        Utils.setItem('app_data', defaultData);
        
        // Disparar evento de datos reparados
        this.dispatchAppEvent('data:repaired');
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    /**
     * Obtiene un módulo por nombre
     * @param {string} moduleName - Nombre del módulo
     * @returns {Object} Módulo solicitado
     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Verifica si un módulo está disponible
     * @param {string} moduleName - Nombre del módulo
     * @returns {boolean} True si está disponible
     */
    isModuleAvailable(moduleName) {
        const module = this.modules.get(moduleName);
        return module && !module.isStub;
    }

    /**
     * Obtiene la configuración
     * @returns {Object} Configuración actual
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Actualiza la configuración
     * @param {Object} newConfig - Nueva configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        Utils.setItem('app_config', this.config);
        this.applyConfigToDOM();
        this.dispatchAppEvent('config:updated', this.config);
    }

    /**
     * Cambia el idioma
     * @param {string} language - Código del idioma
     */
    changeLanguage(language) {
        // Implementar cambio de idioma
        console.log(`Cambiando idioma a: ${language}`);
        // Aquí cargarías las traducciones correspondientes
    }

    /**
     * Maneja acción de guardar
     */
    handleSave() {
        this.dispatchAppEvent('save:request');
    }

    /**
     * Enfoca la búsqueda
     */
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * Muestra paleta de comandos
     */
    showCommandPalette() {
        // Implementar paleta de comandos
        console.log('Mostrando paleta de comandos...');
    }

    /**
     * Cierra todos los modales
     */
    closeAllModals() {
        if (typeof window.closeModal === 'function') {
            window.closeModal();
        }
        
        // Cerrar modales nativos
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }

    /**
     * Abre un modal
     * @param {string} modalId - ID del modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
        }
    }

    /**
     * Carga productos
     */
    async loadProducts() {
        const dataModule = this.modules.get('data');
        if (dataModule && !dataModule.isStub) {
            return await dataModule.getProducts();
        }
        return [];
    }

    /**
     * Carga categorías
     */
    async loadCategories() {
        const dataModule = this.modules.get('data');
        if (dataModule && !dataModule.isStub) {
            return await dataModule.getCategories();
        }
        return [];
    }

    /**
     * Carga estadísticas
     */
    async loadStatistics() {
        const dataModule = this.modules.get('data');
        if (dataModule && !dataModule.isStub) {
            return await dataModule.getStatistics();
        }
        return {};
    }

    /**
     * Carga configuraciones de usuario
     */
    async loadUserSettings() {
        const dataModule = this.modules.get('data');
        if (dataModule && !dataModule.isStub) {
            return await dataModule.getUserSettings();
        }
        return {};
    }

    /**
     * Restablece la aplicación
     */
    resetApp() {
        if (confirm('¿Estás seguro de que deseas restablecer la aplicación? Se perderán todos los datos locales.')) {
            // Limpiar todo
            Utils.clearAll();
            localStorage.clear();
            sessionStorage.clear();
            
            // Recargar
            window.location.reload();
        }
    }

    /**
     * Verifica si la aplicación está inicializada
     * @returns {boolean} True si está inicializada
     */
    isAppInitialized() {
        return this.isInitialized;
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================
let appInstance = null;

/**
 * Inicializa la aplicación
 * @returns {JessicaBoutiqueApp} Instancia de la aplicación
 */
function initApp() {
    if (!appInstance) {
        appInstance = new JessicaBoutiqueApp();
        window.app = appInstance;
    }
    return appInstance;
}

/**
 * Obtiene la instancia de la aplicación
 * @returns {JessicaBoutiqueApp} Instancia de la aplicación
 */
function getApp() {
    if (!appInstance) {
        throw new Error('La aplicación no ha sido inicializada. Llama a initApp() primero.');
    }
    return appInstance;
}

// ==================== INICIALIZACIÓN AUTOMÁTICA ====================
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que carguen las utilidades
    setTimeout(() => {
        if (typeof Utils !== 'undefined') {
            initApp();
        } else {
            console.error('Utils no está disponible. Verifica que utils.js se cargó correctamente.');
        }
    }, 100);
});

// ==================== EXPORTACIÓN ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        JessicaBoutiqueApp,
        initApp,
        getApp
    };
}