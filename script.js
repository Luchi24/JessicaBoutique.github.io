// Sistema Jessica Boutique - Versión con navegación por URL/href
class JessicaBoutique {
    constructor() {
        // Inicializar datos principales
        this.products = JSON.parse(localStorage.getItem('jb_products')) || this.getSampleProducts();
        this.categories = JSON.parse(localStorage.getItem('jb_categories')) || this.getSampleCategories();
        this.colors = JSON.parse(localStorage.getItem('jb_colors')) || this.getSampleColors();
        this.sizes = JSON.parse(localStorage.getItem('jb_sizes')) || this.getSampleSizes();
        this.pantsSizes = JSON.parse(localStorage.getItem('jb_pantsSizes')) || this.getSamplePantsSizes();
        this.sales = JSON.parse(localStorage.getItem('jb_sales')) || [];
        this.clients = JSON.parse(localStorage.getItem('jb_clients')) || [];
        
        // Nuevos datos para mejoras
        this.suppliers = JSON.parse(localStorage.getItem('jb_suppliers')) || [];
        this.promotions = JSON.parse(localStorage.getItem('jb_promotions')) || [];
        this.reminders = JSON.parse(localStorage.getItem('jb_reminders')) || [];
        this.reports = JSON.parse(localStorage.getItem('jb_reports')) || [];
        this.changes = JSON.parse(localStorage.getItem('jb_changes')) || [];
        this.tags = JSON.parse(localStorage.getItem('jb_tags')) || ['nuevo', 'oferta', 'tendencia', 'limitado'];
        this.productHistory = JSON.parse(localStorage.getItem('jb_productHistory')) || [];
        
        // Estado actual
        this.currentPage = 1;
        this.productsPerPage = 10;
        this.filteredProducts = [...this.products];
        this.currentCart = [];
        this.currentSale = null;
        this.currentVariants = [];
        this.pendingAction = null;
        
        // Variables para navegación por URL
        this.currentHash = window.location.hash.substring(1) || 'dashboard';
        this.urlParams = new URLSearchParams(window.location.search);
        
        // Inicializar
        this.init();
    }

    // ============ INICIALIZACIÓN ============
    init() {
        this.applyDarkMode();
        this.setupEventListeners();
        this.loadInitialData();
        this.updateDashboard();
        this.updateCurrentDate();
        this.setupKeyboardShortcuts();
        this.setupOfflineSync();
        this.setupAutoBackup();
        this.setupReminders();
        this.checkStockAlerts();
        
        // Manejar navegación por URL
        this.handleURLNavigation();
        
        this.showToast('¡Bienvenida a Jessica Boutique! Sistema mejorado cargado.', 'success');
    }

    // ============ MANEJO DE NAVEGACIÓN POR URL ============
    handleURLNavigation() {
        // Escuchar cambios en el hash de la URL
        window.addEventListener('hashchange', () => {
            this.currentHash = window.location.hash.substring(1) || 'dashboard';
            this.urlParams = new URLSearchParams(window.location.search);
            this.navigateToSection(this.currentHash);
        });

        // Navegar a la sección actual al cargar la página
        this.navigateToSection(this.currentHash);
    }

    navigateToSection(hash) {
        // Parsear el hash para obtener la sección y parámetros
        const [section, params] = hash.includes('?') ? 
            hash.split('?') : [hash, ''];
        
        // Actualizar parámetros de URL
        this.urlParams = new URLSearchParams(params);
        
        // Navegar a la sección
        this.showSection(section);
        
        // Aplicar parámetros de URL si existen
        this.applyURLParams(section);
    }

    applyURLParams(section) {
        // Aplicar parámetros específicos para cada sección
        switch(section) {
            case 'inventario':
                this.applyInventoryURLParams();
                break;
            case 'ventas':
                this.applySalesURLParams();
                break;
            case 'agregar':
                this.applyAddProductURLParams();
                break;
            case 'estadisticas':
                this.applyStatsURLParams();
                break;
            case 'configuracion':
                this.applyConfigURLParams();
                break;
        }
    }

    applyInventoryURLParams() {
        // Aplicar filtros desde URL
        const filter = this.urlParams.get('filter');
        const sort = this.urlParams.get('sort');
        const page = this.urlParams.get('page');
        
        if (filter) {
            document.getElementById('filterStatus').value = filter;
        }
        
        if (sort) {
            document.getElementById('sortBy').value = sort;
        }
        
        if (page) {
            this.currentPage = parseInt(page);
        }
        
        // Aplicar filtros
        if (filter || sort) {
            setTimeout(() => {
                this.applyFilters();
                this.updatePagination();
            }, 100);
        }
    }

    applySalesURLParams() {
        const newSale = this.urlParams.get('new');
        if (newSale === 'true') {
            this.newSale();
        }
    }

    applyAddProductURLParams() {
        // Parámetros para agregar producto rápido
        const quickAdd = this.urlParams.get('quick');
        if (quickAdd) {
            // Rellenar formulario rápido basado en parámetros
            const category = this.urlParams.get('category');
            const price = this.urlParams.get('price');
            
            if (category) {
                document.getElementById('productCategory').value = category;
                this.updateSizeOptions({target: document.getElementById('productCategory')});
            }
            
            if (price) {
                document.getElementById('salePrice').value = price;
                this.calculateProfitMargin();
            }
        }
    }

    applyStatsURLParams() {
        const metric = this.urlParams.get('metric');
        const period = this.urlParams.get('period');
        
        if (period) {
            document.getElementById('statsPeriod').value = period;
            this.loadStatistics();
        }
    }

    applyConfigURLParams() {
        const tab = this.urlParams.get('tab');
        if (tab) {
            // Activar la pestaña correspondiente
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
            if (tabBtn) {
                tabBtn.click();
            }
        }
    }

    updateURL(section, params = {}) {
        // Construir nueva URL
        let newHash = section;
        const paramString = new URLSearchParams(params).toString();
        
        if (paramString) {
            newHash += '?' + paramString;
        }
        
        // Actualizar hash sin disparar recarga
        window.history.pushState(null, null, '#' + newHash);
        this.currentHash = newHash;
        this.urlParams = new URLSearchParams(paramString);
    }

    // ============ NAVEGACIÓN MEJORADA ============
    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remover activo de todos los items del menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Mostrar sección seleccionada
        const section = document.getElementById(`${sectionId}-section`);
        const menuItem = document.querySelector(`.menu-item[href="#${sectionId}"]`);
        
        if (section && menuItem) {
            section.classList.add('active');
            menuItem.classList.add('active');
            
            // Actualizar título
            this.updatePageTitle(sectionId);
            
            // Actualizar URL si es diferente a la actual
            if (!this.currentHash.startsWith(sectionId)) {
                this.updateURL(sectionId);
            }
            
            // Ejecutar acciones específicas de la sección
            switch(sectionId) {
                case 'dashboard':
                    this.updateDashboard();
                    break;
                case 'inventario':
                    this.loadInventory();
                    break;
                case 'agregar':
                    this.resetProductForm();
                    break;
                case 'ventas':
                    this.loadSalesHistory();
                    if (this.urlParams.get('new') === 'true') {
                        this.newSale();
                    }
                    break;
                case 'estadisticas':
                    this.loadStatistics();
                    break;
                case 'configuracion':
                    this.loadConfigLists();
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
                case 'notificaciones':
                    this.showNotifications();
                    break;
            }
        } else if (sectionId === 'close') {
            // Cerrar modales
            this.closeModal();
        } else if (sectionId.startsWith('inventario')) {
            // Si es una sub-navegación del inventario
            this.showSection('inventario');
        } else {
            // Si la sección no existe, mostrar dashboard
            this.showSection('dashboard');
        }
    }

    updatePageTitle(section) {
        const titles = {
            'dashboard': 'Panel',
            'inventario': 'Inventario',
            'agregar': 'Agregar Producto',
            'ventas': 'Ventas',
            'estadisticas': 'Estadísticas',
            'configuracion': 'Configuración',
            'logout': 'Cerrar Sesión',
            'notificaciones': 'Notificaciones'
        };
        
        const subtitles = {
            'dashboard': 'Resumen de tu negocio',
            'inventario': 'Gestiona todos tus productos',
            'agregar': 'Agrega nuevos productos al inventario',
            'ventas': 'Registra y consulta ventas',
            'estadisticas': 'Analiza el rendimiento de tu negocio',
            'configuracion': 'Personaliza tu sistema',
            'logout': 'Salir del sistema de manera segura',
            'notificaciones': 'Ver todas las notificaciones'
        };
        
        document.getElementById('pageTitle').textContent = titles[section] || 'Panel';
        document.getElementById('pageSubtitle').textContent = subtitles[section] || 'Bienvenida al sistema';
    }

    // ============ EVENT LISTENERS MEJORADOS ============
    setupEventListeners() {
        // Menu toggle para móviles
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        // Cerrar sidebar al hacer clic en un item en móviles
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    document.querySelector('.sidebar').classList.remove('active');
                }
            });
        });

        // Manejar clics en enlaces de navegación
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                // Manejar enlaces especiales
                if (href === '#logout') {
                    this.handleLogout();
                    return;
                }
                
                if (href === '#notificaciones') {
                    this.showNotifications();
                    return;
                }
                
                // Navegación normal
                const hash = href.substring(1);
                this.navigateToSection(hash);
            }
        });

        // Inventario
        document.getElementById('searchInventory')?.addEventListener('input', () => {
            this.searchProducts();
            this.updateURL('inventario', { search: document.getElementById('searchInventory').value });
        });
        
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
            // Actualizar URL con filtros
            const filters = {
                category: document.getElementById('filterCategory').value,
                status: document.getElementById('filterStatus').value,
                sort: document.getElementById('sortBy').value
            };
            this.updateURL('inventario', filters);
        });
        
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearFilters();
            this.updateURL('inventario');
        });
        
        document.getElementById('exportInventory')?.addEventListener('click', () => this.exportInventory());
        document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
        document.getElementById('sortBy')?.addEventListener('change', () => this.applyFilters());

        // Agregar Producto
        document.getElementById('productForm')?.addEventListener('submit', (e) => this.saveProduct(e));
        document.getElementById('productCategory')?.addEventListener('change', (e) => this.updateSizeOptions(e));
        document.getElementById('purchasePrice')?.addEventListener('input', () => this.calculateProfitMargin());
        document.getElementById('salePrice')?.addEventListener('input', () => this.calculateProfitMargin());
        document.getElementById('addVariantBtn')?.addEventListener('click', () => this.addVariant());

        // Ventas
        document.getElementById('addProductBtn')?.addEventListener('click', () => this.addToCart());
        document.getElementById('processSale')?.addEventListener('click', () => this.processSale());
        document.getElementById('clearSale')?.addEventListener('click', () => this.clearCart());
        document.getElementById('newSaleBtn')?.addEventListener('click', () => {
            this.updateURL('ventas', { new: 'true' });
            this.newSale();
        });
        
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePaymentSummary());
        });

        // Configuración
        document.getElementById('addCategory')?.addEventListener('click', () => this.addNewCategory());
        document.getElementById('addColor')?.addEventListener('click', () => this.addNewColor());
        document.getElementById('addSize')?.addEventListener('click', () => this.addNewSize());
        document.getElementById('addPantsSize')?.addEventListener('click', () => this.addNewPantsSize());
        document.getElementById('darkModeToggle')?.addEventListener('change', () => this.toggleDarkMode());
        document.getElementById('exportData')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('importData')?.addEventListener('click', () => this.importData());
        document.getElementById('clearData')?.addEventListener('click', () => this.confirmClearData());

        // Modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        document.getElementById('cancelConfirm')?.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmAction')?.addEventListener('click', () => this.executeConfirmAction());
        
        // Pestañas de configuración
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.currentTarget.dataset.tab;
                this.switchConfigTab(e);
                this.updateURL('configuracion', { tab: tabId });
            });
        });

        // Estadísticas
        document.getElementById('statsPeriod')?.addEventListener('change', () => {
            this.loadStatistics();
            this.updateURL('estadisticas', { period: document.getElementById('statsPeriod').value });
        });
        
        // Detectar conexión
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());
        
        // Prevenir envío de formulario por defecto
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM' && !e.target.id.includes('ajax')) {
                e.preventDefault();
            }
        });
    }

    // ============ MANEJO DE LOGOUT ============
    handleLogout() {
        this.showConfirmation(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            () => {
                // Guardar datos antes de cerrar
                this.saveAllData();
                
                // Mostrar mensaje de despedida
                this.showToast('Sesión cerrada correctamente', 'success');
                
                // Redireccionar después de 2 segundos
                setTimeout(() => {
                    // En una aplicación real, aquí redireccionarías al login
                    // window.location.href = 'login.html';
                    
                    // Por ahora, solo recargamos la página
                    window.location.reload();
                }, 2000);
            }
        );
    }

    // ============ PAGINACIÓN CON URL ============
    goToPage(page) {
        this.currentPage = page;
        this.renderInventoryTable();
        this.updatePagination();
        this.updateURL('inventario', { page: page });
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderInventoryTable();
            this.updatePagination();
            this.updateURL('inventario', { page: this.currentPage });
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderInventoryTable();
            this.updatePagination();
            this.updateURL('inventario', { page: this.currentPage });
        }
    }

    // ============ MÉTODOS ACTUALIZADOS PARA URL ============
    loadInventory() {
        // Verificar si hay parámetros de URL para aplicar
        const urlPage = this.urlParams.get('page');
        const urlFilter = this.urlParams.get('filter');
        const urlSort = this.urlParams.get('sort');
        
        this.filteredProducts = [...this.products];
        
        if (urlPage) {
            this.currentPage = parseInt(urlPage);
        } else {
            this.currentPage = 1;
        }
        
        if (urlFilter) {
            document.getElementById('filterStatus').value = urlFilter;
        }
        
        if (urlSort) {
            document.getElementById('sortBy').value = urlSort;
        }
        
        // Aplicar filtros si hay parámetros
        if (urlFilter || urlSort) {
            setTimeout(() => this.applyFilters(), 100);
        } else {
            this.renderInventoryTable();
            this.updateInventorySummary();
            this.updatePagination();
        }
    }

    applyFilters() {
        const category = document.getElementById('filterCategory').value;
        const color = document.getElementById('filterColor')?.value || '';
        const brand = document.getElementById('filterBrand')?.value || '';
        const status = document.getElementById('filterStatus').value;
        const sortBy = document.getElementById('sortBy')?.value || '';
        const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
        
        this.filteredProducts = this.products.filter(product => {
            if (category && product.category !== category) return false;
            if (color && product.color !== color) return false;
            if (brand && product.brand !== brand) return false;
            if (status && product.status !== status) return false;
            if (searchTerm && !(
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.color.toLowerCase().includes(searchTerm)
            )) return false;
            return true;
        });
        
        // Ordenar
        if (sortBy) {
            this.sortProducts(sortBy);
        }
        
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updatePagination();
        this.updateInventorySummary();
    }

    // ============ MÉTODOS DE NAVEGACIÓN ESPECÍFICOS ============
    navigateToProductEdit(productId) {
        this.updateURL('inventario', { edit: productId });
        this.editProduct(productId);
    }

    navigateToSaleDetails(saleId) {
        this.updateURL('ventas', { details: saleId });
        this.viewSaleDetails(saleId);
    }

    navigateToQuickAdd(category, price) {
        this.updateURL('agregar', { 
            quick: 'true',
            category: category,
            price: price 
        });
        this.showSection('agregar');
    }

    // ============ MANEJO DE MODALES CON URL ============
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            
            // Agregar hash para modal
            window.history.pushState(null, null, `#modal=${modalId}`);
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modalOverlay').classList.remove('active');
        
        // Restaurar hash anterior
        const previousHash = this.currentHash;
        window.history.pushState(null, null, `#${previousHash}`);
    }

    // ============ GENERACIÓN DE ENLACES DINÁMICOS ============
    generateProductLink(productId, action = 'view') {
        return `#inventario?${action}=${productId}`;
    }

    generateSaleLink(saleId) {
        return `#ventas?details=${saleId}`;
    }

    generateFilterLink(filterType, value) {
        return `#inventario?${filterType}=${value}`;
    }

    // ============ MÉTODOS PARA BOTONES DINÁMICOS ============
    createActionButton(action, id, text, icon = '') {
        const button = document.createElement('a');
        button.href = this.generateActionLink(action, id);
        button.className = `btn-action btn-${action}`;
        button.innerHTML = icon ? `<i class="fas fa-${icon}"></i> ${text}` : text;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAction(action, id);
        });
        
        return button;
    }

    generateActionLink(action, id) {
        const actionMap = {
            'edit': `#inventario?edit=${id}`,
            'delete': `#inventario?delete=${id}`,
            'view': `#inventario?view=${id}`,
            'sale': `#ventas?sale=${id}`,
            'details': `#ventas?details=${id}`
        };
        
        return actionMap[action] || '#';
    }

    handleAction(action, id) {
        switch(action) {
            case 'edit':
                this.editProduct(id);
                break;
            case 'delete':
                this.deleteProduct(id);
                break;
            case 'view':
                this.viewProductDetails(id);
                break;
            case 'sale':
                this.addToSale(id);
                break;
            case 'details':
                this.viewSaleDetails(id);
                break;
        }
    }

    // ============ RENDERIZADO DE TABLAS CON ENLACES ============
    renderInventoryTable() {
        const container = document.getElementById('inventoryTable');
        if (!container) return;
        
        const start = (this.currentPage - 1) * this.productsPerPage;
        const end = start + this.productsPerPage;
        const currentProducts = this.filteredProducts.slice(start, end);
        
        if (currentProducts.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px;">
                        <i class="fas fa-box-open" style="font-size: 48px; color: #ddd;"></i>
                        <p style="color: #999; margin-top: 10px;">No se encontraron productos</p>
                        <a href="#agregar" class="btn-primary" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Agregar Primer Producto
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = currentProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <a href="${this.generateProductLink(product.id, 'view')}" class="product-link">
                        <strong>${product.name}</strong>
                        <small style="display: block; color: #666;">${product.brand}</small>
                    </a>
                </td>
                <td>
                    <a href="${this.generateFilterLink('category', product.category)}" class="category-link">
                        ${product.category}
                    </a>
                </td>
                <td>${product.brand}</td>
                <td>
                    <a href="${this.generateFilterLink('color', product.color)}" class="color-link">
                        ${product.color}
                    </a>
                </td>
                <td>${product.stock}</td>
                <td>${this.formatCurrency(product.salePrice)}</td>
                <td>
                    <a href="${this.generateFilterLink('status', product.status)}" class="status-link">
                        <span class="status-badge ${product.status}">${this.getStatusText(product.status)}</span>
                    </a>
                </td>
                <td class="table-actions">
                    <a href="${this.generateActionLink('edit', product.id)}" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="${this.generateActionLink('delete', product.id)}" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </a>
                    <a href="${this.generateActionLink('view', product.id)}" class="btn-info">
                        <i class="fas fa-eye"></i>
                    </a>
                </td>
            </tr>
        `).join('');
        
        // Agregar event listeners a los enlaces
        container.querySelectorAll('.product-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(link.closest('tr').querySelector('td:first-child').textContent);
                this.viewProductDetails(productId);
            });
        });
        
        container.querySelectorAll('.category-link, .color-link, .status-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateToSection(href.substring(1));
            });
        });
    }

    // ============ MÉTODOS RESTANTES (SIMILARES AL ANTERIOR) ============
    // [Aquí irían todos los otros métodos del sistema que no cambiaron]
    // Solo se muestran los cambios principales relacionados con href/src
    
    // ============ MANEJO DE ENLACES EXTERNOS ============
    setupExternalLinks() {
        // Manejar clics en enlaces externos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (link) {
                e.preventDefault();
                window.open(link.href, '_blank');
            }
        });
    }

    // ============ GENERACIÓN DE REPORTES CON ENLACES ============
    generateReportLink(reportType, params = {}) {
        const baseURL = window.location.origin + window.location.pathname;
        const hash = `#reporte?type=${reportType}&${new URLSearchParams(params).toString()}`;
        return `${baseURL}${hash}`;
    }

    // ============ COMPARTIR ENLACES ============
    shareCurrentView() {
        const currentURL = window.location.href;
        
        // Crear enlace compartible
        const shareData = {
            title: 'Jessica Boutique - Vista Actual',
            text: 'Mira esta vista en Jessica Boutique',
            url: currentURL
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => this.showToast('Vista compartida', 'success'))
                .catch(() => this.copyToClipboard(currentURL));
        } else {
            this.copyToClipboard(currentURL);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('Enlace copiado al portapapeles', 'success'))
            .catch(() => {
                // Fallback para navegadores antiguos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Enlace copiado al portapapeles', 'success');
            });
    }

    // ============ MÉTODOS PARA DESCARGAS CON ENLACES ============
    createDownloadLink(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar memoria
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // ============ REDIRECCIONES CONDICIONALES ============
    redirectIfNeeded() {
        // Verificar si el usuario debe ser redirigido
        const lastAction = localStorage.getItem('jb_lastAction');
        const redirectTo = localStorage.getItem('jb_redirectTo');
        
        if (redirectTo && lastAction && (Date.now() - parseInt(lastAction)) < 5000) {
            this.navigateToSection(redirectTo);
            localStorage.removeItem('jb_redirectTo');
            localStorage.removeItem('jb_lastAction');
        }
    }

    setRedirect(target, delay = 1000) {
        localStorage.setItem('jb_redirectTo', target);
        localStorage.setItem('jb_lastAction', Date.now().toString());
        
        setTimeout(() => {
            this.redirectIfNeeded();
        }, delay);
    }

    // ============ MÉTODOS PARA BOOKMARKS ============
    saveBookmark(name, section, params = {}) {
        const bookmarks = JSON.parse(localStorage.getItem('jb_bookmarks')) || [];
        const bookmark = {
            id: Date.now(),
            name,
            section,
            params,
            createdAt: new Date().toISOString()
        };
        
        bookmarks.push(bookmark);
        localStorage.setItem('jb_bookmarks', JSON.stringify(bookmarks));
        this.showToast('Bookmark guardado', 'success');
    }

    loadBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('jb_bookmarks')) || [];
        return bookmarks;
    }

    createBookmarkLink(bookmark) {
        const params = new URLSearchParams(bookmark.params).toString();
        return `#${bookmark.section}${params ? '?' + params : ''}`;
    }

    // ============ MÉTODOS DE HISTORIAL ============
    addToHistory(section, params = {}) {
        const history = JSON.parse(localStorage.getItem('jb_navigationHistory')) || [];
        const historyItem = {
            section,
            params,
            timestamp: new Date().toISOString()
        };
        
        // Mantener solo los últimos 50 items
        history.unshift(historyItem);
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('jb_navigationHistory', JSON.stringify(history));
    }

    getNavigationHistory() {
        return JSON.parse(localStorage.getItem('jb_navigationHistory')) || [];
    }

    goBack() {
        const history = this.getNavigationHistory();
        if (history.length > 1) {
            const previous = history[1]; // El actual es history[0]
            this.navigateToSection(previous.section);
        }
    }

    // ============ MÉTODOS PARA SITEMAP DINÁMICO ============
    generateSitemapLinks() {
        const sections = [
            { id: 'dashboard', title: 'Panel Principal' },
            { id: 'inventario', title: 'Inventario' },
            { id: 'agregar', title: 'Agregar Producto' },
            { id: 'ventas', title: 'Ventas' },
            { id: 'estadisticas', title: 'Estadísticas' },
            { id: 'configuracion', title: 'Configuración' }
        ];
        
        const filters = [
            { type: 'filter', value: 'low', title: 'Productos con Stock Bajo' },
            { type: 'filter', value: 'out', title: 'Productos Agotados' },
            { type: 'sort', value: 'price', title: 'Productos por Precio' },
            { type: 'sort', value: 'stock', title: 'Productos por Stock' }
        ];
        
        let sitemapHTML = '<div class="sitemap"><h3>Mapa del Sitio</h3>';
        
        // Secciones principales
        sitemapHTML += '<h4>Secciones Principales</h4><ul>';
        sections.forEach(section => {
            sitemapHTML += `<li><a href="#${section.id}">${section.title}</a></li>`;
        });
        sitemapHTML += '</ul>';
        
        // Vistas filtradas
        sitemapHTML += '<h4>Vistas Filtradas</h4><ul>';
        filters.forEach(filter => {
            sitemapHTML += `<li><a href="#inventario?${filter.type}=${filter.value}">${filter.title}</a></li>`;
        });
        sitemapHTML += '</ul>';
        
        // Reportes
        sitemapHTML += '<h4>Reportes</h4><ul>';
        sitemapHTML += `<li><a href="${this.generateReportLink('inventario')}">Reporte de Inventario</a></li>`;
        sitemapHTML += `<li><a href="${this.generateReportLink('ventas')}">Reporte de Ventas</a></li>`;
        sitemapHTML += `<li><a href="${this.generateReportLink('estadisticas')}">Reporte de Estadísticas</a></li>`;
        sitemapHTML += '</ul></div>';
        
        return sitemapHTML;
    }

    showSitemap() {
        const modal = document.getElementById('sitemapModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = this.generateSitemapLinks();
        this.showModal('sitemapModal');
    }
}

// Inicializar sistema
let system;
document.addEventListener('DOMContentLoaded', () => {
    system = new JessicaBoutique();
    
    // Agregar botón de sitemap
    const sitemapBtn = document.createElement('a');
    sitemapBtn.href = '#sitemap';
    sitemapBtn.className = 'btn-secondary';
    sitemapBtn.innerHTML = '<i class="fas fa-sitemap"></i> Mapa del Sitio';
    sitemapBtn.style.position = 'fixed';
    sitemapBtn.style.bottom = '20px';
    sitemapBtn.style.right = '20px';
    sitemapBtn.style.zIndex = '1000';
    
    sitemapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        system.showSitemap();
    });
    
    document.body.appendChild(sitemapBtn);
    
    // Mostrar recordatorio de bienvenida
    setTimeout(() => {
        if (!localStorage.getItem('jb_firstVisit')) {
            system.showTutorial();
            localStorage.setItem('jb_firstVisit', 'true');
        }
    }, 2000);
});

// Hacer funciones globales disponibles
window.system = system;

// Agregar funcionalidades globales
window.addEventListener('load', () => {
    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error registrando Service Worker:', error);
            });
    }
    
    // Configurar atajos globales
    document.addEventListener('keydown', (e) => {
        // F5: Actualizar dashboard
        if (e.key === 'F5') {
            e.preventDefault();
            system.updateDashboard();
            system.showToast('Dashboard actualizado', 'info');
        }
        
        // Ctrl + H: Historial
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            system.showNavigationHistory();
        }
        
        // Ctrl + B: Bookmarks
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            system.showBookmarks();
        }
        
        // Ctrl + S: Sitemap
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            system.showSitemap();
        }
    });
    
    // Manejar botones de navegación del navegador
    window.addEventListener('popstate', () => {
        system.redirectIfNeeded();
    });
});