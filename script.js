// Sistema Jessica Boutique - Versión Multi-página
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
        
        // Variables para navegación
        this.currentPageName = this.getCurrentPageName();
        
        // Inicializar
        this.init();
    }

    // ============ INICIALIZACIÓN ============
    init() {
        this.applyDarkMode();
        this.setupEventListeners();
        this.loadInitialData();
        this.updateCurrentDate();
        
        // Ejecutar acciones específicas de la página actual
        this.executePageSpecificActions();
        
        this.showToast('¡Bienvenida a Jessica Boutique! Sistema mejorado cargado.', 'success');
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) return 'dashboard';
        if (path.includes('inventario.html')) return 'inventario';
        if (path.includes('agregar.html')) return 'agregar';
        if (path.includes('ventas.html')) return 'ventas';
        if (path.includes('estadisticas.html')) return 'estadisticas';
        if (path.includes('configuracion.html')) return 'configuracion';
        return 'dashboard';
    }

    executePageSpecificActions() {
        switch(this.currentPageName) {
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

    // ============ EVENT LISTENERS ============
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

        // Botón de logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // Notificaciones
        document.getElementById('notificationLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showNotifications();
        });

        // Solo agregar event listeners específicos de cada página si existen
        this.setupPageSpecificEventListeners();
        
        // Modales (si existen en la página)
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        document.getElementById('cancelConfirm')?.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmAction')?.addEventListener('click', () => this.executeConfirmAction());
    }

    setupPageSpecificEventListeners() {
        switch(this.currentPageName) {
            case 'dashboard':
                // No hay listeners específicos para dashboard
                break;
            case 'inventario':
                this.setupInventoryEventListeners();
                break;
            case 'agregar':
                this.setupAddProductEventListeners();
                break;
            case 'ventas':
                this.setupSalesEventListeners();
                break;
            case 'estadisticas':
                this.setupStatsEventListeners();
                break;
            case 'configuracion':
                this.setupConfigEventListeners();
                break;
        }
    }

    setupInventoryEventListeners() {
        // Inventario
        document.getElementById('searchInventory')?.addEventListener('input', () => {
            this.searchProducts();
        });
        
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearFilters();
        });
        
        document.getElementById('exportInventory')?.addEventListener('click', () => this.exportInventory());
        document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
        document.getElementById('sortBy')?.addEventListener('change', () => this.applyFilters());
    }

    setupAddProductEventListeners() {
        // Agregar Producto
        document.getElementById('productForm')?.addEventListener('submit', (e) => this.saveProduct(e));
        document.getElementById('productCategory')?.addEventListener('change', (e) => this.updateSizeOptions(e));
        document.getElementById('purchasePrice')?.addEventListener('input', () => this.calculateProfitMargin());
        document.getElementById('salePrice')?.addEventListener('input', () => this.calculateProfitMargin());
        document.getElementById('addVariantBtn')?.addEventListener('click', () => this.addVariant());
    }

    setupSalesEventListeners() {
        // Ventas
        document.getElementById('addProductBtn')?.addEventListener('click', () => this.addToCart());
        document.getElementById('processSale')?.addEventListener('click', () => this.processSale());
        document.getElementById('clearSale')?.addEventListener('click', () => this.clearCart());
        document.getElementById('newSaleBtn')?.addEventListener('click', () => this.newSale());
        
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePaymentSummary());
        });
    }

    setupStatsEventListeners() {
        // Estadísticas
        document.getElementById('statsPeriod')?.addEventListener('change', () => {
            this.loadStatistics();
        });
    }

    setupConfigEventListeners() {
        // Configuración
        document.getElementById('addCategory')?.addEventListener('click', () => this.addNewCategory());
        document.getElementById('addColor')?.addEventListener('click', () => this.addNewColor());
        document.getElementById('addSize')?.addEventListener('click', () => this.addNewSize());
        document.getElementById('addPantsSize')?.addEventListener('click', () => this.addNewPantsSize());
        document.getElementById('darkModeToggle')?.addEventListener('change', () => this.toggleDarkMode());
        document.getElementById('exportData')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('importData')?.addEventListener('click', () => this.importData());
        document.getElementById('clearData')?.addEventListener('click', () => this.confirmClearData());
        
        // Pestañas de configuración
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchConfigTab(e);
            });
        });
    }

    // ============ DATOS DE EJEMPLO ============
    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Vestido de noche elegante",
                category: "Vestidos",
                brand: "Elegance",
                color: "Negro",
                size: "M",
                stock: 15,
                purchasePrice: 80.00,
                salePrice: 150.00,
                lowStockAlert: 5,
                status: "available",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Blusa de seda",
                category: "Blusas",
                brand: "SilkStyle",
                color: "Blanco",
                size: "S",
                stock: 8,
                purchasePrice: 40.00,
                salePrice: 85.00,
                lowStockAlert: 3,
                status: "low",
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 3,
                name: "Pantalón de mezclilla",
                category: "Pantalones",
                brand: "DenimCo",
                color: "Azul",
                size: "32",
                stock: 0,
                purchasePrice: 60.00,
                salePrice: 120.00,
                lowStockAlert: 5,
                status: "out",
                createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 4,
                name: "Falda plisada",
                category: "Faldas",
                brand: "ChicStyle",
                color: "Rojo",
                size: "S",
                stock: 12,
                purchasePrice: 35.00,
                salePrice: 75.00,
                lowStockAlert: 4,
                status: "available",
                createdAt: new Date(Date.now() - 259200000).toISOString()
            },
            {
                id: 5,
                name: "Chaqueta de cuero",
                category: "Chaquetas",
                brand: "LeatherWorks",
                color: "Marrón",
                size: "L",
                stock: 6,
                purchasePrice: 120.00,
                salePrice: 250.00,
                lowStockAlert: 3,
                status: "available",
                createdAt: new Date(Date.now() - 345600000).toISOString()
            }
        ];
    }

    getSampleCategories() {
        return ["Vestidos", "Blusas", "Pantalones", "Faldas", "Chaquetas", "Accesorios"];
    }

    getSampleColors() {
        return ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Morado", "Gris", "Marrón"];
    }

    getSampleSizes() {
        return ["XS", "S", "M", "L", "XL", "XXL"];
    }

    getSamplePantsSizes() {
        return ["28", "30", "32", "34", "36", "38"];
    }

    // ============ MANEJO DE DATOS ============
    saveAllData() {
        localStorage.setItem('jb_products', JSON.stringify(this.products));
        localStorage.setItem('jb_categories', JSON.stringify(this.categories));
        localStorage.setItem('jb_colors', JSON.stringify(this.colors));
        localStorage.setItem('jb_sizes', JSON.stringify(this.sizes));
        localStorage.setItem('jb_pantsSizes', JSON.stringify(this.pantsSizes));
        localStorage.setItem('jb_sales', JSON.stringify(this.sales));
        localStorage.setItem('jb_clients', JSON.stringify(this.clients));
    }

    loadInitialData() {
        this.updateCurrentDate();
        
        // Cargar categorías en los select
        this.loadCategories();
        this.loadColors();
        this.loadSizes();
        
        // Actualizar el menú activo
        this.updateActiveMenu();
    }

    loadCategories() {
        const categorySelects = document.querySelectorAll('#filterCategory, #productCategory, #variantColor');
        categorySelects.forEach(select => {
            if (select && select.id === 'filterCategory') {
                select.innerHTML = '<option value="">Todas las categorías</option>';
            } else if (select && select.id === 'productCategory') {
                select.innerHTML = '<option value="">Selecciona una categoría</option>';
            }
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
    }

    loadColors() {
        const colorSelects = document.querySelectorAll('#filterColor, #productColor');
        colorSelects.forEach(select => {
            if (select && select.id === 'filterColor') {
                select.innerHTML = '<option value="">Todos los colores</option>';
            } else if (select && select.id === 'productColor') {
                select.innerHTML = '<option value="">Selecciona un color</option>';
            }
            
            this.colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                select.appendChild(option);
            });
        });
    }

    loadSizes() {
        // Tallas generales
        const sizeOptions = document.getElementById('sizeOptions');
        if (sizeOptions) {
            sizeOptions.innerHTML = '';
            this.sizes.forEach(size => {
                const sizeBtn = document.createElement('button');
                sizeBtn.type = 'button';
                sizeBtn.className = 'size-option';
                sizeBtn.textContent = size;
                sizeBtn.dataset.size = size;
                sizeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));
                    sizeBtn.classList.add('selected');
                });
                sizeOptions.appendChild(sizeBtn);
            });
        }
    }

    // ============ DASHBOARD ============
    updateDashboard() {
        // Actualizar estadísticas
        const totalProducts = this.products.reduce((sum, product) => sum + product.stock, 0);
        const totalSales = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const today = new Date();
            return saleDate.toDateString() === today.toDateString();
        }).length;
        
        const dailyRevenue = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const today = new Date();
            return saleDate.toDateString() === today.toDateString();
        }).reduce((sum, sale) => sum + sale.total, 0);
        
        const lowStock = this.products.filter(p => p.status === 'low').length;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('dailyRevenue').textContent = `S/. ${dailyRevenue.toFixed(2)}`;
        document.getElementById('lowStock').textContent = lowStock;
        
        // Cargar productos recientes
        this.loadRecentProducts();
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
                    <strong>${product.name}</strong>
                    <small style="display: block; color: #666;">${product.brand}</small>
                </td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>S/. ${product.salePrice.toFixed(2)}</td>
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
                        <a href="agregar.html" class="btn-primary" style="margin-top: 15px;">
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
                    <strong>${product.name}</strong>
                    <small style="display: block; color: #666;">${product.brand}</small>
                </td>
                <td>${product.category}</td>
                <td>${product.brand}</td>
                <td>${product.color}</td>
                <td>${product.stock}</td>
                <td>S/. ${product.salePrice.toFixed(2)}</td>
                <td><span class="status-badge ${product.status}">${this.getStatusText(product.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-view" data-id="${product.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Agregar event listeners a los botones
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.editProduct(parseInt(btn.dataset.id)));
        });
        
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => this.deleteProduct(parseInt(btn.dataset.id)));
        });
        
        container.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => this.viewProductDetails(parseInt(btn.dataset.id)));
        });
    }

    updateInventorySummary() {
        const totalProducts = this.filteredProducts.length;
        const inventoryValue = this.filteredProducts.reduce((sum, product) => 
            sum + (product.stock * product.purchasePrice), 0);
        const lowStock = this.filteredProducts.filter(p => p.status === 'low').length;
        const outOfStock = this.filteredProducts.filter(p => p.status === 'out').length;
        
        document.getElementById('summaryTotal').textContent = totalProducts;
        document.getElementById('summaryValue').textContent = `S/. ${inventoryValue.toFixed(2)}`;
        document.getElementById('summaryLow').textContent = lowStock;
        document.getElementById('summaryOut').textContent = outOfStock;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageNumbers = document.getElementById('pageNumbers');
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('span');
                pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => this.goToPage(i));
                pageNumbers.appendChild(pageBtn);
            }
        }
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

    searchProducts() {
        const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.color.toLowerCase().includes(searchTerm)
        );
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updatePagination();
        this.updateInventorySummary();
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

    sortProducts(sortBy) {
        switch(sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price':
                this.filteredProducts.sort((a, b) => a.salePrice - b.salePrice);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.salePrice - a.salePrice);
                break;
            case 'stock':
                this.filteredProducts.sort((a, b) => a.stock - b.stock);
                break;
            case 'stock-desc':
                this.filteredProducts.sort((a, b) => b.stock - a.stock);
                break;
            case 'color':
                this.filteredProducts.sort((a, b) => a.color.localeCompare(b.color));
                break;
            case 'brand':
                this.filteredProducts.sort((a, b) => a.brand.localeCompare(b.brand));
                break;
        }
    }

    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterColor').value = '';
        document.getElementById('filterBrand').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('sortBy').value = '';
        document.getElementById('searchInventory').value = '';
        this.loadInventory();
    }

    // ============ AGREGAR PRODUCTO ============
    updateSizeOptions(e) {
        const category = e.target.value;
        const sizeOptions = document.getElementById('sizeOptions');
        
        if (sizeOptions) {
            sizeOptions.innerHTML = '';
            let sizes = this.sizes;
            
            if (category === 'Pantalones') {
                sizes = this.pantsSizes;
            }
            
            sizes.forEach(size => {
                const sizeBtn = document.createElement('button');
                sizeBtn.type = 'button';
                sizeBtn.className = 'size-option';
                sizeBtn.textContent = size;
                sizeBtn.dataset.size = size;
                sizeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));
                    sizeBtn.classList.add('selected');
                });
                sizeOptions.appendChild(sizeBtn);
            });
        }
    }

    calculateProfitMargin() {
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
        
        if (purchasePrice > 0 && salePrice > 0) {
            const profit = salePrice - purchasePrice;
            const margin = (profit / purchasePrice) * 100;
            document.getElementById('profitMargin').value = `${margin.toFixed(2)}%`;
        } else {
            document.getElementById('profitMargin').value = '0%';
        }
    }

    addVariant() {
        const color = document.getElementById('variantColor').value;
        const size = document.querySelector('#variantSizeOptions .size-option.selected')?.dataset.size;
        const stock = parseInt(document.getElementById('variantStock').value) || 1;
        
        if (!color || !size) {
            this.showToast('Por favor, selecciona color y talla para la variante', 'error');
            return;
        }
        
        const variant = {
            id: Date.now(),
            color,
            size,
            stock
        };
        
        this.currentVariants.push(variant);
        this.updateVariantsList();
        
        // Limpiar formulario de variante
        document.getElementById('variantColor').value = '';
        document.querySelectorAll('#variantSizeOptions .size-option').forEach(btn => 
            btn.classList.remove('selected'));
        document.getElementById('variantStock').value = 1;
    }

    updateVariantsList() {
        const container = document.getElementById('variantsList');
        if (!container) return;
        
        if (this.currentVariants.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay variantes agregadas</p>';
            return;
        }
        
        container.innerHTML = this.currentVariants.map(variant => `
            <div class="variant-item">
                <div class="variant-details">
                    <div class="variant-info">
                        <span><i class="fas fa-palette"></i> ${variant.color}</span>
                        <span><i class="fas fa-ruler"></i> Talla: ${variant.size}</span>
                        <span><i class="fas fa-box"></i> Cantidad: ${variant.stock}</span>
                    </div>
                </div>
                <div class="variant-actions">
                    <button class="btn-danger" data-id="${variant.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a los botones de eliminar
        container.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', () => {
                const variantId = parseInt(btn.dataset.id);
                this.currentVariants = this.currentVariants.filter(v => v.id !== variantId);
                this.updateVariantsList();
            });
        });
    }

    resetProductForm() {
        document.getElementById('productForm')?.reset();
        this.currentVariants = [];
        this.updateVariantsList();
        document.getElementById('profitMargin').value = '0%';
        document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));
    }

    saveProduct(e) {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value;
        const productCategory = document.getElementById('productCategory').value;
        const productBrand = document.getElementById('productBrand').value;
        const productColor = document.getElementById('productColor').value;
        const selectedSize = document.querySelector('#sizeOptions .size-option.selected')?.dataset.size;
        const initialStock = parseInt(document.getElementById('initialStock').value) || 0;
        const lowStockAlert = parseInt(document.getElementById('lowStockAlert').value) || 5;
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
        
        // Validaciones básicas
        if (!productName || !productCategory || !productColor || !selectedSize) {
            this.showToast('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (initialStock < 0) {
            this.showToast('El stock inicial no puede ser negativo', 'error');
            return;
        }
        
        if (purchasePrice <= 0 || salePrice <= 0) {
            this.showToast('Los precios deben ser mayores a cero', 'error');
            return;
        }
        
        if (salePrice < purchasePrice) {
            this.showToast('El precio de venta debe ser mayor al precio de compra', 'error');
            return;
        }
        
        // Determinar estado del stock
        let status = 'available';
        if (initialStock === 0) {
            status = 'out';
        } else if (initialStock <= lowStockAlert) {
            status = 'low';
        }
        
        // Crear nuevo producto
        const newProduct = {
            id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
            name: productName,
            category: productCategory,
            brand: productBrand,
            color: productColor,
            size: selectedSize,
            stock: initialStock,
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            lowStockAlert: lowStockAlert,
            status: status,
            variants: [...this.currentVariants],
            createdAt: new Date().toISOString()
        };
        
        // Agregar producto
        this.products.push(newProduct);
        this.saveAllData();
        
        // Mostrar confirmación
        this.showToast('Producto agregado correctamente', 'success');
        
        // Redireccionar a inventario después de 2 segundos
        setTimeout(() => {
            window.location.href = 'inventario.html';
        }, 2000);
    }

    // ============ VENTAS ============
    newSale() {
        document.getElementById('saleFormContainer').style.display = 'block';
        this.currentCart = [];
        this.updateCart();
        this.updatePaymentSummary();
        document.getElementById('clientName').value = '';
        document.getElementById('clientDNI').value = '';
        document.getElementById('clientPhone').value = '';
        document.querySelector('input[name="payment"][value="efectivo"]').checked = true;
    }

    addToCart() {
        const productId = parseInt(document.getElementById('selectProduct').value);
        const quantity = parseInt(document.getElementById('productQty').value) || 1;
        
        if (!productId) {
            this.showToast('Por favor, selecciona un producto', 'error');
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Producto no encontrado', 'error');
            return;
        }
        
        if (product.stock < quantity) {
            this.showToast(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`, 'error');
            return;
        }
        
        // Verificar si el producto ya está en el carrito
        const existingItem = this.currentCart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.currentCart.push({
                productId: productId,
                name: product.name,
                price: product.salePrice,
                quantity: quantity,
                subtotal: product.salePrice * quantity
            });
        }
        
        this.updateCart();
        this.updatePaymentSummary();
        
        // Limpiar selección
        document.getElementById('selectProduct').value = '';
        document.getElementById('productQty').value = 1;
    }

    updateCart() {
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
                        Precio: S/. ${item.price.toFixed(2)} | Cantidad: ${item.quantity}
                    </div>
                </div>
                <div class="cart-item-price">S/. ${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="btn-danger" data-id="${item.productId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a los botones de eliminar
        container.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                this.currentCart = this.currentCart.filter(item => item.productId !== productId);
                this.updateCart();
                this.updatePaymentSummary();
            });
        });
    }

    updatePaymentSummary() {
        const subtotal = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        let commission = 0;
        
        if (paymentMethod === 'tarjeta') {
            commission = subtotal * 0.05; // 5% de comisión por tarjeta
        }
        
        const total = subtotal + commission;
        
        document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
        document.getElementById('commission').textContent = `S/. ${commission.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `S/. ${total.toFixed(2)}`;
    }

    clearCart() {
        this.currentCart = [];
        this.updateCart();
        this.updatePaymentSummary();
    }

    processSale() {
        const clientName = document.getElementById('clientName').value;
        const clientDNI = document.getElementById('clientDNI').value;
        const clientPhone = document.getElementById('clientPhone').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        if (!clientName) {
            this.showToast('Por favor, ingresa el nombre del cliente', 'error');
            return;
        }
        
        if (this.currentCart.length === 0) {
            this.showToast('Agrega al menos un producto a la venta', 'error');
            return;
        }
        
        // Calcular totales
        const subtotal = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const commission = paymentMethod === 'tarjeta' ? subtotal * 0.05 : 0;
        const total = subtotal + commission;
        
        // Actualizar stock de productos
        for (const item of this.currentCart) {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
                
                // Actualizar estado del producto
                if (product.stock === 0) {
                    product.status = 'out';
                } else if (product.stock <= product.lowStockAlert) {
                    product.status = 'low';
                } else {
                    product.status = 'available';
                }
            }
        }
        
        // Registrar la venta
        const newSale = {
            id: this.sales.length > 0 ? Math.max(...this.sales.map(s => s.id)) + 1 : 1,
            clientName: clientName,
            clientDNI: clientDNI,
            clientPhone: clientPhone,
            products: [...this.currentCart],
            subtotal: subtotal,
            commission: commission,
            total: total,
            paymentMethod: paymentMethod,
            date: new Date().toISOString()
        };
        
        this.sales.push(newSale);
        
        // Registrar cliente si es nuevo
        if (!this.clients.find(c => c.dni === clientDNI && clientDNI)) {
            this.clients.push({
                id: this.clients.length + 1,
                name: clientName,
                dni: clientDNI,
                phone: clientPhone,
                firstPurchase: new Date().toISOString(),
                totalPurchases: total
            });
        }
        
        // Guardar todos los datos
        this.saveAllData();
        
        // Mostrar confirmación
        this.showToast('Venta procesada correctamente', 'success');
        
        // Actualizar historial de ventas
        this.loadSalesHistory();
        
        // Reiniciar formulario
        this.newSale();
    }

    loadSalesHistory() {
        const container = document.getElementById('salesHistoryTable');
        if (!container) return;
        
        const recentSales = [...this.sales]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        if (recentSales.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ddd;"></i>
                        <p style="color: #999; margin-top: 10px;">No hay ventas registradas</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = recentSales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.clientName}</td>
                <td>${sale.products.length} productos</td>
                <td>S/. ${sale.total.toFixed(2)}</td>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn-view" data-id="${sale.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Agregar event listeners a los botones de ver detalles
        container.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => this.viewSaleDetails(parseInt(btn.dataset.id)));
        });
    }

    viewSaleDetails(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;
        
        const modalBody = document.querySelector('#saleDetailsModal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="sale-details">
                    <h4>Información del Cliente</h4>
                    <p><strong>Nombre:</strong> ${sale.clientName}</p>
                    <p><strong>DNI:</strong> ${sale.clientDNI || 'No especificado'}</p>
                    <p><strong>Teléfono:</strong> ${sale.clientPhone || 'No especificado'}</p>
                    <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleString()}</p>
                    <p><strong>Método de Pago:</strong> ${this.getPaymentMethodText(sale.paymentMethod)}</p>
                    
                    <h4 style="margin-top: 20px;">Productos</h4>
                    <table class="data-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.products.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>S/. ${item.price.toFixed(2)}</td>
                                    <td>S/. ${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="payment-summary" style="margin-top: 20px;">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>S/. ${sale.subtotal.toFixed(2)}</span>
                        </div>
                        ${sale.commission > 0 ? `
                            <div class="summary-row">
                                <span>Comisión (5%):</span>
                                <span>S/. ${sale.commission.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span>S/. ${sale.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal('saleDetailsModal');
        }
    }

    // ============ ESTADÍSTICAS ============
    loadStatistics() {
        this.updateStatsCards();
        this.loadCharts();
        this.loadTopProducts();
    }

    updateStatsCards() {
        const period = document.getElementById('statsPeriod')?.value || 'today';
        const today = new Date();
        
        let filteredSales = [...this.sales];
        
        // Filtrar por período
        switch(period) {
            case 'today':
                filteredSales = filteredSales.filter(sale => 
                    new Date(sale.date).toDateString() === today.toDateString());
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                filteredSales = filteredSales.filter(sale => 
                    new Date(sale.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                filteredSales = filteredSales.filter(sale => 
                    new Date(sale.date) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                filteredSales = filteredSales.filter(sale => 
                    new Date(sale.date) >= yearAgo);
                break;
        }
        
        // Calcular estadísticas
        const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalProfit = filteredSales.reduce((sum, sale) => {
            const profit = sale.products.reduce((prodSum, item) => {
                const product = this.products.find(p => p.id === item.productId);
                if (product) {
                    return prodSum + (item.quantity * (item.price - product.purchasePrice));
                }
                return prodSum;
            }, 0);
            return sum + profit;
        }, 0);
        
        const newClients = period === 'today' ? 
            this.clients.filter(c => new Date(c.firstPurchase).toDateString() === today.toDateString()).length : 0;
        
        const productsSold = filteredSales.reduce((sum, sale) => 
            sum + sale.products.reduce((prodSum, item) => prodSum + item.quantity, 0), 0);
        
        // Actualizar tarjetas
        document.getElementById('totalSalesAmount').textContent = `S/. ${totalSalesAmount.toFixed(2)}`;
        document.getElementById('totalProfitAmount').textContent = `S/. ${totalProfit.toFixed(2)}`;
        document.getElementById('newClients').textContent = newClients;
        document.getElementById('productsSold').textContent = productsSold;
    }

    loadCharts() {
        this.loadSalesChart();
        this.loadCategoryChart();
    }

    loadSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        // Datos de ejemplo para el gráfico
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const data = [1200, 1900, 1500, 2200, 1800, 2500, 2000];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas (S/.)',
                    data: data,
                    borderColor: '#7e57c2',
                    backgroundColor: 'rgba(126, 87, 194, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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

    loadCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        // Datos de ejemplo por categoría
        const categories = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Chaquetas'];
        const data = [35, 25, 20, 12, 8];
        const colors = ['#7e57c2', '#f06292', '#4caf50', '#2196f3', '#ff9800'];
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    loadTopProducts() {
        const container = document.getElementById('topProductsList');
        if (!container) return;
        
        // Calcular productos más vendidos
        const productSales = {};
        
        this.sales.forEach(sale => {
            sale.products.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        quantity: 0,
                        revenue: 0,
                        product: this.products.find(p => p.id === item.productId)
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        });
        
        const topProducts = Object.values(productSales)
            .filter(p => p.product)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        if (topProducts.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay datos de ventas disponibles</p>';
            return;
        }
        
        container.innerHTML = topProducts.map((item, index) => `
            <div class="product-rank">
                <div class="product-info">
                    <strong>${index + 1}. ${item.product.name}</strong>
                    <small>Categoría: ${item.product.category}</small>
                </div>
                <div class="product-stats">
                    <span class="sales-count">${item.quantity} unidades</span>
                    <span class="revenue">S/. ${item.revenue.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    // ============ CONFIGURACIÓN ============
    loadConfigLists() {
        this.loadCategoriesList();
        this.loadColorsList();
        this.loadSizesLists();
        
        // Cargar estado del modo oscuro
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = localStorage.getItem('jb_darkMode') === 'true';
        }
    }

    loadCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = this.categories.map(category => `
            <div class="config-list-item editable">
                <input type="text" class="edit-input" value="${category}" readonly>
                <div class="item-actions">
                    <button class="btn-save" data-item="${category}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" data-item="${category}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners
        container.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.dataset.item;
                const input = btn.closest('.config-list-item').querySelector('.edit-input');
                input.readOnly = false;
                input.focus();
                
                // Cambiar ícono a guardar
                btn.innerHTML = '<i class="fas fa-save"></i>';
                btn.classList.remove('btn-save');
                btn.classList.add('btn-success');
                
                // Guardar al presionar Enter
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.updateCategory(item, input.value);
                    }
                });
                
                // Cambiar evento del botón
                btn.onclick = () => this.updateCategory(item, input.value);
            });
        });
        
        container.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.dataset.item;
                this.deleteCategory(item);
            });
        });
    }

    loadColorsList() {
        const container = document.getElementById('colorsList');
        if (!container) return;
        
        container.innerHTML = this.colors.map(color => `
            <div class="config-list-item editable">
                <input type="text" class="edit-input" value="${color}" readonly>
                <div class="item-actions">
                    <button class="btn-save" data-item="${color}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" data-item="${color}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners (similar a categorías)
        container.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.dataset.item;
                const input = btn.closest('.config-list-item').querySelector('.edit-input');
                input.readOnly = false;
                input.focus();
                
                btn.innerHTML = '<i class="fas fa-save"></i>';
                btn.classList.remove('btn-save');
                btn.classList.add('btn-success');
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.updateColor(item, input.value);
                    }
                });
                
                btn.onclick = () => this.updateColor(item, input.value);
            });
        });
        
        container.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.dataset.item;
                this.deleteColor(item);
            });
        });
    }

    loadSizesLists() {
        // Tallas generales
        const sizesList = document.getElementById('sizesList');
        if (sizesList) {
            sizesList.innerHTML = this.sizes.map(size => `
                <div class="config-list-item">
                    <span>${size}</span>
                    <div class="item-actions">
                        <button class="btn-danger" data-item="${size}" data-type="size">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            sizesList.querySelectorAll('.btn-danger').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.dataset.item;
                    const type = btn.dataset.type;
                    this.deleteSize(item, type);
                });
            });
        }
        
        // Tallas de pantalón
        const pantsSizesList = document.getElementById('pantsSizesList');
        if (pantsSizesList) {
            pantsSizesList.innerHTML = this.pantsSizes.map(size => `
                <div class="config-list-item">
                    <span>${size}</span>
                    <div class="item-actions">
                        <button class="btn-danger" data-item="${size}" data-type="pantsSize">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            pantsSizesList.querySelectorAll('.btn-danger').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.dataset.item;
                    const type = btn.dataset.type;
                    this.deleteSize(item, type);
                });
            });
        }
    }

    switchConfigTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.tab;
        
        // Remover activo de todas las pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activar pestaña seleccionada
        e.currentTarget.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    addNewCategory() {
        const input = document.getElementById('newCategory');
        const category = input.value.trim();
        
        if (!category) {
            this.showToast('Por favor, ingresa un nombre para la categoría', 'error');
            return;
        }
        
        if (this.categories.includes(category)) {
            this.showToast('Esta categoría ya existe', 'error');
            return;
        }
        
        this.categories.push(category);
        this.saveAllData();
        this.loadCategories();
        this.loadCategoriesList();
        
        input.value = '';
        this.showToast('Categoría agregada correctamente', 'success');
    }

    updateCategory(oldName, newName) {
        if (!newName.trim()) {
            this.showToast('El nombre no puede estar vacío', 'error');
            return;
        }
        
        if (oldName !== newName && this.categories.includes(newName)) {
            this.showToast('Esta categoría ya existe', 'error');
            return;
        }
        
        // Actualizar en la lista
        const index = this.categories.indexOf(oldName);
        if (index !== -1) {
            this.categories[index] = newName;
        }
        
        // Actualizar en todos los productos
        this.products.forEach(product => {
            if (product.category === oldName) {
                product.category = newName;
            }
        });
        
        this.saveAllData();
        this.loadCategories();
        this.loadCategoriesList();
        this.showToast('Categoría actualizada correctamente', 'success');
    }

    deleteCategory(category) {
        // Verificar si hay productos usando esta categoría
        const productsWithCategory = this.products.filter(p => p.category === category);
        
        if (productsWithCategory.length > 0) {
            this.showConfirmation(
                'Eliminar Categoría',
                `Hay ${productsWithCategory.length} productos usando esta categoría. ¿Estás seguro de eliminarla?`,
                () => {
                    this.categories = this.categories.filter(c => c !== category);
                    this.saveAllData();
                    this.loadCategories();
                    this.loadCategoriesList();
                    this.showToast('Categoría eliminada correctamente', 'success');
                }
            );
        } else {
            this.categories = this.categories.filter(c => c !== category);
            this.saveAllData();
            this.loadCategories();
            this.loadCategoriesList();
            this.showToast('Categoría eliminada correctamente', 'success');
        }
    }

    addNewColor() {
        const input = document.getElementById('newColor');
        const color = input.value.trim();
        
        if (!color) {
            this.showToast('Por favor, ingresa un nombre para el color', 'error');
            return;
        }
        
        if (this.colors.includes(color)) {
            this.showToast('Este color ya existe', 'error');
            return;
        }
        
        this.colors.push(color);
        this.saveAllData();
        this.loadColors();
        this.loadColorsList();
        
        input.value = '';
        this.showToast('Color agregado correctamente', 'success');
    }

    updateColor(oldName, newName) {
        if (!newName.trim()) {
            this.showToast('El nombre no puede estar vacío', 'error');
            return;
        }
        
        if (oldName !== newName && this.colors.includes(newName)) {
            this.showToast('Este color ya existe', 'error');
            return;
        }
        
        // Actualizar en la lista
        const index = this.colors.indexOf(oldName);
        if (index !== -1) {
            this.colors[index] = newName;
        }
        
        // Actualizar en todos los productos
        this.products.forEach(product => {
            if (product.color === oldName) {
                product.color = newName;
            }
        });
        
        this.saveAllData();
        this.loadColors();
        this.loadColorsList();
        this.showToast('Color actualizado correctamente', 'success');
    }

    deleteColor(color) {
        // Verificar si hay productos usando este color
        const productsWithColor = this.products.filter(p => p.color === color);
        
        if (productsWithColor.length > 0) {
            this.showConfirmation(
                'Eliminar Color',
                `Hay ${productsWithColor.length} productos usando este color. ¿Estás seguro de eliminarlo?`,
                () => {
                    this.colors = this.colors.filter(c => c !== color);
                    this.saveAllData();
                    this.loadColors();
                    this.loadColorsList();
                    this.showToast('Color eliminado correctamente', 'success');
                }
            );
        } else {
            this.colors = this.colors.filter(c => c !== color);
            this.saveAllData();
            this.loadColors();
            this.loadColorsList();
            this.showToast('Color eliminado correctamente', 'success');
        }
    }

    addNewSize() {
        const input = document.getElementById('newSize');
        const sizesText = input.value.trim();
        
        if (!sizesText) {
            this.showToast('Por favor, ingresa las tallas', 'error');
            return;
        }
        
        const newSizes = sizesText.split(',').map(s => s.trim()).filter(s => s);
        
        newSizes.forEach(size => {
            if (!this.sizes.includes(size)) {
                this.sizes.push(size);
            }
        });
        
        this.saveAllData();
        this.loadSizesLists();
        
        input.value = '';
        this.showToast('Tallas agregadas correctamente', 'success');
    }

    addNewPantsSize() {
        const input = document.getElementById('newPantsSize');
        const sizesText = input.value.trim();
        
        if (!sizesText) {
            this.showToast('Por favor, ingresa las tallas de pantalón', 'error');
            return;
        }
        
        const newSizes = sizesText.split(',').map(s => s.trim()).filter(s => s);
        
        newSizes.forEach(size => {
            if (!this.pantsSizes.includes(size)) {
                this.pantsSizes.push(size);
            }
        });
        
        this.saveAllData();
        this.loadSizesLists();
        
        input.value = '';
        this.showToast('Tallas de pantalón agregadas correctamente', 'success');
    }

    deleteSize(size, type) {
        if (type === 'size') {
            this.sizes = this.sizes.filter(s => s !== size);
        } else if (type === 'pantsSize') {
            this.pantsSizes = this.pantsSizes.filter(s => s !== size);
        }
        
        this.saveAllData();
        this.loadSizesLists();
        this.showToast('Talla eliminada correctamente', 'success');
    }

    // ============ MODO OSCURO ============
    applyDarkMode() {
        if (localStorage.getItem('jb_darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('jb_darkMode', isDarkMode.toString());
        this.showToast(`Modo ${isDarkMode ? 'oscuro' : 'claro'} activado`, 'success');
    }

    // ============ IMPORT/EXPORT ============
    exportInventory() {
        const data = JSON.stringify(this.filteredProducts, null, 2);
        this.downloadFile('inventario_jessica_boutique.json', data, 'application/json');
        this.showToast('Inventario exportado correctamente', 'success');
    }

    exportAllData() {
        const allData = {
            products: this.products,
            categories: this.categories,
            colors: this.colors,
            sizes: this.sizes,
            pantsSizes: this.pantsSizes,
            sales: this.sales,
            clients: this.clients,
            exportDate: new Date().toISOString()
        };
        
        const data = JSON.stringify(allData, null, 2);
        this.downloadFile('backup_jessica_boutique.json', data, 'application/json');
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
                    
                    this.showConfirmation(
                        'Importar Datos',
                        'Esta acción sobrescribirá todos los datos actuales. ¿Estás seguro?',
                        () => {
                            // Importar datos
                            if (data.products) this.products = data.products;
                            if (data.categories) this.categories = data.categories;
                            if (data.colors) this.colors = data.colors;
                            if (data.sizes) this.sizes = data.sizes;
                            if (data.pantsSizes) this.pantsSizes = data.pantsSizes;
                            if (data.sales) this.sales = data.sales;
                            if (data.clients) this.clients = data.clients;
                            
                            this.saveAllData();
                            this.loadInitialData();
                            this.showToast('Datos importados correctamente', 'success');
                            
                            // Recargar página actual
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    );
                } catch (error) {
                    this.showToast('Error al importar datos. Archivo inválido.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    confirmClearData() {
        this.showConfirmation(
            'Limpiar Todos los Datos',
            '¿Estás seguro de que quieres eliminar todos los datos del sistema? Esta acción no se puede deshacer.',
            () => {
                localStorage.clear();
                this.showToast('Todos los datos han sido eliminados', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        );
    }

    // ============ UTILIDADES ============
    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }

    updateActiveMenu() {
        // Remover activo de todos los items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activar item correspondiente a la página actual
        const currentPage = this.currentPageName;
        const menuItem = document.querySelector(`.menu-item[href="${currentPage}.html"], .menu-item[href="index.html"]`);
        if (menuItem && currentPage === 'dashboard') {
            menuItem.classList.add('active');
        } else if (menuItem) {
            menuItem.classList.add('active');
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'available': return 'Disponible';
            case 'low': return 'Stock Bajo';
            case 'out': return 'Agotado';
            default: return status;
        }
    }

    getPaymentMethodText(method) {
        switch(method) {
            case 'efectivo': return 'Efectivo';
            case 'transferencia': return 'Transferencia';
            case 'tarjeta': return 'Tarjeta';
            default: return method;
        }
    }

    downloadFile(filename, content, type) {
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

    // ============ MANEJO DE PRODUCTOS ============
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modalBody = document.querySelector('#editProductModal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <form id="editProductForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="editProductName">Nombre</label>
                            <input type="text" id="editProductName" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editProductCategory">Categoría</label>
                            <select id="editProductCategory" required>
                                ${this.categories.map(cat => 
                                    `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editProductStock">Stock</label>
                            <input type="number" id="editProductStock" value="${product.stock}" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="editProductPrice">Precio de Venta</label>
                            <input type="number" id="editProductPrice" value="${product.salePrice}" step="0.01" min="0" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            `;
            
            // Agregar event listener al formulario
            document.getElementById('editProductForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct(productId);
            });
            
            this.showModal('editProductModal');
        }
    }

    updateProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        product.name = document.getElementById('editProductName').value;
        product.category = document.getElementById('editProductCategory').value;
        product.stock = parseInt(document.getElementById('editProductStock').value);
        product.salePrice = parseFloat(document.getElementById('editProductPrice').value);
        
        // Actualizar estado del producto
        if (product.stock === 0) {
            product.status = 'out';
        } else if (product.stock <= product.lowStockAlert) {
            product.status = 'low';
        } else {
            product.status = 'available';
        }
        
        this.saveAllData();
        
        // Actualizar vista si estamos en inventario
        if (this.currentPageName === 'inventario') {
            this.loadInventory();
        }
        
        this.closeModal();
        this.showToast('Producto actualizado correctamente', 'success');
    }

    deleteProduct(productId) {
        this.showConfirmation(
            'Eliminar Producto',
            '¿Estás seguro de que quieres eliminar este producto?',
            () => {
                this.products = this.products.filter(p => p.id !== productId);
                this.saveAllData();
                
                // Actualizar vista si estamos en inventario
                if (this.currentPageName === 'inventario') {
                    this.loadInventory();
                }
                
                this.showToast('Producto eliminado correctamente', 'success');
            }
        );
    }

    viewProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modalBody = document.querySelector('#editProductModal .modal-body');
        if (modalBody) {
            const profit = product.salePrice - product.purchasePrice;
            const margin = (profit / product.purchasePrice) * 100;
            
            modalBody.innerHTML = `
                <div class="product-details">
                    <h4>${product.name}</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <strong>Categoría:</strong>
                            <span>${product.category}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Marca:</strong>
                            <span>${product.brand}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Color:</strong>
                            <span>${product.color}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Talla:</strong>
                            <span>${product.size}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Stock:</strong>
                            <span class="status-badge ${product.status}">${product.stock} unidades</span>
                        </div>
                        <div class="detail-item">
                            <strong>Precio Compra:</strong>
                            <span>S/. ${product.purchasePrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Precio Venta:</strong>
                            <span>S/. ${product.salePrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Ganancia:</strong>
                            <span>S/. ${profit.toFixed(2)} (${margin.toFixed(2)}%)</span>
                        </div>
                        <div class="detail-item">
                            <strong>Alerta Stock:</strong>
                            <span>${product.lowStockAlert} unidades</span>
                        </div>
                        <div class="detail-item">
                            <strong>Fecha Ingreso:</strong>
                            <span>${new Date(product.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    ${product.variants && product.variants.length > 0 ? `
                        <h5 style="margin-top: 20px;">Variantes</h5>
                        <div class="variants-list">
                            ${product.variants.map(variant => `
                                <div class="variant-item">
                                    <span>${variant.color} - Talla ${variant.size}: ${variant.stock} unidades</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            this.showModal('editProductModal');
        }
    }

    // ============ NOTIFICACIONES ============
    showNotifications() {
        // Crear notificaciones de ejemplo
        const notifications = [
            {
                id: 1,
                title: 'Stock Bajo',
                message: '5 productos tienen stock bajo',
                type: 'warning',
                date: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Venta Exitosa',
                message: 'Se procesó una venta por S/. 450.00',
                type: 'success',
                date: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 3,
                title: 'Producto Agotado',
                message: 'El vestido de noche elegante se ha agotado',
                type: 'danger',
                date: new Date(Date.now() - 7200000).toISOString()
            }
        ];
        
        // Crear dropdown de notificaciones si no existe
        let dropdown = document.querySelector('.notification-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'notification-dropdown';
            
            const header = document.createElement('div');
            header.className = 'notification-header';
            header.innerHTML = `
                <h4>Notificaciones</h4>
                <button class="btn-clear">Limpiar</button>
            `;
            
            const list = document.createElement('div');
            list.className = 'notification-list';
            
            dropdown.appendChild(header);
            dropdown.appendChild(list);
            
            document.querySelector('.btn-notification').appendChild(dropdown);
            
            // Agregar event listener al botón limpiar
            header.querySelector('.btn-clear').addEventListener('click', () => {
                list.innerHTML = '<p class="empty-message">No hay notificaciones</p>';
                document.querySelector('.notification-badge').textContent = '0';
            });
        }
        
        // Actualizar lista de notificaciones
        const list = dropdown.querySelector('.notification-list');
        if (notifications.length === 0) {
            list.innerHTML = '<p class="empty-message">No hay notificaciones</p>';
        } else {
            list.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.type}">
                    <div class="notification-icon">
                        <i class="fas fa-${
                            notif.type === 'warning' ? 'exclamation-triangle' :
                            notif.type === 'success' ? 'check-circle' :
                            notif.type === 'danger' ? 'times-circle' : 'info-circle'
                        }"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-date">${new Date(notif.date).toLocaleTimeString()}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Mostrar/ocultar dropdown
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
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
                    window.location.href = 'index.html';
                }, 2000);
            }
        );
    }

    // ============ MODALES ============
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

    showConfirmation(title, message, confirmCallback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        this.pendingAction = confirmCallback;
        this.showModal('confirmationModal');
    }

    executeConfirmAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.closeModal();
    }

    // ============ TOAST ============
    showToast(message, type = 'info') {
        // Crear contenedor de toast si no existe
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Crear toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${
                type === 'success' ? 'check-circle' :
                type === 'error' ? 'times-circle' :
                type === 'warning' ? 'exclamation-triangle' : 'info-circle'
            }"></i>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Agregar event listener al botón cerrar
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

    // ============ CHECK STOCK ALERTS ============
    checkStockAlerts() {
        const lowStockProducts = this.products.filter(p => p.status === 'low');
        const outOfStockProducts = this.products.filter(p => p.status === 'out');
        
        if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
            // Actualizar badge de notificaciones
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = lowStockProducts.length + outOfStockProducts.length;
            }
        }
    }
}

// Inicializar sistema cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.system = new JessicaBoutique();
});