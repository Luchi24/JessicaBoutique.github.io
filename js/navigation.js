/**
 * Sistema de navegación SPA para Jessica Boutique
 * Maneja la carga dinámica de secciones y el historial
 */

class NavigationSystem {
    constructor() {
        this.currentSection = null;
        this.previousSection = null;
        this.sections = new Map();
        this.isNavigating = false;
        this.init();
    }

    /**
     * Inicializa el sistema de navegación
     */
    init() {
        this.loadAvailableSections();
        this.bindEvents();
        this.setupHistory();
        this.loadInitialSection();
    }

    /**
     * Carga la lista de secciones disponibles
     */
    loadAvailableSections() {
        // Secciones principales definidas
        this.sections.set('inventario', {
            name: 'Inventario',
            path: 'sections/inventory.html',
            requiresAuth: true,
            icon: 'package'
        });

        this.sections.set('categorias', {
            name: 'Categorías',
            path: 'sections/categories.html',
            requiresAuth: true,
            icon: 'layers'
        });

        this.sections.set('añadir-productos', {
            name: 'Agregar Productos',
            path: 'sections/add-product.html',
            requiresAuth: true,
            icon: 'plus-circle'
        });

        this.sections.set('resumen', {
            name: 'Estadísticas',
            path: 'sections/statistics.html',
            requiresAuth: true,
            icon: 'bar-chart-3'
        });

        this.sections.set('configuraciones', {
            name: 'Configuración',
            path: 'sections/config.html',
            requiresAuth: true,
            icon: 'settings'
        });

        // Secciones adicionales
        this.sections.set('proveedores', {
            name: 'Proveedores',
            path: 'sections/suppliers.html',
            requiresAuth: true,
            icon: 'truck'
        });

        this.sections.set('clientes', {
            name: 'Clientes',
            path: 'sections/customers.html',
            requiresAuth: true,
            icon: 'users'
        });

        console.log('Secciones disponibles:', Array.from(this.sections.keys()));
    }

    /**
     * Configura los event listeners
     */
    bindEvents() {
        // Interceptar clics en enlaces internos
        document.addEventListener('click', this.handleLinkClick.bind(this));

        // Manejar botones de navegación atrás/adelante
        window.addEventListener('popstate', this.handlePopState.bind(this));

        // Escuchar eventos de cambio de sección
        window.addEventListener('section:request', this.handleSectionRequest.bind(this));

        // Manejar teclas de acceso rápido
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    /**
     * Configura el historial del navegador
     */
    setupHistory() {
        // Configurar estado inicial si no existe
        if (!window.history.state) {
            const initialState = {
                section: 'inventario',
                timestamp: Date.now()
            };
            window.history.replaceState(initialState, '', '#inventario');
        }
    }

    /**
     * Carga la sección inicial basada en la URL
     */
    loadInitialSection() {
        const hash = window.location.hash.substring(1);
        const defaultSection = 'inventario';
        
        let targetSection = defaultSection;
        
        if (hash && this.sections.has(hash)) {
            targetSection = hash;
        } else if (hash) {
            console.warn(`Sección "${hash}" no encontrada, usando "${defaultSection}" por defecto`);
        }
        
        // Cargar la sección
        this.loadSection(targetSection, false);
    }

    /**
     * Maneja clics en enlaces internos
     * @param {Event} event - Evento de clic
     */
    handleLinkClick(event) {
        // Verificar si es un enlace interno
        const link = event.target.closest('a[data-section], a[href^="#"]');
        if (!link) return;
        
        event.preventDefault();
        
        // Obtener la sección del enlace
        let sectionId;
        
        if (link.hasAttribute('data-section')) {
            sectionId = link.getAttribute('data-section');
        } else if (link.getAttribute('href').startsWith('#')) {
            sectionId = link.getAttribute('href').substring(1);
        }
        
        // Verificar si la sección existe
        if (!sectionId || !this.sections.has(sectionId)) {
            console.warn(`Sección "${sectionId}" no encontrada`);
            return;
        }
        
        // Cargar la sección
        this.loadSection(sectionId, true);
    }

    /**
     * Maneja cambios en el historial (back/forward)
     * @param {PopStateEvent} event - Evento de popstate
     */
    handlePopState(event) {
        if (event.state && event.state.section) {
            this.loadSection(event.state.section, false);
        }
    }

    /**
     * Maneja solicitudes de cambio de sección por evento
     * @param {CustomEvent} event - Evento de solicitud
     */
    handleSectionRequest(event) {
        const { sectionId, options = {} } = event.detail;
        
        if (sectionId && this.sections.has(sectionId)) {
            this.loadSection(sectionId, options.pushState !== false);
        }
    }

    /**
     * Maneja atajos de teclado
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + número para navegación rápida
        if (event.ctrlKey || event.metaKey) {
            const key = event.key;
            const sectionMap = {
                '1': 'inventario',
                '2': 'categorias',
                '3': 'añadir-productos',
                '4': 'resumen',
                '5': 'configuraciones'
            };
            
            if (sectionMap[key] && this.sections.has(sectionMap[key])) {
                event.preventDefault();
                this.loadSection(sectionMap[key], true);
            }
        }
    }

    /**
     * Carga una sección específica
     * @param {string} sectionId - ID de la sección
     * @param {boolean} pushState - Si debe actualizar el historial
     * @returns {Promise} Promise de la carga
     */
    async loadSection(sectionId, pushState = true) {
        // Verificar si ya estamos en esta sección
        if (this.currentSection === sectionId && this.isNavigating) {
            return;
        }
        
        // Verificar si la sección existe
        if (!this.sections.has(sectionId)) {
            console.error(`Sección "${sectionId}" no encontrada`);
            this.showError(`La sección "${sectionId}" no existe`);
            return;
        }
        
        // Prevenir múltiples navegaciones simultáneas
        if (this.isNavigating) {
            console.warn('Navegación en curso, ignorando solicitud');
            return;
        }
        
        this.isNavigating = true;
        
        try {
            // Mostrar indicador de carga
            this.showLoading();
            
            // Guardar sección anterior
            this.previousSection = this.currentSection;
            this.currentSection = sectionId;
            
            // Obtener información de la sección
            const section = this.sections.get(sectionId);
            
            // Verificar autenticación si es requerida
            if (section.requiresAuth && !this.isAuthenticated()) {
                this.handleUnauthorized();
                return;
            }
            
            // Cargar el contenido de la sección
            const content = await this.fetchSectionContent(section.path);
            
            // Actualizar el contenido principal
            await this.updateMainContent(content, sectionId);
            
            // Actualizar la navegación activa
            this.updateActiveNavigation(sectionId);
            
            // Actualizar el título de la página
            this.updatePageTitle(section.name);
            
            // Actualizar el historial si es necesario
            if (pushState) {
                this.updateHistory(sectionId);
            }
            
            // Disparar evento de sección cargada
            this.dispatchSectionLoaded(sectionId);
            
        } catch (error) {
            console.error(`Error cargando sección "${sectionId}":`, error);
            this.showError(`Error cargando la sección: ${error.message}`);
            
            // Revertir a la sección anterior
            if (this.previousSection) {
                this.currentSection = this.previousSection;
            }
            
        } finally {
            // Ocultar indicador de carga
            this.hideLoading();
            this.isNavigating = false;
        }
    }

    /**
     * Carga el contenido de una sección desde el servidor
     * @param {string} path - Ruta del archivo
     * @returns {Promise<string>} Contenido HTML
     */
    async fetchSectionContent(path) {
        try {
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.text();
            
        } catch (error) {
            // Intentar cargar desde cache o mostrar contenido de error
            const cached = this.getCachedSection(path);
            if (cached) {
                console.warn(`Usando contenido en caché para ${path}`);
                return cached;
            }
            
            throw error;
        }
    }

    /**
     * Actualiza el contenido principal de la aplicación
     * @param {string} content - Contenido HTML
     * @param {string} sectionId - ID de la sección
     */
    async updateMainContent(content, sectionId) {
        const mainContainer = document.getElementById('app-container');
        
        if (!mainContainer) {
            throw new Error('Contenedor principal no encontrado');
        }
        
        // Crear un contenedor temporal para la animación
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        tempContainer.style.opacity = '0';
        tempContainer.style.transition = 'opacity 0.3s ease';
        
        // Reemplazar contenido con animación
        mainContainer.innerHTML = '';
        mainContainer.appendChild(tempContainer);
        
        // Animar entrada
        await new Promise(resolve => {
            setTimeout(() => {
                tempContainer.style.opacity = '1';
                setTimeout(resolve, 300);
            }, 50);
        });
        
        // Ejecutar scripts dentro del contenido
        this.executeSectionScripts(tempContainer, sectionId);
        
        // Cachear el contenido
        this.cacheSection(sectionId, content);
    }

    /**
     * Ejecuta scripts dentro del contenido de una sección
     * @param {HTMLElement} container - Contenedor con el contenido
     * @param {string} sectionId - ID de la sección
     */
    executeSectionScripts(container, sectionId) {
        const scripts = container.querySelectorAll('script');
        
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            // Copiar atributos
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copiar contenido si es inline
            if (!script.src && script.textContent) {
                newScript.textContent = script.textContent;
            }
            
            // Marcar como script de sección
            newScript.dataset.section = sectionId;
            
            // Reemplazar el script original
            script.parentNode.replaceChild(newScript, script);
            
            // Ejecutar si es inline
            if (!script.src) {
                try {
                    // eslint-disable-next-line no-eval
                    eval(newScript.textContent);
                } catch (error) {
                    console.error(`Error ejecutando script inline de ${sectionId}:`, error);
                }
            }
        });
        
        // Actualizar iconos Lucide
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    /**
     * Actualiza la navegación activa
     * @param {string} sectionId - ID de la sección activa
     */
    updateActiveNavigation(sectionId) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
            
            // Remover indicador visual si existe
            const indicator = link.parentElement.querySelector('.nav-section-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        });
        
        // Agregar clase activa al enlace correspondiente
        const activeLinks = document.querySelectorAll(`[data-section="${sectionId}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
            
            // Mostrar indicador visual si existe
            const indicator = link.parentElement.querySelector('.nav-section-indicator');
            if (indicator) {
                indicator.style.display = 'block';
            }
        });
        
        // Actualizar menú móvil si está abierto
        this.updateMobileMenu(sectionId);
    }

    /**
     * Actualiza el menú móvil
     * @param {string} sectionId - ID de la sección activa
     */
    updateMobileMenu(sectionId) {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            const mobileLinks = mobileMenu.querySelectorAll('[data-section]');
            mobileLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
            });
        }
    }

    /**
     * Actualiza el título de la página
     * @param {string} sectionName - Nombre de la sección
     */
    updatePageTitle(sectionName) {
        const baseTitle = 'Jessica Boutique | ';
        document.title = baseTitle + sectionName;
    }

    /**
     * Actualiza el historial del navegador
     * @param {string} sectionId - ID de la sección
     */
    updateHistory(sectionId) {
        const state = {
            section: sectionId,
            timestamp: Date.now(),
            previous: this.previousSection
        };
        
        window.history.pushState(state, '', `#${sectionId}`);
    }

    /**
     * Muestra el indicador de carga
     */
    showLoading() {
        // Crear o mostrar overlay de carga
        let loader = document.getElementById('navigation-loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'navigation-loader';
            loader.className = 'fixed top-0 left-0 w-full h-1 bg-pink-500 z-[9999]';
            loader.innerHTML = `
                <div class="h-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse"></div>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.display = 'block';
    }

    /**
     * Oculta el indicador de carga
     */
    hideLoading() {
        const loader = document.getElementById('navigation-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Muestra un error de navegación
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        // Mostrar toast si está disponible
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        } else {
            // Fallback: alerta simple
            alert(message);
        }
    }

    /**
     * Dispara evento de sección cargada
     * @param {string} sectionId - ID de la sección
     */
    dispatchSectionLoaded(sectionId) {
        const event = new CustomEvent('section:loaded', {
            detail: {
                sectionId,
                timestamp: Date.now(),
                previous: this.previousSection
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} True si está autenticado
     */
    isAuthenticated() {
        // Implementar lógica de autenticación real
        // Por ahora siempre retorna true para desarrollo
        return true;
    }

    /**
     * Maneja acceso no autorizado
     */
    handleUnauthorized() {
        // Redirigir a login o mostrar modal
        console.warn('Acceso no autorizado');
        
        if (typeof window.showModal === 'function') {
            const loginModal = `
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Acceso Requerido</h3>
                    <p class="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta sección.</p>
                    <div class="flex justify-end">
                        <button onclick="closeModal()" class="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            `;
            window.showModal(loginModal);
        }
    }

    /**
     * Cachea el contenido de una sección
     * @param {string} sectionId - ID de la sección
     * @param {string} content - Contenido HTML
     */
    cacheSection(sectionId, content) {
        try {
            const cacheKey = `section_cache_${sectionId}`;
            const cacheData = {
                content,
                timestamp: Date.now(),
                expires: Date.now() + (5 * 60 * 1000) // 5 minutos
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Error cacheando sección:', error);
        }
    }

    /**
     * Obtiene contenido cacheado de una sección
     * @param {string} sectionId - ID de la sección
     * @returns {string|null} Contenido cacheado o null
     */
    getCachedSection(sectionId) {
        try {
            const cacheKey = `section_cache_${sectionId}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Verificar si expiró
            if (cacheData.expires < Date.now()) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.content;
        } catch (error) {
            console.warn('Error obteniendo sección cacheada:', error);
            return null;
        }
    }

    /**
     * Limpia el cache de secciones
     */
    clearSectionCache() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('section_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Navega a la sección anterior
     */
    goBack() {
        if (this.previousSection) {
            this.loadSection(this.previousSection, true);
        } else {
            window.history.back();
        }
    }

    /**
     * Navega a la sección siguiente
     */
    goForward() {
        window.history.forward();
    }

    /**
     * Obtiene la sección actual
     * @returns {string} ID de la sección actual
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Obtiene la sección anterior
     * @returns {string} ID de la sección anterior
     */
    getPreviousSection() {
        return this.previousSection;
    }

    /**
     * Verifica si una sección existe
     * @param {string} sectionId - ID de la sección
     * @returns {boolean} True si existe
     */
    sectionExists(sectionId) {
        return this.sections.has(sectionId);
    }

    /**
     * Registra una nueva sección dinámicamente
     * @param {string} sectionId - ID de la sección
     * @param {Object} sectionData - Datos de la sección
     */
    registerSection(sectionId, sectionData) {
        if (this.sections.has(sectionId)) {
            console.warn(`Sección "${sectionId}" ya existe, actualizando...`);
        }
        
        this.sections.set(sectionId, {
            name: sectionData.name || sectionId,
            path: sectionData.path || `sections/${sectionId}.html`,
            requiresAuth: sectionData.requiresAuth !== false,
            icon: sectionData.icon || 'file'
        });
        
        console.log(`Sección "${sectionId}" registrada`);
    }

    /**
     * Desregistra una sección
     * @param {string} sectionId - ID de la sección
     */
    unregisterSection(sectionId) {
        if (this.sections.has(sectionId)) {
            this.sections.delete(sectionId);
            console.log(`Sección "${sectionId}" desregistrada`);
        }
    }
}

// ==================== INICIALIZACIÓN ====================
let navigationInstance = null;

/**
 * Inicializa el sistema de navegación
 * @returns {NavigationSystem} Instancia del sistema de navegación
 */
function initNavigation() {
    if (!navigationInstance) {
        navigationInstance = new NavigationSystem();
        window.navigation = navigationInstance;
        console.log('Sistema de navegación inicializado');
    }
    return navigationInstance;
}

/**
 * Carga una sección específica (función global)
 * @param {string} sectionId - ID de la sección
 * @param {boolean} pushState - Si debe actualizar el historial
 */
window.loadSection = function(sectionId, pushState = true) {
    if (!navigationInstance) {
        console.error('Sistema de navegación no inicializado');
        return;
    }
    navigationInstance.loadSection(sectionId, pushState);
};

/**
 * Navega a la sección anterior
 */
window.goBack = function() {
    if (navigationInstance) {
        navigationInstance.goBack();
    } else {
        window.history.back();
    }
};

/**
 * Navega a la sección siguiente
 */
window.goForward = function() {
    if (navigationInstance) {
        navigationInstance.goForward();
    } else {
        window.history.forward();
    }
};

/**
 * Obtiene la sección actual
 * @returns {string} ID de la sección actual
 */
window.getCurrentSection = function() {
    return navigationInstance ? navigationInstance.getCurrentSection() : null;
};

// ==================== EVENTOS GLOBALES ====================
// Evento para solicitar cambio de sección
window.dispatchSectionRequest = function(sectionId, options = {}) {
    const event = new CustomEvent('section:request', {
        detail: { sectionId, options }
    });
    window.dispatchEvent(event);
};

// ==================== INICIALIZACIÓN AUTOMÁTICA ====================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar navegación cuando el DOM esté listo
    setTimeout(() => {
        initNavigation();
    }, 100);
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NavigationSystem,
        initNavigation,
        loadSection: window.loadSection,
        goBack: window.goBack,
        goForward: window.goForward,
        getCurrentSection: window.getCurrentSection
    };
}