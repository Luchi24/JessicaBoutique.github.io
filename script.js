// Sistema Jessica Boutique - Versión Mejorada y Completa
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
        
        // Variables para nuevas funcionalidades
        this.isOffline = !navigator.onLine;
        this.voiceRecognition = null;
        this.lastBackup = localStorage.getItem('jb_lastBackup');
        this.isPresentationMode = false;
        
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
        this.showToast('¡Bienvenida a Jessica Boutique! Sistema mejorado cargado.', 'success');
        
        // Inicializar PWA
        this.setupPWA();
    }

    applyDarkMode() {
        const darkMode = localStorage.getItem('jb_darkMode') === 'true';
        const toggle = document.getElementById('darkModeToggle');
        
        if (toggle) {
            toggle.checked = darkMode;
        }
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

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

        // Navegación
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Botones de acción rápida
        document.querySelectorAll('.btn-quick-action, .action-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section) this.showSection(section);
            });
        });

        // Notificaciones
        document.querySelector('.btn-notification')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showNotifications();
        });

        // Inventario
        document.getElementById('searchInventory')?.addEventListener('input', () => this.searchProducts());
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
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
        document.getElementById('newSaleBtn')?.addEventListener('click', () => this.newSale());
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

        // Nuevos eventos para mejoras
        document.getElementById('voiceSearchBtn')?.addEventListener('click', () => this.startVoiceSearch());
        document.getElementById('pwaInstall')?.addEventListener('click', () => this.installPWA());
        document.getElementById('pwaCancel')?.addEventListener('click', () => this.hidePWAPrompt());
        document.getElementById('startTutorial')?.addEventListener('click', () => this.showTutorial());
        document.getElementById('enablePresentation')?.addEventListener('click', () => this.enablePresentationMode());
        
        // Modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        document.getElementById('cancelConfirm')?.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmAction')?.addEventListener('click', () => this.executeConfirmAction());
        
        // Pestañas de configuración
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchConfigTab(e));
        });

        // Estadísticas
        document.getElementById('statsPeriod')?.addEventListener('change', () => this.loadStatistics());
        
        // Detectar conexión
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());
    }

    loadInitialData() {
        // Cargar selects
        this.loadCategories();
        this.loadColors();
        this.loadSizes();
        this.loadProductsForSale();
        this.loadRecentProducts();
        this.loadSalesHistory();
        this.loadConfigLists();
        this.loadBrands();
        this.loadFilterColors();
        
        // Cargar nuevos datos
        this.loadSuppliers();
        this.loadPromotions();
        this.loadTags();
    }

    // ============ DATOS DE EJEMPLO ============
    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Vestido Elegante Negro",
                category: "Vestidos",
                brand: "Zara",
                color: "Negro",
                size: "M",
                purchasePrice: 45.00,
                salePrice: 89.99,
                stock: 12,
                minStock: 5,
                status: "available",
                tags: ["nuevo", "tendencia"],
                barcode: "8901234567890",
                supplier: "Distribuidora Moda S.A.",
                createdAt: "2023-12-01"
            },
            {
                id: 2,
                name: "Jeans Slim Fit",
                category: "Pantalones",
                brand: "H&M",
                color: "Azul",
                size: "32",
                purchasePrice: 25.50,
                salePrice: 49.99,
                stock: 8,
                minStock: 3,
                status: "available",
                tags: ["oferta"],
                barcode: "8901234567891",
                supplier: "Jeans Factory",
                createdAt: "2023-12-05"
            },
            {
                id: 3,
                name: "Blusa de Seda Blanca",
                category: "Blusas",
                brand: "Mango",
                color: "Blanco",
                size: "S",
                purchasePrice: 18.75,
                salePrice: 39.99,
                stock: 3,
                minStock: 5,
                status: "low",
                tags: ["elegante"],
                barcode: "8901234567892",
                supplier: "Textiles del Sur",
                createdAt: "2023-12-10"
            }
        ];
    }

    getSampleCategories() {
        return ["Vestidos", "Pantalones", "Blusas", "Faldas", "Chaquetas", "Accesorios"];
    }

    getSampleColors() {
        return ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Rosa", "Morado", "Amarillo"];
    }

    getSampleSizes() {
        return ["XS", "S", "M", "L", "XL"];
    }

    getSamplePantsSizes() {
        return ["28", "30", "32", "34", "36", "38"];
    }

    // ============ UTILIDADES ============
    formatCurrency(amount) {
        return `S/. ${amount.toFixed(2)}`;
    }

    generateId() {
        const maxId = this.products.reduce((max, p) => Math.max(max, p.id || 0), 0);
        return maxId + 1;
    }

    getStatusText(status) {
        const texts = {
            'available': 'Disponible',
            'low': 'Stock Bajo',
            'out': 'Agotado'
        };
        return texts[status] || status;
    }
    
    showLoading(message = 'Procesando...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.classList.add('active');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // ============ NAVEGACIÓN ============
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
        const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
        
        if (section && menuItem) {
            section.classList.add('active');
            menuItem.classList.add('active');
            
            // Actualizar título
            this.updatePageTitle(sectionId);
            
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
                    break;
                case 'estadisticas':
                    this.loadStatistics();
                    break;
                case 'configuracion':
                    this.loadConfigLists();
                    break;
            }
        }
    }

    updatePageTitle(section) {
        const titles = {
            'dashboard': 'Panel',
            'inventario': 'Inventario',
            'agregar': 'Agregar Producto',
            'ventas': 'Ventas',
            'estadisticas': 'Estadísticas',
            'configuracion': 'Configuración'
        };
        
        const subtitles = {
            'dashboard': 'Resumen de tu negocio',
            'inventario': 'Gestiona todos tus productos',
            'agregar': 'Agrega nuevos productos al inventario',
            'ventas': 'Registra y consulta ventas',
            'estadisticas': 'Analiza el rendimiento de tu negocio',
            'configuracion': 'Personaliza tu sistema'
        };
        
        document.getElementById('pageTitle').textContent = titles[section] || 'Panel';
        document.getElementById('pageSubtitle').textContent = subtitles[section] || 'Bienvenida al sistema';
    }

    // ============ DASHBOARD ============
    updateDashboard() {
        // Actualizar estadísticas
        const totalProducts = this.products.length;
        const totalSalesToday = this.getTodaySales().length;
        const dailyRevenue = this.getTodaySales().reduce((sum, sale) => sum + sale.total, 0);
        const lowStockProducts = this.products.filter(p => p.status === 'low').length;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalSales').textContent = totalSalesToday;
        document.getElementById('dailyRevenue').textContent = this.formatCurrency(dailyRevenue);
        document.getElementById('lowStock').textContent = lowStockProducts;
        
        // Actualizar productos recientes
        this.loadRecentProducts();
        
        // Verificar notificaciones
        this.checkAutoNotifications();
    }

    getTodaySales() {
        const today = new Date().toISOString().split('T')[0];
        return this.sales.filter(sale => sale.date === today);
    }

    loadRecentProducts() {
        const container = document.getElementById('recentProducts');
        if (!container) return;
        
        const recentProducts = [...this.products]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        container.innerHTML = recentProducts.map(product => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${product.name}
                        ${product.tags && product.tags.includes('nuevo') ? 
                            '<span class="tag new">Nuevo</span>' : ''}
                        ${product.tags && product.tags.includes('oferta') ? 
                            '<span class="tag sale">Oferta</span>' : ''}
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>${this.formatCurrency(product.salePrice)}</td>
                <td><span class="status-badge ${product.status}">${this.getStatusText(product.status)}</span></td>
            </tr>
        `).join('');
    }

    // ============ INVENTARIO ============
    loadInventory() {
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updateInventorySummary();
        this.updatePagination();
    }

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
                        <button class="btn-primary" onclick="system.showSection('agregar')" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Agregar Primer Producto
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = currentProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <strong>${product.name}</strong>
                        ${product.tags && product.tags.length > 0 ? 
                            product.tags.map(tag => `<span class="tag ${tag}">${tag}</span>`).join('') : ''}
                    </div>
                    <small style="display: block; color: #666;">${product.brand}</small>
                </td>
                <td>${product.category}</td>
                <td>${product.brand}</td>
                <td>${product.color}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        ${product.stock}
                        ${product.barcode ? 
                            `<button class="btn-secondary" onclick="system.showBarcode(${product.id})" 
                                style="padding: 2px 8px; font-size: 12px;">
                                <i class="fas fa-barcode"></i>
                            </button>` : ''}
                    </div>
                </td>
                <td>${this.formatCurrency(product.salePrice)}</td>
                <td><span class="status-badge ${product.status}">${this.getStatusText(product.status)}</span></td>
                <td>
                    <div class="profit-badge">
                        ${this.calculateProductProfitability(product.id) > 0 ? '↑' : '↓'}
                        ${this.formatCurrency(this.calculateProductProfitability(product.id))}
                    </div>
                </td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="system.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-info" onclick="system.viewProductHistory(${product.id})">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchProducts() {
        const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.color.toLowerCase().includes(searchTerm) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updatePagination();
    }

    applyFilters() {
        const category = document.getElementById('filterCategory').value;
        const color = document.getElementById('filterColor')?.value || '';
        const brand = document.getElementById('filterBrand')?.value || '';
        const status = document.getElementById('filterStatus').value;
        const sortBy = document.getElementById('sortBy')?.value || '';
        const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
        const tagFilter = document.getElementById('filterTag')?.value || '';
        
        this.filteredProducts = this.products.filter(product => {
            if (category && product.category !== category) return false;
            if (color && product.color !== color) return false;
            if (brand && product.brand !== brand) return false;
            if (status && product.status !== status) return false;
            if (tagFilter && (!product.tags || !product.tags.includes(tagFilter))) return false;
            if (searchTerm && !(
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.color.toLowerCase().includes(searchTerm) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
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

    sortProducts(sortBy) {
        this.filteredProducts.sort((a, b) => {
            switch(sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price':
                    return a.salePrice - b.salePrice;
                case 'price-desc':
                    return b.salePrice - a.salePrice;
                case 'stock':
                    return a.stock - b.stock;
                case 'stock-desc':
                    return b.stock - a.stock;
                case 'color':
                    return a.color.localeCompare(b.color);
                case 'brand':
                    return a.brand.localeCompare(b.brand);
                case 'profit':
                    return this.calculateProductProfitability(a.id) - this.calculateProductProfitability(b.id);
                case 'profit-desc':
                    return this.calculateProductProfitability(b.id) - this.calculateProductProfitability(a.id);
                default:
                    return 0;
            }
        });
    }

    clearFilters() {
        document.getElementById('searchInventory').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterColor').value = '';
        document.getElementById('filterBrand').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterTag')?.value = '';
        document.getElementById('sortBy').value = '';
        this.loadInventory();
    }

    updateInventorySummary() {
        const total = this.products.length;
        const value = this.products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
        const low = this.products.filter(p => p.status === 'low').length;
        const out = this.products.filter(p => p.status === 'out').length;
        
        document.getElementById('summaryTotal').textContent = total;
        document.getElementById('summaryValue').textContent = this.formatCurrency(value);
        document.getElementById('summaryLow').textContent = low;
        document.getElementById('summaryOut').textContent = out;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const pageNumbers = document.getElementById('pageNumbers');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (!pageNumbers || !prevBtn || !nextBtn) return;
        
        // Actualizar números de página
        pageNumbers.innerHTML = '';
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('span');
            btn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => this.goToPage(i);
            pageNumbers.appendChild(btn);
        }
        
        // Actualizar botones
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderInventoryTable();
        this.updatePagination();
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderInventoryTable();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderInventoryTable();
            this.updatePagination();
        }
    }

    // ============ AGREGAR PRODUCTO ============
    loadCategories() {
        const select = document.getElementById('productCategory');
        const filterSelect = document.getElementById('filterCategory');
        const variantSelect = document.getElementById('variantColor');
        
        if (select) {
            select.innerHTML = '<option value="">Selecciona una categoría</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todas las categorías</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        if (variantSelect) {
            variantSelect.innerHTML = '<option value="">Selecciona un color</option>' +
                this.colors.map(color => `<option value="${color}">${color}</option>`).join('');
        }
    }

    loadColors() {
        const select = document.getElementById('productColor');
        if (select) {
            select.innerHTML = '<option value="">Selecciona un color</option>' +
                this.colors.map(color => `<option value="${color}">${color}</option>`).join('');
        }
    }

    loadFilterColors() {
        const filterSelect = document.getElementById('filterColor');
        if (filterSelect) {
            const uniqueColors = [...new Set(this.products.map(p => p.color))];
            filterSelect.innerHTML = '<option value="">Todos los colores</option>' +
                uniqueColors.map(color => `<option value="${color}">${color}</option>`).join('');
        }
    }

    loadBrands() {
        const brands = [...new Set(this.products.map(p => p.brand).filter(Boolean))];
        const filterBrand = document.getElementById('filterBrand');
        if (filterBrand) {
            filterBrand.innerHTML = '<option value="">Todas las marcas</option>' +
                brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        }
    }

    loadSizes() {
        const container = document.getElementById('sizeOptions');
        const variantContainer = document.getElementById('variantSizeOptions');
        
        if (container) {
            container.innerHTML = this.sizes.map(size => `
                <div class="size-option" data-size="${size}">${size}</div>
            `).join('');
            
            container.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    container.querySelectorAll('.size-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    option.classList.add('selected');
                });
            });
        }
        
        if (variantContainer) {
            variantContainer.innerHTML = this.sizes.map(size => `
                <div class="size-option" data-size="${size}">${size}</div>
            `).join('');
            
            variantContainer.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    variantContainer.querySelectorAll('.size-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    option.classList.add('selected');
                });
            });
        }
    }

    updateSizeOptions(e) {
        const category = e.target.value;
        const container = document.getElementById('sizeOptions');
        const variantContainer = document.getElementById('variantSizeOptions');
        
        let sizes = this.sizes;
        if (category === 'Pantalones') {
            sizes = this.pantsSizes;
        }
        
        if (container) {
            container.innerHTML = sizes.map(size => `
                <div class="size-option" data-size="${size}">${size}</div>
            `).join('');
            
            container.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    container.querySelectorAll('.size-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    option.classList.add('selected');
                });
            });
        }
        
        if (variantContainer) {
            variantContainer.innerHTML = sizes.map(size => `
                <div class="size-option" data-size="${size}">${size}</div>
            `).join('');
            
            variantContainer.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    variantContainer.querySelectorAll('.size-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    option.classList.add('selected');
                });
            });
        }
    }

    calculateProfitMargin() {
        const purchase = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const sale = parseFloat(document.getElementById('salePrice').value) || 0;
        
        if (purchase > 0 && sale > 0) {
            const margin = ((sale - purchase) / purchase) * 100;
            document.getElementById('profitMargin').value = `${margin.toFixed(1)}%`;
        } else {
            document.getElementById('profitMargin').value = '0%';
        }
    }

    addVariant() {
        const color = document.getElementById('variantColor').value;
        const size = document.querySelector('#variantSizeOptions .size-option.selected')?.dataset.size;
        const stock = parseInt(document.getElementById('variantStock').value) || 1;
        
        if (!color || !size) {
            this.showToast('Selecciona color y talla para la variante', 'error');
            return;
        }
        
        const variant = {
            id: Date.now(),
            color: color,
            size: size,
            stock: stock
        };
        
        this.currentVariants.push(variant);
        this.renderVariantsList();
        
        // Limpiar campos
        document.getElementById('variantColor').value = '';
        document.getElementById('variantSizeOptions').querySelectorAll('.size-option').forEach(opt => 
            opt.classList.remove('selected')
        );
        document.getElementById('variantStock').value = 1;
    }

    renderVariantsList() {
        const container = document.getElementById('variantsList');
        if (!container) return;
        
        if (this.currentVariants.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay variantes agregadas</p>';
            return;
        }
        
        container.innerHTML = this.currentVariants.map(variant => `
            <div class="variant-item" data-id="${variant.id}">
                <div class="variant-details">
                    <div class="variant-info">
                        <span><i class="fas fa-palette"></i> Color: ${variant.color}</span>
                        <span><i class="fas fa-ruler"></i> Talla: ${variant.size}</span>
                        <span><i class="fas fa-box"></i> Cantidad: ${variant.stock}</span>
                    </div>
                </div>
                <div class="variant-actions">
                    <button class="btn-delete" onclick="system.removeVariant(${variant.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeVariant(id) {
        this.currentVariants = this.currentVariants.filter(v => v.id !== id);
        this.renderVariantsList();
    }

    saveProduct(e) {
        e.preventDefault();
        
        // Validar datos
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const color = document.getElementById('productColor').value;
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
        const salePrice = parseFloat(document.getElementById('salePrice').value);
        const stock = parseInt(document.getElementById('initialStock').value);
        const minStock = parseInt(document.getElementById('lowStockAlert').value) || 5;
        const selectedSize = document.querySelector('#sizeOptions .size-option.selected');
        const brand = document.getElementById('productBrand').value.trim() || 'Genérico';
        const barcode = document.getElementById('productBarcode')?.value.trim() || '';
        const supplier = document.getElementById('productSupplier')?.value.trim() || '';
        
        if (!name || !category || !color || !purchasePrice || !salePrice || !selectedSize) {
            this.showToast('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (salePrice <= purchasePrice) {
            this.showToast('El precio de venta debe ser mayor al de compra', 'error');
            return;
        }
        
        // Crear producto base
        const baseProduct = {
            id: this.generateId(),
            name: name,
            category: category,
            brand: brand,
            color: color,
            size: selectedSize.dataset.size,
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            stock: stock,
            minStock: minStock,
            status: stock === 0 ? 'out' : stock < minStock ? 'low' : 'available',
            barcode: barcode,
            supplier: supplier,
            tags: this.getSelectedTags(),
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        // Registrar historial
        this.logProductChange(baseProduct.id, 'creación', null, baseProduct);
        
        // Agregar producto base
        this.products.push(baseProduct);
        
        // Agregar variantes si existen
        if (this.currentVariants.length > 0) {
            this.currentVariants.forEach(variant => {
                const variantProduct = {
                    ...baseProduct,
                    id: this.generateId(),
                    color: variant.color,
                    size: variant.size,
                    stock: variant.stock,
                    name: `${name} - ${variant.color} (${variant.size})`,
                    status: variant.stock === 0 ? 'out' : variant.stock < minStock ? 'low' : 'available'
                };
                this.products.push(variantProduct);
                this.logProductChange(variantProduct.id, 'creación', null, variantProduct);
            });
        }
        
        this.saveData('products');
        
        // Actualizar categorías y colores si son nuevos
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            this.saveData('categories');
        }
        
        if (!this.colors.includes(color)) {
            this.colors.push(color);
            this.saveData('colors');
        }
        
        // Actualizar proveedor si es nuevo
        if (supplier && !this.suppliers.includes(supplier)) {
            this.suppliers.push(supplier);
            this.saveData('suppliers');
        }
        
        // Mostrar éxito
        this.showToast('¡Producto agregado exitosamente!', 'success');
        
        // Resetear formulario
        this.resetProductForm();
        
        // Regresar al inventario
        setTimeout(() => {
            this.showSection('inventario');
            this.loadInventory();
        }, 1500);
    }

    getSelectedTags() {
        const tags = [];
        document.querySelectorAll('.tag-selector input:checked').forEach(checkbox => {
            tags.push(checkbox.value);
        });
        return tags;
    }

    resetProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('profitMargin').value = '0%';
        this.currentVariants = [];
        this.renderVariantsList();
        
        const sizeOptions = document.getElementById('sizeOptions');
        if (sizeOptions) {
            sizeOptions.querySelectorAll('.size-option').forEach(opt => 
                opt.classList.remove('selected')
            );
        }
        
        // Deseleccionar tags
        document.querySelectorAll('.tag-selector input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    cancelForm() {
        if (confirm('¿Seguro que quieres cancelar? Se perderán los datos no guardados.')) {
            this.showSection('inventario');
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;
        
        const modal = document.getElementById('editProductModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <form id="editProductForm">
                <div class="form-group">
                    <label>Nombre del Producto</label>
                    <input type="text" value="${product.name}" required>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Categoría</label>
                        <select required>
                            ${this.categories.map(cat => 
                                `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Stock Actual</label>
                        <input type="number" value="${product.stock}" min="0" required>
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Precio de Compra</label>
                        <input type="number" value="${product.purchasePrice}" step="0.01" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Precio de Venta</label>
                        <input type="number" value="${product.salePrice}" step="0.01" min="0" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Etiquetas</label>
                    <div class="tag-selector">
                        ${this.tags.map(tag => `
                            <label style="display: inline-block; margin-right: 10px;">
                                <input type="checkbox" value="${tag}" 
                                    ${product.tags && product.tags.includes(tag) ? 'checked' : ''}>
                                ${tag}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary modal-close">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar Cambios</button>
                </div>
            </form>
        `;
        
        this.showModal('editProductModal');
        
        // Configurar formulario de edición
        document.getElementById('editProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Guardar valores antiguos para historial
            const oldValues = {
                name: product.name,
                category: product.category,
                stock: product.stock,
                purchasePrice: product.purchasePrice,
                salePrice: product.salePrice,
                tags: [...(product.tags || [])]
            };
            
            product.name = e.target.querySelector('input[type="text"]').value;
            product.category = e.target.querySelector('select').value;
            product.stock = parseInt(e.target.querySelectorAll('input')[1].value);
            product.purchasePrice = parseFloat(e.target.querySelectorAll('input')[2].value);
            product.salePrice = parseFloat(e.target.querySelectorAll('input')[3].value);
            
            // Actualizar tags
            const selectedTags = [];
            e.target.querySelectorAll('.tag-selector input:checked').forEach(checkbox => {
                selectedTags.push(checkbox.value);
            });
            product.tags = selectedTags;
            
            product.status = product.stock === 0 ? 'out' : 
                           product.stock < product.minStock ? 'low' : 'available';
            
            // Registrar cambio en historial
            this.logProductChange(product.id, 'edición', oldValues, product);
            
            this.saveData('products');
            this.loadInventory();
            this.closeModal();
            this.showToast('Producto actualizado correctamente', 'success');
        });
    }

    deleteProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;
        
        this.showConfirmation(
            'Eliminar Producto',
            `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
            () => {
                // Registrar en historial antes de eliminar
                this.logProductChange(product.id, 'eliminación', product, null);
                
                this.products = this.products.filter(p => p.id !== id);
                this.saveData('products');
                this.loadInventory();
                this.showToast('Producto eliminado', 'success');
            }
        );
    }

    // ============ VENTAS ============
    loadProductsForSale() {
        const select = document.getElementById('selectProduct');
        if (!select) return;
        
        const availableProducts = this.products.filter(p => p.stock > 0);
        
        select.innerHTML = '<option value="">Buscar producto...</option>' +
            availableProducts.map(p => 
                `<option value="${p.id}" data-price="${p.salePrice}" data-stock="${p.stock}">
                    ${p.name} - ${this.formatCurrency(p.salePrice)} (Stock: ${p.stock})
                    ${p.tags && p.tags.includes('oferta') ? '🔥' : ''}
                </option>`
            ).join('');
    }

    addToCart() {
        const select = document.getElementById('selectProduct');
        const qtyInput = document.getElementById('productQty');
        
        if (!select || !qtyInput) return;
        
        const productId = parseInt(select.value);
        const quantity = parseInt(qtyInput.value) || 1;
        
        if (!productId || quantity < 1) {
            this.showToast('Selecciona un producto y cantidad válida', 'error');
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Producto no encontrado', 'error');
            return;
        }
        
        if (quantity > product.stock) {
            this.showToast(`Stock insuficiente. Solo hay ${product.stock} unidades`, 'error');
            return;
        }
        
        // Aplicar promociones si existen
        const salePrice = this.applyPromotions(product, quantity);
        
        // Agregar al carrito
        const existingItem = this.currentCart.find(item => item.id === productId);
        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                this.showToast(`Stock insuficiente. Máximo: ${product.stock}`, 'error');
                return;
            }
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            this.currentCart.push({
                id: product.id,
                name: product.name,
                price: salePrice,
                quantity: quantity,
                subtotal: quantity * salePrice,
                originalPrice: product.salePrice
            });
        }
        
        this.updateCartDisplay();
        this.updatePaymentSummary();
        
        // Limpiar selección
        select.value = '';
        qtyInput.value = 1;
    }

    applyPromotions(product, quantity) {
        // Buscar promociones activas para este producto
        const activePromotions = this.promotions.filter(p => 
            p.isActive && 
            new Date(p.endDate) >= new Date() &&
            (p.productId === product.id || p.category === product.category)
        );
        
        let finalPrice = product.salePrice;
        
        activePromotions.forEach(promo => {
            if (promo.type === 'percentage') {
                finalPrice = finalPrice * (1 - promo.value / 100);
            } else if (promo.type === 'fixed') {
                finalPrice = Math.max(0, finalPrice - promo.value);
            } else if (promo.type === 'bundle' && quantity >= promo.minQuantity) {
                finalPrice = promo.bundlePrice / promo.minQuantity;
            }
        });
        
        return finalPrice;
    }

    updateCartDisplay() {
        const container = document.getElementById('cartItems');
        if (!container) return;
        
        if (this.currentCart.length === 0) {
            container.innerHTML = '<p class="empty-cart">No hay productos en el carrito</p>';
            return;
        }
        
        container.innerHTML = this.currentCart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        ${item.quantity} x ${this.formatCurrency(item.price)}
                        ${item.price < item.originalPrice ? 
                            `<span style="color: var(--success); font-size: 12px;">
                                (Ahorro: ${this.formatCurrency((item.originalPrice - item.price) * item.quantity)})
                            </span>` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-price">${this.formatCurrency(item.subtotal)}</span>
                    <button class="btn-delete" onclick="system.removeFromCart(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeFromCart(id) {
        this.currentCart = this.currentCart.filter(item => item.id !== id);
        this.updateCartDisplay();
        this.updatePaymentSummary();
    }

    clearCart() {
        if (this.currentCart.length === 0) return;
        
        if (confirm('¿Seguro que quieres vaciar el carrito?')) {
            this.currentCart = [];
            this.updateCartDisplay();
            this.updatePaymentSummary();
        }
    }

    updatePaymentSummary() {
        const subtotal = this.currentCart.reduce((sum, item) => sum + item.subtotal, 0);
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        let commission = 0;
        
        if (paymentMethod === 'tarjeta') {
            commission = subtotal * 0.05;
        }
        
        const total = subtotal + commission;
        
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('commission').textContent = this.formatCurrency(commission);
        document.getElementById('totalAmount').textContent = this.formatCurrency(total);
    }

    processSale() {
        // Validar datos del cliente
        const clientName = document.getElementById('clientName').value.trim();
        if (!clientName) {
            this.showToast('Ingresa el nombre del cliente', 'error');
            return;
        }
        
        if (this.currentCart.length === 0) {
            this.showToast('Agrega productos al carrito', 'error');
            return;
        }
        
        // Verificar stock
        for (const item of this.currentCart) {
            const product = this.products.find(p => p.id === item.id);
            if (!product || product.stock < item.quantity) {
                this.showToast(`Stock insuficiente para: ${product?.name || 'producto'}`, 'error');
                return;
            }
        }
        
        // Calcular total
        const subtotal = this.currentCart.reduce((sum, item) => sum + item.subtotal, 0);
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        let commission = 0;
        if (paymentMethod === 'tarjeta') {
            commission = subtotal * 0.05;
        }
        const total = subtotal + commission;
        
        // Crear venta
        const sale = {
            id: this.generateSaleId(),
            client: {
                name: clientName,
                dni: document.getElementById('clientDNI').value.trim(),
                phone: document.getElementById('clientPhone').value.trim(),
                email: document.getElementById('clientEmail')?.value.trim() || ''
            },
            products: [...this.currentCart],
            subtotal: subtotal,
            commission: commission,
            total: total,
            paymentMethod: paymentMethod,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            status: 'completada'
        };
        
        // Actualizar stock y registrar historial
        for (const item of this.currentCart) {
            const product = this.products.find(p => p.id === item.id);
            if (product) {
                const oldStock = product.stock;
                product.stock -= item.quantity;
                product.status = product.stock === 0 ? 'out' : 
                                product.stock < product.minStock ? 'low' : 'available';
                
                // Registrar cambio de stock
                this.logProductChange(product.id, 'venta', oldStock, product.stock);
            }
        }
        
        // Guardar venta
        this.sales.push(sale);
        this.saveData('sales');
        this.saveData('products');
        
        // Guardar cliente si es nuevo
        const clientExists = this.clients.some(c => c.dni === sale.client.dni && c.dni);
        if (!clientExists && sale.client.name) {
            this.clients.push(sale.client);
            this.saveData('clients');
            
            // Calcular puntos del cliente
            const points = Math.floor(total / 10); // 1 punto por cada S/. 10
            this.showToast(`Cliente nuevo registrado. Puntos ganados: ${points}`, 'success');
        }
        
        // Generar ticket (opcional)
        if (confirm('¿Deseas imprimir el ticket de venta?')) {
            this.generateReceipt(sale);
        }
        
        // Mostrar éxito
        this.showToast(`Venta procesada por ${this.formatCurrency(total)}`, 'success');
        
        // Limpiar formulario
        document.getElementById('clientName').value = '';
        document.getElementById('clientDNI').value = '';
        document.getElementById('clientPhone').value = '';
        this.currentCart = [];
        this.updateCartDisplay();
        this.updatePaymentSummary();
        
        // Actualizar dashboard e inventario
        this.updateDashboard();
        this.loadInventory();
        this.loadSalesHistory();
        
        // Generar reporte automático
        this.generateDailyReport();
    }

    generateSaleId() {
        const maxId = this.sales.reduce((max, s) => Math.max(max, s.id || 0), 0);
        return maxId + 1;
    }

    newSale() {
        document.getElementById('clientName').value = '';
        document.getElementById('clientDNI').value = '';
        document.getElementById('clientPhone').value = '';
        this.currentCart = [];
        this.updateCartDisplay();
        this.updatePaymentSummary();
        document.getElementById('cash').checked = true;
    }

    loadSalesHistory() {
        const container = document.getElementById('salesHistoryTable');
        if (!container) return;
        
        const recentSales = [...this.sales]
            .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
            .slice(0, 10);
        
        if (recentSales.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                        No hay ventas registradas
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = recentSales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.client.name}</td>
                <td>${sale.products.length} productos</td>
                <td>${this.formatCurrency(sale.total)}</td>
                <td>${sale.date}</td>
                <td>
                    <span class="payment-badge ${sale.paymentMethod}">
                        ${this.getPaymentMethodText(sale.paymentMethod)}
                    </span>
                </td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="system.viewSaleDetails(${sale.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-secondary" onclick="system.generateReceipt(${sale.id})">
                        <i class="fas fa-receipt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    viewSaleDetails(id) {
        const sale = this.sales.find(s => s.id === id);
        if (!sale) return;
        
        const modal = document.getElementById('saleDetailsModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="sale-details">
                <div class="detail-row">
                    <strong>Cliente:</strong>
                    <span>${sale.client.name}</span>
                </div>
                <div class="detail-row">
                    <strong>DNI:</strong>
                    <span>${sale.client.dni || 'No registrado'}</span>
                </div>
                <div class="detail-row">
                    <strong>Teléfono:</strong>
                    <span>${sale.client.phone || 'No registrado'}</span>
                </div>
                <div class="detail-row">
                    <strong>Fecha:</strong>
                    <span>${sale.date} ${sale.time}</span>
                </div>
                <div class="detail-row">
                    <strong>Método de Pago:</strong>
                    <span>${this.getPaymentMethodText(sale.paymentMethod)}</span>
                </div>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px;">Productos</h4>
                <div class="products-list">
                    ${sale.products.map(p => `
                        <div class="product-item">
                            <span>${p.name}</span>
                            <span>${p.quantity} x ${this.formatCurrency(p.price)} = ${this.formatCurrency(p.subtotal)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="summary-row">
                    <strong>Subtotal:</strong>
                    <span>${this.formatCurrency(sale.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <strong>Comisión:</strong>
                    <span>${this.formatCurrency(sale.commission)}</span>
                </div>
                <div class="summary-row total">
                    <strong>Total:</strong>
                    <span>${this.formatCurrency(sale.total)}</span>
                </div>
            </div>
        `;
        
        this.showModal('saleDetailsModal');
    }

    getPaymentMethodText(method) {
        const methods = {
            'efectivo': 'Efectivo',
            'transferencia': 'Transferencia',
            'tarjeta': 'Tarjeta (+5% comisión)'
        };
        return methods[method] || method;
    }

    generateReceipt(saleId) {
        const sale = typeof saleId === 'number' ? this.sales.find(s => s.id === saleId) : saleId;
        if (!sale) return;
        
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Venta - ${sale.id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
                    .ticket { max-width: 300px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .info { margin-bottom: 15px; }
                    .products { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
                    .product-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { font-weight: bold; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <h3>Jessica Boutique</h3>
                        <p>Ticket #${sale.id}</p>
                        <p>${sale.date} ${sale.time}</p>
                    </div>
                    <div class="info">
                        <p><strong>Cliente:</strong> ${sale.client.name}</p>
                        <p><strong>Método:</strong> ${this.getPaymentMethodText(sale.paymentMethod)}</p>
                    </div>
                    <div class="products">
                        ${sale.products.map(p => `
                            <div class="product-row">
                                <span>${p.name} x${p.quantity}</span>
                                <span>${this.formatCurrency(p.subtotal)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total">
                        <p>Total: ${this.formatCurrency(sale.total)}</p>
                    </div>
                    <div class="footer">
                        <p>¡Gracias por su compra!</p>
                        <p>Jessica Boutique</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        receiptWindow.document.close();
        setTimeout(() => receiptWindow.print(), 500);
    }

    // ============ ESTADÍSTICAS ============
    loadStatistics() {
        this.updateStatsSummary();
        this.createCharts();
        this.loadTopProducts();
        this.loadSalesPrediction();
    }

    updateStatsSummary() {
        const period = document.getElementById('statsPeriod')?.value || 'month';
        const salesInPeriod = this.getSalesByPeriod(period);
        
        const totalSales = salesInPeriod.reduce((sum, sale) => sum + sale.total, 0);
        const totalProfit = this.calculateProfitFromSales(salesInPeriod);
        const newClients = this.getNewClientsByPeriod(period).length;
        const productsSold = salesInPeriod.reduce((sum, sale) => 
            sum + sale.products.reduce((qty, item) => qty + item.quantity, 0), 0);
        
        document.getElementById('totalSalesAmount').textContent = this.formatCurrency(totalSales);
        document.getElementById('totalProfitAmount').textContent = this.formatCurrency(totalProfit);
        document.getElementById('newClients').textContent = newClients;
        document.getElementById('productsSold').textContent = productsSold;
        
        // Actualizar tendencias
        const previousPeriodData = this.getPreviousPeriodData(period);
        this.updateTrendIndicators(totalSales, totalProfit, previousPeriodData);
    }

    calculateProfitFromSales(sales) {
        return sales.reduce((profit, sale) => {
            return profit + sale.products.reduce((saleProfit, item) => {
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    return saleProfit + ((item.price || product.salePrice) - product.purchasePrice) * item.quantity;
                }
                return saleProfit;
            }, 0);
        }, 0);
    }

    getSalesByPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return this.sales;
        }
        
        return this.sales.filter(sale => new Date(sale.date) >= startDate);
    }

    getPreviousPeriodData(currentPeriod) {
        const now = new Date();
        let startDate, endDate;
        
        switch(currentPeriod) {
            case 'today':
                startDate = new Date(now.setDate(now.getDate() - 1));
                endDate = new Date(now);
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 14));
                endDate = new Date(now.setDate(now.getDate() + 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 2));
                endDate = new Date(now.setMonth(now.getMonth() + 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 2));
                endDate = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
            default:
                return { sales: 0, profit: 0 };
        }
        
        const previousSales = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate < endDate;
        });
        
        return {
            sales: previousSales.reduce((sum, sale) => sum + sale.total, 0),
            profit: this.calculateProfitFromSales(previousSales)
        };
    }

    updateTrendIndicators(currentSales, currentProfit, previousData) {
        const salesTrend = previousData.sales > 0 ? 
            ((currentSales - previousData.sales) / previousData.sales * 100).toFixed(1) : 0;
        const profitTrend = previousData.profit > 0 ? 
            ((currentProfit - previousData.profit) / previousData.profit * 100).toFixed(1) : 0;
        
        // Actualizar indicadores visuales
        document.querySelectorAll('.stat-change').forEach(el => {
            if (el.id === 'salesTrend') {
                el.textContent = `${salesTrend > 0 ? '+' : ''}${salesTrend}%`;
                el.className = `stat-change ${salesTrend >= 0 ? 'up' : 'down'}`;
            }
            if (el.id === 'profitTrend') {
                el.textContent = `${profitTrend > 0 ? '+' : ''}${profitTrend}%`;
                el.className = `stat-change ${profitTrend >= 0 ? 'up' : 'down'}`;
            }
        });
    }

    getNewClientsByPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return this.clients;
        }
        
        return this.clients.filter(client => {
            const clientSale = this.sales.find(s => s.client.dni === client.dni);
            return clientSale && new Date(clientSale.date) >= startDate;
        });
    }

    createCharts() {
        // Gráfico de ventas
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            const last7Days = this.getLast7Days();
            const salesData = this.getSalesData(last7Days);
            
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: last7Days.map(d => this.formatDateShort(d)),
                    datasets: [{
                        label: 'Ventas (S/.)',
                        data: salesData,
                        borderColor: '#7e57c2',
                        backgroundColor: 'rgba(126, 87, 194, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'S/. ' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de categorías
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            const categoryData = this.getCategoryData();
            
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: [
                            '#f06292', '#b39ddb', '#7e57c2', '#5e35b1',
                            '#f8bbd9', '#d1c4e9', '#ffcc80', '#90caf9'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Gráfico de tendencias de stock
        const stockCtx = document.getElementById('stockChart');
        if (stockCtx) {
            const stockData = this.getStockData();
            
            new Chart(stockCtx, {
                type: 'bar',
                data: {
                    labels: ['Disponible', 'Stock Bajo', 'Agotado'],
                    datasets: [{
                        label: 'Productos',
                        data: stockData,
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.7)',
                            'rgba(255, 152, 0, 0.7)',
                            'rgba(244, 67, 54, 0.7)'
                        ],
                        borderColor: [
                            '#4caf50',
                            '#ff9800',
                            '#f44336'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getSalesData(days) {
        return days.map(day => {
            return this.sales
                .filter(sale => sale.date === day)
                .reduce((sum, sale) => sum + sale.total, 0);
        });
    }

    getCategoryData() {
        const data = {};
        this.sales.forEach(sale => {
            sale.products.forEach(item => {
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    data[product.category] = (data[product.category] || 0) + item.quantity;
                }
            });
        });
        return data;
    }

    getStockData() {
        return [
            this.products.filter(p => p.status === 'available').length,
            this.products.filter(p => p.status === 'low').length,
            this.products.filter(p => p.status === 'out').length
        ];
    }

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    loadTopProducts() {
        const container = document.getElementById('topProductsList');
        if (!container) return;
        
        // Calcular productos más vendidos
        const productSales = {};
        this.sales.forEach(sale => {
            sale.products.forEach(item => {
                productSales[item.id] = (productSales[item.id] || { 
                    quantity: 0, 
                    revenue: 0 
                });
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.subtotal;
            });
        });
        
        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(([id, stats]) => {
                const product = this.products.find(p => p.id === parseInt(id));
                return { product, ...stats };
            })
            .filter(item => item.product);
        
        container.innerHTML = topProducts.map(item => `
            <div class="product-rank">
                <div class="product-info">
                    <strong>${item.product.name}</strong>
                    <small>${item.product.category}</small>
                </div>
                <div class="product-stats">
                    <span class="sales-count">${item.quantity} vendidos</span>
                    <span class="revenue">${this.formatCurrency(item.revenue)}</span>
                    <span class="profit-margin">
                        ${this.calculateProductProfitability(item.product.id) > 0 ? '↑' : '↓'}
                        ${this.formatCurrency(this.calculateProductProfitability(item.product.id))}
                    </span>
                </div>
            </div>
        `).join('');
    }

    loadSalesPrediction() {
        const prediction = this.predictSalesTrend();
        const container = document.getElementById('salesPrediction');
        if (!container) return;
        
        container.innerHTML = `
            <div class="prediction-card">
                <h4><i class="fas fa-chart-line"></i> Predicción del Próximo Mes</h4>
                <div class="prediction-data">
                    <div>
                        <small>Mes Actual</small>
                        <p class="prediction-number">${this.formatCurrency(prediction.current)}</p>
                    </div>
                    <div>
                        <small>Próximo Mes</small>
                        <p class="prediction-number ${prediction.growth >= 0 ? 'up' : 'down'}">
                            ${this.formatCurrency(prediction.next)}
                            <span>${prediction.growth >= 0 ? '+' : ''}${prediction.growth}%</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    predictSalesTrend() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const currentMonthSales = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentMonth && 
                   saleDate.getFullYear() === currentYear;
        });
        
        const lastMonthSales = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const year = currentMonth === 0 ? currentYear - 1 : currentYear;
            return saleDate.getMonth() === lastMonth && 
                   saleDate.getFullYear() === year;
        });
        
        const currentTotal = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0);
        const lastTotal = lastMonthSales.reduce((sum, sale) => sum + sale.total, 0);
        
        const growth = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100).toFixed(1) : 0;
        const nextMonthPrediction = currentTotal * (1 + parseFloat(growth) / 100);
        
        return {
            current: currentTotal,
            last: lastTotal,
            growth: parseFloat(growth),
            next: nextMonthPrediction
        };
    }

    // ============ CONFIGURACIÓN ============
    switchConfigTab(e) {
        const tabId = e.currentTarget.dataset.tab;
        
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Cargar datos específicos de la pestaña
        if (tabId === 'suppliers') {
            this.loadSuppliersList();
        } else if (tabId === 'promotions') {
            this.loadPromotionsList();
        }
    }

    loadConfigLists() {
        this.loadCategoriesList();
        this.loadColorsList();
        this.loadSizesLists();
        this.loadTagsList();
    }

    loadCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = this.categories.map(category => `
            <div class="config-list-item editable" data-name="${category}">
                <input type="text" value="${category}" class="edit-input" readonly>
                <div class="item-actions">
                    <button class="btn-edit" onclick="system.editConfigItem(this, 'category', '${category}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-save" onclick="system.saveConfigItem(this, 'category', '${category}')" style="display: none;">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteCategory('${category}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadColorsList() {
        const container = document.getElementById('colorsList');
        if (!container) return;
        
        container.innerHTML = this.colors.map(color => `
            <div class="config-list-item editable" data-name="${color}">
                <input type="text" value="${color}" class="edit-input" readonly>
                <div class="item-actions">
                    <button class="btn-edit" onclick="system.editConfigItem(this, 'color', '${color}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-save" onclick="system.saveConfigItem(this, 'color', '${color}')" style="display: none;">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteColor('${color}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSizesLists() {
        // Tallas generales
        const sizesList = document.getElementById('sizesList');
        if (sizesList) {
            sizesList.innerHTML = this.sizes.map(size => `
                <div class="config-list-item">
                    <span>${size}</span>
                    <button class="btn-delete" onclick="system.deleteSize('${size}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
        
        // Tallas de pantalón
        const pantsSizesList = document.getElementById('pantsSizesList');
        if (pantsSizesList) {
            pantsSizesList.innerHTML = this.pantsSizes.map(size => `
                <div class="config-list-item">
                    <span>${size}</span>
                    <button class="btn-delete" onclick="system.deletePantsSize('${size}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    loadTagsList() {
        const container = document.getElementById('tagsList');
        if (!container) return;
        
        container.innerHTML = this.tags.map(tag => `
            <div class="config-list-item editable" data-name="${tag}">
                <input type="text" value="${tag}" class="edit-input" readonly>
                <div class="item-actions">
                    <button class="btn-edit" onclick="system.editConfigItem(this, 'tag', '${tag}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-save" onclick="system.saveConfigItem(this, 'tag', '${tag}')" style="display: none;">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteTag('${tag}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSuppliers() {
        const select = document.getElementById('productSupplier');
        if (select) {
            select.innerHTML = '<option value="">Selecciona proveedor</option>' +
                this.suppliers.map(supplier => 
                    `<option value="${supplier}">${supplier}</option>`
                ).join('');
        }
    }

    loadPromotions() {
        // Cargar promociones activas
        const activePromotions = this.promotions.filter(p => 
            p.isActive && new Date(p.endDate) >= new Date()
        );
        
        if (activePromotions.length > 0) {
            this.showToast(`Hay ${activePromotions.length} promociones activas`, 'info');
        }
    }

    editConfigItem(button, type, oldValue) {
        const item = button.closest('.config-list-item');
        const input = item.querySelector('.edit-input');
        const editBtn = item.querySelector('.btn-edit');
        const saveBtn = item.querySelector('.btn-save');
        
        input.readOnly = false;
        input.focus();
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
    }

    saveConfigItem(button, type, oldValue) {
        const item = button.closest('.config-list-item');
        const input = item.querySelector('.edit-input');
        const newValue = input.value.trim();
        const editBtn = item.querySelector('.btn-edit');
        const saveBtn = item.querySelector('.btn-save');
        
        if (!newValue) {
            this.showToast('El valor no puede estar vacío', 'error');
            return;
        }
        
        if (type === 'category') {
            // Actualizar en productos
            this.products.forEach(product => {
                if (product.category === oldValue) {
                    product.category = newValue;
                }
            });
            // Actualizar en lista
            const index = this.categories.indexOf(oldValue);
            if (index > -1) {
                this.categories[index] = newValue;
            }
            this.saveData('products');
            this.saveData('categories');
        } else if (type === 'color') {
            // Actualizar en productos
            this.products.forEach(product => {
                if (product.color === oldValue) {
                    product.color = newValue;
                }
            });
            // Actualizar en lista
            const index = this.colors.indexOf(oldValue);
            if (index > -1) {
                this.colors[index] = newValue;
            }
            this.saveData('products');
            this.saveData('colors');
        } else if (type === 'tag') {
            // Actualizar en productos
            this.products.forEach(product => {
                if (product.tags && product.tags.includes(oldValue)) {
                    const tagIndex = product.tags.indexOf(oldValue);
                    product.tags[tagIndex] = newValue;
                }
            });
            // Actualizar en lista
            const index = this.tags.indexOf(oldValue);
            if (index > -1) {
                this.tags[index] = newValue;
            }
            this.saveData('products');
            this.saveData('tags');
        }
        
        input.readOnly = true;
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
        this.loadConfigLists();
        this.showToast(`${type === 'category' ? 'Categoría' : type === 'color' ? 'Color' : 'Etiqueta'} actualizado`, 'success');
    }

    addNewCategory() {
        const input = document.getElementById('newCategory');
        const category = input.value.trim();
        
        if (!category) {
            this.showToast('Ingresa un nombre para la categoría', 'error');
            return;
        }
        
        if (this.categories.includes(category)) {
            this.showToast('La categoría ya existe', 'error');
            return;
        }
        
        this.categories.push(category);
        this.saveData('categories');
        this.loadCategories();
        this.loadCategoriesList();
        
        input.value = '';
        this.showToast('Categoría agregada', 'success');
    }

    addNewColor() {
        const input = document.getElementById('newColor');
        const color = input.value.trim();
        
        if (!color) {
            this.showToast('Ingresa un nombre para el color', 'error');
            return;
        }
        
        if (this.colors.includes(color)) {
            this.showToast('El color ya existe', 'error');
            return;
        }
        
        this.colors.push(color);
        this.saveData('colors');
        this.loadColors();
        this.loadColorsList();
        
        input.value = '';
        this.showToast('Color agregado', 'success');
    }

    addNewSize() {
        const input = document.getElementById('newSize');
        const size = input.value.trim().toUpperCase();
        
        if (!size) {
            this.showToast('Ingresa una talla', 'error');
            return;
        }
        
        if (this.sizes.includes(size)) {
            this.showToast('La talla ya existe', 'error');
            return;
        }
        
        this.sizes.push(size);
        this.saveData('sizes');
        this.loadSizes();
        this.loadSizesLists();
        
        input.value = '';
        this.showToast('Talla agregada', 'success');
    }

    addNewPantsSize() {
        const input = document.getElementById('newPantsSize');
        const size = input.value.trim();
        
        if (!size) {
            this.showToast('Ingresa una talla', 'error');
            return;
        }
        
        if (this.pantsSizes.includes(size)) {
            this.showToast('La talla ya existe', 'error');
            return;
        }
        
        this.pantsSizes.push(size);
        this.saveData('pantsSizes');
        this.loadSizesLists();
        
        input.value = '';
        this.showToast('Talla de pantalón agregada', 'success');
    }

    deleteCategory(category) {
        // Verificar si hay productos usando esta categoría
        const productsWithCategory = this.products.filter(p => p.category === category);
        if (productsWithCategory.length > 0) {
            this.showToast(`No se puede eliminar. Hay ${productsWithCategory.length} productos usando esta categoría`, 'error');
            return;
        }
        
        this.categories = this.categories.filter(c => c !== category);
        this.saveData('categories');
        this.loadCategories();
        this.loadCategoriesList();
        this.showToast('Categoría eliminada', 'success');
    }

    deleteColor(color) {
        // Verificar si hay productos usando este color
        const productsWithColor = this.products.filter(p => p.color === color);
        if (productsWithColor.length > 0) {
            this.showToast(`No se puede eliminar. Hay ${productsWithColor.length} productos usando este color`, 'error');
            return;
        }
        
        this.colors = this.colors.filter(c => c !== color);
        this.saveData('colors');
        this.loadColors();
        this.loadColorsList();
        this.showToast('Color eliminado', 'success');
    }

    deleteSize(size) {
        // Verificar si hay productos usando esta talla
        const productsWithSize = this.products.filter(p => p.size === size);
        if (productsWithSize.length > 0) {
            this.showToast(`No se puede eliminar. Hay ${productsWithSize.length} productos usando esta talla`, 'error');
            return;
        }
        
        this.sizes = this.sizes.filter(s => s !== size);
        this.saveData('sizes');
        this.loadSizes();
        this.loadSizesLists();
        this.showToast('Talla eliminada', 'success');
    }

    deletePantsSize(size) {
        this.pantsSizes = this.pantsSizes.filter(s => s !== size);
        this.saveData('pantsSizes');
        this.loadSizesLists();
        this.showToast('Talla de pantalón eliminada', 'success');
    }

    deleteTag(tag) {
        // Verificar si hay productos usando esta etiqueta
        const productsWithTag = this.products.filter(p => p.tags && p.tags.includes(tag));
        if (productsWithTag.length > 0) {
            this.showToast(`No se puede eliminar. Hay ${productsWithTag.length} productos usando esta etiqueta`, 'error');
            return;
        }
        
        this.tags = this.tags.filter(t => t !== tag);
        this.saveData('tags');
        this.loadTagsList();
        this.showToast('Etiqueta eliminada', 'success');
    }

    toggleDarkMode() {
        const isDarkMode = document.getElementById('darkModeToggle').checked;
        localStorage.setItem('jb_darkMode', isDarkMode);
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        this.showToast(`Modo ${isDarkMode ? 'oscuro' : 'claro'} activado`, 'success');
    }

    exportAllData() {
        const data = {
            products: this.products,
            categories: this.categories,
            colors: this.colors,
            sizes: this.sizes,
            pantsSizes: this.pantsSizes,
            sales: this.sales,
            clients: this.clients,
            suppliers: this.suppliers,
            promotions: this.promotions,
            tags: this.tags,
            reports: this.reports,
            exportDate: new Date().toISOString(),
            systemVersion: '2.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `backup_jessica_boutique_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Registrar última copia
        localStorage.setItem('jb_lastBackup', new Date().toISOString());
        this.lastBackup = localStorage.getItem('jb_lastBackup');
        
        this.showToast('Datos exportados correctamente', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validar estructura de datos
                    if (data.products && data.categories && data.colors && data.sizes) {
                        this.showLoading('Importando datos...');
                        
                        setTimeout(() => {
                            this.products = data.products || [];
                            this.categories = data.categories || [];
                            this.colors = data.colors || [];
                            this.sizes = data.sizes || [];
                            this.pantsSizes = data.pantsSizes || [];
                            this.sales = data.sales || [];
                            this.clients = data.clients || [];
                            this.suppliers = data.suppliers || [];
                            this.promotions = data.promotions || [];
                            this.tags = data.tags || [];
                            this.reports = data.reports || [];
                            
                            this.saveAllData();
                            this.loadInitialData();
                            this.updateDashboard();
                            this.hideLoading();
                            this.showToast('Datos importados correctamente', 'success');
                        }, 1000);
                    } else {
                        this.showToast('Formato de archivo inválido', 'error');
                    }
                } catch (error) {
                    this.showToast('Error al leer el archivo', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    confirmClearData() {
        this.showConfirmation(
            'Limpiar Todos los Datos',
            '⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos del sistema. ¿Estás completamente seguro?',
            () => {
                localStorage.clear();
                this.products = this.getSampleProducts();
                this.categories = this.getSampleCategories();
                this.colors = this.getSampleColors();
                this.sizes = this.getSampleSizes();
                this.pantsSizes = this.getSamplePantsSizes();
                this.sales = [];
                this.clients = [];
                this.suppliers = [];
                this.promotions = [];
                this.tags = ['nuevo', 'oferta', 'tendencia', 'limitado'];
                this.reports = [];
                
                this.saveAllData();
                this.loadInitialData();
                this.updateDashboard();
                this.showToast('Sistema reiniciado correctamente', 'success');
            }
        );
    }

    // ============ NOTIFICACIONES ============
    showNotifications() {
        const notifications = this.generateNotifications();
        
        const notificationDropdown = document.createElement('div');
        notificationDropdown.className = 'notification-dropdown';
        notificationDropdown.innerHTML = `
            <div class="notification-header">
                <h4>Notificaciones (${notifications.length})</h4>
                <button class="btn-clear" onclick="this.closest('.notification-dropdown').remove()">
                    <i class="fas fa-check-double"></i> Marcar todas como leídas
                </button>
            </div>
            <div class="notification-list">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.type}">
                        <div class="notification-icon">
                            <i class="fas fa-${notif.icon}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-message">${notif.message}</div>
                            <div class="notification-date">${notif.date}</div>
                        </div>
                        ${notif.action ? `
                            <button class="btn-secondary" onclick="${notif.action}">
                                <i class="fas fa-${notif.actionIcon || 'arrow-right'}"></i>
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="notification-footer">
                <a href="#" onclick="system.showAllNotifications()">Ver todas las notificaciones</a>
            </div>
        `;
        
        // Remover dropdown existente
        const existingDropdown = document.querySelector('.notification-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        // Agregar nuevo dropdown
        const btn = document.querySelector('.btn-notification');
        btn.appendChild(notificationDropdown);
        
        // Cerrar al hacer clic fuera
        setTimeout(() => {
            const closeDropdown = (e) => {
                if (!notificationDropdown.contains(e.target) && !btn.contains(e.target)) {
                    notificationDropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            };
            document.addEventListener('click', closeDropdown);
        }, 100);
    }

    generateNotifications() {
        const notifications = [];
        
        // Notificaciones de stock bajo
        const lowStockProducts = this.products.filter(p => p.status === 'low');
        if (lowStockProducts.length > 0) {
            notifications.push({
                id: 1,
                title: 'Stock Bajo',
                message: `${lowStockProducts.length} productos tienen stock bajo`,
                date: new Date().toLocaleDateString(),
                type: 'warning',
                icon: 'exclamation-triangle',
                action: 'system.showSection("inventario")',
                actionIcon: 'boxes'
            });
        }
        
        // Notificaciones de productos agotados
        const outOfStockProducts = this.products.filter(p => p.status === 'out');
        if (outOfStockProducts.length > 0) {
            notifications.push({
                id: 2,
                title: 'Productos Agotados',
                message: `${outOfStockProducts.length} productos están agotados`,
                date: new Date().toLocaleDateString(),
                type: 'danger',
                icon: 'times-circle',
                action: 'system.showSection("inventario")',
                actionIcon: 'boxes'
            });
        }
        
        // Ventas del día
        const todaySales = this.getTodaySales();
        if (todaySales.length > 0) {
            const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
            notifications.push({
                id: 3,
                title: 'Ventas Hoy',
                message: `${todaySales.length} ventas por ${this.formatCurrency(totalToday)}`,
                date: new Date().toLocaleDateString(),
                type: 'success',
                icon: 'check-circle',
                action: 'system.showSection("ventas")',
                actionIcon: 'shopping-cart'
            });
        }
        
        // Recordatorios
        const today = new Date().toISOString().split('T')[0];
        const todayReminders = this.reminders.filter(r => r.date === today && !r.completed);
        todayReminders.forEach((reminder, index) => {
            notifications.push({
                id: 4 + index,
                title: 'Recordatorio',
                message: reminder.title,
                date: reminder.date,
                type: 'info',
                icon: 'bell',
                action: reminder.action,
                actionIcon: 'check'
            });
        });
        
        // Backup automático
        if (!this.lastBackup || (new Date() - new Date(this.lastBackup)) > 7 * 24 * 60 * 60 * 1000) {
            notifications.push({
                id: 99,
                title: 'Backup Pendiente',
                message: 'No se ha realizado backup en más de 7 días',
                date: new Date().toLocaleDateString(),
                type: 'warning',
                icon: 'database',
                action: 'system.exportAllData()',
                actionIcon: 'download'
            });
        }
        
        return notifications;
    }

    checkAutoNotifications() {
        const lowStockCount = this.products.filter(p => p.status === 'low').length;
        const outOfStockCount = this.products.filter(p => p.status === 'out').length;
        
        if (lowStockCount > 0) {
            this.showToast(`${lowStockCount} productos con stock bajo`, 'warning');
        }
        
        if (outOfStockCount > 0) {
            this.showToast(`${outOfStockCount} productos agotados`, 'error');
        }
        
        // Verificar si necesita backup
        if (!this.lastBackup || (new Date() - new Date(this.lastBackup)) > 7 * 24 * 60 * 60 * 1000) {
            this.showToast('Realiza un backup de tus datos', 'info');
        }
    }

    // ============ EXPORTAR INVENTARIO ============
    exportInventory() {
        const data = this.products.map(p => ({
            ID: p.id,
            Producto: p.name,
            Categoría: p.category,
            Marca: p.brand,
            Color: p.color,
            Talla: p.size,
            Stock: p.stock,
            'Stock Mínimo': p.minStock,
            'Precio Compra': p.purchasePrice,
            'Precio Venta': p.salePrice,
            'Margen %': p.salePrice && p.purchasePrice ? 
                (((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(2) : 0,
            Estado: this.getStatusText(p.status),
            Proveedor: p.supplier || '',
            'Código Barras': p.barcode || '',
            Etiquetas: p.tags ? p.tags.join(', ') : '',
            'Fecha Creación': p.createdAt
        }));
        
        // Exportar a CSV
        let csv = Object.keys(data[0] || {}).join(',') + '\n';
        data.forEach(row => {
            csv += Object.values(row).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showToast('Inventario exportado en formato CSV', 'success');
    }

    // ============ NUEVAS FUNCIONALIDADES ============
    
    // 1. Sistema de Códigos de Barras
    generateBarcode(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return '';
        
        // Generar código de barras si no existe
        if (!product.barcode) {
            product.barcode = '890' + productId.toString().padStart(10, '0');
            this.saveData('products');
        }
        
        return product.barcode;
    }

    showBarcode(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const barcode = this.generateBarcode(productId);
        const modal = document.getElementById('barcodeModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="barcode-container">
                <h4>Código de Barras - ${product.name}</h4>
                <div class="barcode" id="barcodeCanvas"></div>
                <p><strong>Código:</strong> ${barcode}</p>
                <button class="btn-primary" onclick="system.printBarcode(${productId})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        `;
        
        this.showModal('barcodeModal');
        
        // Generar código de barras visual
        setTimeout(() => {
            if (typeof JsBarcode !== 'undefined') {
                JsBarcode("#barcodeCanvas", barcode, {
                    format: "CODE128",
                    width: 2,
                    height: 100,
                    displayValue: true
                });
            }
        }, 100);
    }

    // 2. Control de Proveedores
    addSupplier(supplierData) {
        if (!this.suppliers.includes(supplierData.name)) {
            this.suppliers.push(supplierData.name);
            this.saveData('suppliers');
            this.loadSuppliers();
            this.showToast('Proveedor agregado', 'success');
        }
    }

    loadSuppliersList() {
        const container = document.getElementById('suppliersList');
        if (!container) return;
        
        container.innerHTML = this.suppliers.map(supplier => `
            <div class="config-list-item">
                <span>${supplier}</span>
                <div class="item-actions">
                    <button class="btn-edit" onclick="system.editSupplier('${supplier}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteSupplier('${supplier}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 3. Sistema de Promociones
    createPromotion(promotionData) {
        const newPromotion = {
            id: Date.now(),
            ...promotionData,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this.promotions.push(newPromotion);
        this.saveData('promotions');
        this.showToast('Promoción creada', 'success');
    }

    loadPromotionsList() {
        const container = document.getElementById('promotionsList');
        if (!container) return;
        
        const activePromotions = this.promotions.filter(p => p.isActive);
        
        container.innerHTML = activePromotions.map(promo => `
            <div class="config-list-item">
                <div class="promotion-info">
                    <strong>${promo.name}</strong>
                    <small>${promo.description}</small>
                    <div class="promotion-dates">
                        <span>${promo.startDate} - ${promo.endDate}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="system.editPromotion(${promo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deletePromotion(${promo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 4. Exportación Avanzada
    exportToExcel() {
        // Usar SheetJS para exportar a Excel
        if (typeof XLSX === 'undefined') {
            this.showToast('Error: Librería XLSX no cargada', 'error');
            return;
        }
        
        const data = this.products.map(p => ({
            ID: p.id,
            Producto: p.name,
            Categoría: p.category,
            Marca: p.brand,
            Color: p.color,
            Talla: p.size,
            Stock: p.stock,
            'Precio Compra': p.purchasePrice,
            'Precio Venta': p.salePrice,
            Estado: this.getStatusText(p.status)
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");
        
        // Agregar hoja de ventas
        const salesData = this.sales.map(s => ({
            ID: s.id,
            Cliente: s.client.name,
            Productos: s.products.length,
            Total: s.total,
            Fecha: s.date,
            Método: s.paymentMethod
        }));
        const ws2 = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, ws2, "Ventas");
        
        XLSX.writeFile(wb, `reporte_jessica_boutique_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showToast('Reporte exportado a Excel', 'success');
    }

    // 5. Sistema de Backups Automáticos
    setupAutoBackup() {
        // Realizar backup cada 24 horas si no se ha hecho
        const lastBackup = localStorage.getItem('jb_lastBackup');
        const now = new Date();
        
        if (!lastBackup || (now - new Date(lastBackup)) > 24 * 60 * 60 * 1000) {
            setTimeout(() => {
                this.exportAllData();
                this.showToast('Backup automático realizado', 'info');
            }, 5000); // Esperar 5 segundos después de cargar
        }
        
        // Programar backup diario
        setInterval(() => {
            this.exportAllData();
            this.showToast('Backup automático realizado', 'info');
        }, 24 * 60 * 60 * 1000);
    }

    // 6. Notificaciones Inteligentes de Stock
    checkStockAlerts() {
        const lowStockProducts = this.products.filter(p => p.status === 'low');
        if (lowStockProducts.length > 0) {
            // Actualizar badge de notificaciones
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = lowStockProducts.length;
            }
        }
    }

    // 7. Cálculo de Rentabilidad por Producto
    calculateProductProfitability(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return 0;
        
        const salesForProduct = this.sales.filter(sale => 
            sale.products.some(p => p.id === productId)
        );
        
        const totalSold = salesForProduct.reduce((sum, sale) => {
            const item = sale.products.find(p => p.id === productId);
            return sum + (item ? item.quantity : 0);
        }, 0);
        
        const totalProfit = totalSold * (product.salePrice - product.purchasePrice);
        return totalProfit;
    }

    // 8. Sistema de Etiquetas
    loadTags() {
        const container = document.getElementById('tagFilter');
        if (!container) return;
        
        container.innerHTML = `
            <select id="filterTag">
                <option value="">Todas las etiquetas</option>
                ${this.tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
            </select>
        `;
        
        // Agregar event listener
        document.getElementById('filterTag')?.addEventListener('change', () => this.applyFilters());
    }

    // 9. Historial de Cambios
    logProductChange(productId, action, oldValue, newValue) {
        const change = {
            id: Date.now(),
            productId,
            action,
            oldValue,
            newValue,
            timestamp: new Date().toISOString(),
            user: 'Administrador'
        };
        
        this.changes.push(change);
        
        // Mantener solo los últimos 100 cambios
        if (this.changes.length > 100) {
            this.changes.shift();
        }
        
        this.saveData('changes');
    }

    viewProductHistory(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const productChanges = this.changes.filter(c => c.productId === productId);
        
        const modal = document.getElementById('productHistoryModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <h4>Historial de Cambios - ${product.name}</h4>
            <div class="history-list">
                ${productChanges.length > 0 ? productChanges.map(change => `
                    <div class="history-item">
                        <div class="history-action">
                            <strong>${this.getActionText(change.action)}</strong>
                            <small>${new Date(change.timestamp).toLocaleString()}</small>
                        </div>
                        ${change.oldValue !== null ? `
                            <div class="history-change">
                                <span class="old">${JSON.stringify(change.oldValue)}</span>
                                <i class="fas fa-arrow-right"></i>
                                <span class="new">${JSON.stringify(change.newValue)}</span>
                            </div>
                        ` : ''}
                    </div>
                `).join('') : '<p>No hay historial de cambios para este producto.</p>'}
            </div>
        `;
        
        this.showModal('productHistoryModal');
    }

    getActionText(action) {
        const actions = {
            'creación': 'Producto creado',
            'edición': 'Producto editado',
            'eliminación': 'Producto eliminado',
            'venta': 'Stock actualizado por venta'
        };
        return actions[action] || action;
    }

    // 10. Modo Presentación
    enablePresentationMode() {
        this.isPresentationMode = !this.isPresentationMode;
        
        if (this.isPresentationMode) {
            document.body.classList.add('presentation-mode');
            document.querySelectorAll('.sidebar, .top-bar, .btn-notification').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelector('.main-content').style.marginLeft = '0';
            this.showToast('Modo presentación activado', 'info');
        } else {
            document.body.classList.remove('presentation-mode');
            document.querySelectorAll('.sidebar, .top-bar, .btn-notification').forEach(el => {
                el.style.display = '';
            });
            document.querySelector('.main-content').style.marginLeft = 'var(--sidebar-width)';
            this.showToast('Modo presentación desactivado', 'info');
        }
    }

    // 11. Búsqueda por Voz
    startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window)) {
            this.showToast('La búsqueda por voz no está disponible en tu navegador', 'error');
            return;
        }
        
        if (!this.voiceRecognition) {
            this.voiceRecognition = new webkitSpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'es-ES';
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('searchInventory').value = transcript;
                this.searchProducts();
                this.showToast(`Buscando: "${transcript}"`, 'info');
            };
            
            this.voiceRecognition.onerror = (event) => {
                this.showToast('Error en el reconocimiento de voz', 'error');
            };
        }
        
        this.voiceRecognition.start();
        this.showToast('Escuchando... Habla ahora', 'info');
    }

    // 12. Atajos de Teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + N: Nueva venta
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showSection('ventas');
                this.newSale();
            }
            
            // Ctrl + P: Agregar producto
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.showSection('agregar');
            }
            
            // Ctrl + F: Buscar
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInventory');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl + S: Guardar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const productForm = document.getElementById('productForm');
                if (productForm) {
                    productForm.dispatchEvent(new Event('submit'));
                }
            }
            
            // Ctrl + E: Exportar
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportInventory();
            }
            
            // Esc: Cerrar modales
            if (e.key === 'Escape') {
                this.closeModal();
            }
            
            // F1: Ayuda
            if (e.key === 'F1') {
                e.preventDefault();
                this.showTutorial();
            }
            
            // F11: Modo presentación
            if (e.key === 'F11') {
                e.preventDefault();
                this.enablePresentationMode();
            }
        });
    }

    // 13. Tutorial Interactivo
    showTutorial() {
        const steps = [
            {
                title: 'Bienvenida a Jessica Boutique',
                content: 'Este sistema te ayudará a gestionar tu negocio de moda de manera eficiente.',
                icon: 'fas fa-store'
            },
            {
                title: 'Panel Principal',
                content: 'Aquí verás un resumen de tu negocio: ventas, stock, productos recientes.',
                icon: 'fas fa-home',
                action: () => this.showSection('dashboard')
            },
            {
                title: 'Gestión de Inventario',
                content: 'Aquí puedes ver, buscar, filtrar y editar todos tus productos.',
                icon: 'fas fa-boxes',
                action: () => this.showSection('inventario')
            },
            {
                title: 'Registro de Ventas',
                content: 'Aquí procesas nuevas ventas y consultas el historial.',
                icon: 'fas fa-shopping-cart',
                action: () => this.showSection('ventas')
            },
            {
                title: 'Estadísticas',
                content: 'Visualiza gráficos y análisis del rendimiento de tu negocio.',
                icon: 'fas fa-chart-line',
                action: () => this.showSection('estadisticas')
            },
            {
                title: 'Configuración',
                content: 'Personaliza categorías, colores, tallas y otros ajustes del sistema.',
                icon: 'fas fa-cog',
                action: () => this.showSection('configuracion')
            }
        ];
        
        let currentStep = 0;
        
        const showStep = (stepIndex) => {
            if (stepIndex >= steps.length) {
                document.getElementById('tutorialModal').classList.remove('active');
                document.getElementById('modalOverlay').classList.remove('active');
                return;
            }
            
            const step = steps[stepIndex];
            const modalBody = document.querySelector('#tutorialModal .modal-body');
            
            modalBody.innerHTML = `
                <div class="tutorial-step">
                    <div class="tutorial-icon">
                        <i class="${step.icon}"></i>
                    </div>
                    <h3>${step.title}</h3>
                    <p>${step.content}</p>
                    <div class="tutorial-progress">
                        ${steps.map((_, i) => `
                            <span class="${i === stepIndex ? 'active' : ''}"></span>
                        `).join('')}
                    </div>
                    <div class="tutorial-actions">
                        ${stepIndex > 0 ? `
                            <button class="btn-secondary" onclick="showStep(${stepIndex - 1})">
                                Anterior
                            </button>
                        ` : ''}
                        ${step.action ? `
                            <button class="btn-primary" onclick="${step.action.toString().replace('function () {', '').replace('}', '')}; showStep(${stepIndex + 1})">
                                Continuar
                            </button>
                        ` : `
                            <button class="btn-primary" onclick="showStep(${stepIndex + 1})">
                                ${stepIndex === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                            </button>
                        `}
                    </div>
                </div>
            `;
        };
        
        document.getElementById('tutorialModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        showStep(0);
    }

    // 14. Análisis Predictivo (ya implementado en predictSalesTrend)

    // 15. Sistema de Recordatorios
    setupReminders() {
        // Verificar recordatorios pendientes
        const today = new Date().toISOString().split('T')[0];
        const todayReminders = this.reminders.filter(r => r.date === today && !r.completed);
        
        todayReminders.forEach(reminder => {
            setTimeout(() => {
                this.showToast(`Recordatorio: ${reminder.title}`, 'info');
            }, reminder.time || 5000); // Mostrar después de 5 segundos por defecto
        });
    }

    addReminder(title, date, time) {
        this.reminders.push({
            id: Date.now(),
            title,
            date,
            time,
            completed: false,
            createdAt: new Date().toISOString()
        });
        this.saveData('reminders');
        this.showToast('Recordatorio agregado', 'success');
    }

    // 16. Exportación a PDF
    exportToPDF(type) {
        if (typeof jsPDF === 'undefined') {
            this.showToast('Error: Librería jsPDF no cargada', 'error');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Jessica Boutique', 20, 20);
        doc.setFontSize(12);
        doc.text(`Reporte generado: ${new Date().toLocaleDateString()}`, 20, 30);
        
        let y = 40;
        
        if (type === 'inventory') {
            doc.setFontSize(16);
            doc.text('Inventario de Productos', 20, y);
            y += 10;
            
            this.products.forEach((product, index) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(`${product.id}. ${product.name}`, 20, y);
                doc.text(`Stock: ${product.stock} | Precio: S/.${product.salePrice}`, 120, y);
                y += 8;
            });
        } else if (type === 'sales') {
            doc.setFontSize(16);
            doc.text('Historial de Ventas', 20, y);
            y += 10;
            
            this.sales.slice(0, 20).forEach((sale, index) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(`Venta #${sale.id} - ${sale.client.name}`, 20, y);
                doc.text(`Total: S/.${sale.total} | ${sale.date}`, 120, y);
                y += 8;
            });
        }
        
        doc.save(`reporte_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
        this.showToast(`Reporte PDF generado`, 'success');
    }

    // 17. Sincronización Offline
    setupOfflineSync() {
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());
        
        // Verificar estado inicial
        if (!navigator.onLine) {
            this.handleOfflineStatus();
        }
    }

    handleOnlineStatus() {
        this.isOffline = false;
        document.body.classList.remove('offline');
        this.showToast('Conexión restaurada', 'success');
        
        // Sincronizar datos pendientes si los hay
        this.syncPendingData();
    }

    handleOfflineStatus() {
        this.isOffline = true;
        document.body.classList.add('offline');
        this.showToast('Estás trabajando offline. Los cambios se guardarán localmente.', 'warning');
    }

    syncPendingData() {
        // Aquí podrías implementar la sincronización con un servidor
        // Por ahora solo mostramos un mensaje
        this.showToast('Datos sincronizados', 'info');
    }

    // 18. Validación Avanzada de Datos
    validateProductData(productData) {
        const errors = [];
        
        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }
        
        if (productData.purchasePrice <= 0) {
            errors.push('El precio de compra debe ser mayor a 0');
        }
        
        if (productData.salePrice <= productData.purchasePrice) {
            errors.push('El precio de venta debe ser mayor al de compra');
        }
        
        if (productData.stock < 0) {
            errors.push('El stock no puede ser negativo');
        }
        
        if (productData.minStock && productData.minStock < 0) {
            errors.push('El stock mínimo no puede ser negativo');
        }
        
        return errors;
    }

    // 19. Sistema de Puntos para Clientes
    calculateClientPoints(clientId) {
        const clientSales = this.sales.filter(sale => 
            sale.client.dni === clientId || sale.client.name === clientId
        );
        
        const totalSpent = clientSales.reduce((sum, sale) => sum + sale.total, 0);
        const points = Math.floor(totalSpent / 10); // 1 punto por cada S/. 10 gastados
        
        return {
            sales: clientSales.length,
            totalSpent: totalSpent,
            points: points,
            level: points >= 1000 ? 'Oro' : points >= 500 ? 'Plata' : 'Bronce'
        };
    }

    // 20. Generación de Reportes Automáticos
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const todaySales = this.sales.filter(sale => sale.date === today);
        
        const report = {
            date: today,
            totalSales: todaySales.length,
            totalRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
            productsSold: todaySales.reduce((sum, sale) => 
                sum + sale.products.reduce((qty, item) => qty + item.quantity, 0), 0),
            newClients: this.getNewClientsByPeriod('today').length,
            lowStockProducts: this.products.filter(p => p.status === 'low').length,
            generatedAt: new Date().toISOString()
        };
        
        this.reports.push(report);
        this.saveData('reports');
        
        // Mantener solo los últimos 30 reportes
        if (this.reports.length > 30) {
            this.reports.shift();
        }
        
        return report;
    }

    // 21. PWA (Progressive Web App)
    setupPWA() {
        // Detectar si la app se puede instalar
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar nuestro propio prompt
            this.showPWAPrompt();
        });
        
        // Detectar si la app ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('La app ya está instalada');
        }
    }

    showPWAPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.classList.add('active');
        }
    }

    hidePWAPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.classList.remove('active');
        }
    }

    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.showToast('¡App instalada!', 'success');
                } else {
                    this.showToast('Instalación cancelada', 'info');
                }
                this.deferredPrompt = null;
                this.hidePWAPrompt();
            });
        }
    }

    // ============ UTILIDADES GENERALES ============
    saveData(type) {
        const keys = {
            'products': 'jb_products',
            'categories': 'jb_categories',
            'colors': 'jb_colors',
            'sizes': 'jb_sizes',
            'pantsSizes': 'jb_pantsSizes',
            'sales': 'jb_sales',
            'clients': 'jb_clients',
            'suppliers': 'jb_suppliers',
            'promotions': 'jb_promotions',
            'reminders': 'jb_reminders',
            'reports': 'jb_reports',
            'changes': 'jb_changes',
            'tags': 'jb_tags',
            'productHistory': 'jb_productHistory'
        };
        
        if (keys[type]) {
            localStorage.setItem(keys[type], JSON.stringify(this[type]));
        }
    }

    saveAllData() {
        this.saveData('products');
        this.saveData('categories');
        this.saveData('colors');
        this.saveData('sizes');
        this.saveData('pantsSizes');
        this.saveData('sales');
        this.saveData('clients');
        this.saveData('suppliers');
        this.saveData('promotions');
        this.saveData('reminders');
        this.saveData('reports');
        this.saveData('changes');
        this.saveData('tags');
        this.saveData('productHistory');
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('es-ES', options);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            // Crear contenedor si no existe
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            container = toastContainer;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <div class="toast-content">
                <div class="toast-title">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Cerrar toast
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modalOverlay').classList.remove('active');
    }

    showConfirmation(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        // Guardar callback
        this.pendingAction = callback;
        
        this.showModal('confirmationModal');
    }

    executeConfirmAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.closeModal();
    }

    // Método para mostrar todas las notificaciones
    showAllNotifications() {
        this.showSection('configuracion');
        // Aquí podrías implementar una vista completa de notificaciones
        this.showToast('Vista de notificaciones en desarrollo', 'info');
    }
}

// Inicializar sistema
let system;
document.addEventListener('DOMContentLoaded', () => {
    system = new JessicaBoutique();
    
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
    });
});