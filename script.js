// Sistema Jessica Boutique - Versión Mejorada y Simplificada
class JessicaBoutique {
    constructor() {
        // Inicializar datos
        this.products = JSON.parse(localStorage.getItem('jb_products')) || this.getSampleProducts();
        this.categories = JSON.parse(localStorage.getItem('jb_categories')) || this.getSampleCategories();
        this.colors = JSON.parse(localStorage.getItem('jb_colors')) || this.getSampleColors();
        this.sizes = JSON.parse(localStorage.getItem('jb_sizes')) || this.getSampleSizes();
        this.pantsSizes = JSON.parse(localStorage.getItem('jb_pantsSizes')) || this.getSamplePantsSizes();
        this.sales = JSON.parse(localStorage.getItem('jb_sales')) || [];
        this.clients = JSON.parse(localStorage.getItem('jb_clients')) || [];
        
        // Estado actual
        this.currentPage = 1;
        this.productsPerPage = 10;
        this.filteredProducts = [...this.products];
        this.currentCart = [];
        this.currentSale = null;
        
        // Inicializar
        this.init();
    }

    // ============ INICIALIZACIÓN ============
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.updateDashboard();
        this.updateCurrentDate();
        this.showToast('¡Bienvenida a Jessica Boutique!', 'success');
    }

    setupEventListeners() {
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

        // Inventario
        document.getElementById('searchInventory')?.addEventListener('input', () => this.searchProducts());
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('exportInventory')?.addEventListener('click', () => this.exportInventory());
        document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());

        // Agregar Producto
        document.getElementById('productForm')?.addEventListener('submit', (e) => this.saveProduct(e));
        document.getElementById('productCategory')?.addEventListener('change', (e) => this.updateSizeOptions(e));
        document.getElementById('purchasePrice')?.addEventListener('input', () => this.calculateProfitMargin());
        document.getElementById('salePrice')?.addEventListener('input', () => this.calculateProfitMargin());

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
        document.getElementById('clearData')?.addEventListener('click', () => this.confirmClearData());

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
            'dashboard': 'Dashboard',
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
        
        document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
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
        document.getElementById('dailyRevenue').textContent = `$${dailyRevenue.toFixed(2)}`;
        document.getElementById('lowStock').textContent = lowStockProducts;
        
        // Actualizar productos recientes
        this.loadRecentProducts();
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
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>$${product.salePrice.toFixed(2)}</td>
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
                    <td colspan="9" style="text-align: center; padding: 40px;">
                        <i class="fas fa-box-open" style="font-size: 48px; color: #ddd;"></i>
                        <p style="color: #999; margin-top: 10px;">No se encontraron productos</p>
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
                <td>$${product.salePrice.toFixed(2)}</td>
                <td><span class="status-badge ${product.status}">${this.getStatusText(product.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="system.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="system.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusText(status) {
        const texts = {
            'available': 'Disponible',
            'low': 'Stock Bajo',
            'out': 'Agotado'
        };
        return texts[status] || status;
    }

    searchProducts() {
        const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updatePagination();
    }

    applyFilters() {
        const category = document.getElementById('filterCategory').value;
        const status = document.getElementById('filterStatus').value;
        
        this.filteredProducts = this.products.filter(product => {
            if (category && product.category !== category) return false;
            if (status && product.status !== status) return false;
            return true;
        });
        
        this.currentPage = 1;
        this.renderInventoryTable();
        this.updatePagination();
        this.updateInventorySummary();
    }

    clearFilters() {
        document.getElementById('searchInventory').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterStatus').value = '';
        this.loadInventory();
    }

    updateInventorySummary() {
        const total = this.products.length;
        const value = this.products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
        const low = this.products.filter(p => p.status === 'low').length;
        const out = this.products.filter(p => p.status === 'out').length;
        
        document.getElementById('summaryTotal').textContent = total;
        document.getElementById('summaryValue').textContent = `$${value.toFixed(2)}`;
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
        for (let i = 1; i <= totalPages; i++) {
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
        
        if (select) {
            select.innerHTML = '<option value="">Selecciona una categoría</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todas las categorías</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    }

    loadColors() {
        const select = document.getElementById('productColor');
        if (select) {
            select.innerHTML = '<option value="">Selecciona un color</option>' +
                this.colors.map(color => `<option value="${color}">${color}</option>`).join('');
        }
    }

    loadSizes() {
        const container = document.getElementById('sizeOptions');
        if (!container) return;
        
        container.innerHTML = this.sizes.map(size => `
            <div class="size-option" data-size="${size}">${size}</div>
        `).join('');
        
        // Agregar event listeners
        container.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.size-option').forEach(opt => 
                    opt.classList.remove('selected')
                );
                option.classList.add('selected');
            });
        });
    }

    updateSizeOptions(e) {
        const category = e.target.value;
        const container = document.getElementById('sizeOptions');
        
        if (!container) return;
        
        let sizes = this.sizes;
        if (category === 'Pantalones') {
            sizes = this.pantsSizes;
        }
        
        container.innerHTML = sizes.map(size => `
            <div class="size-option" data-size="${size}">${size}</div>
        `).join('');
        
        // Agregar event listeners
        container.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.size-option').forEach(opt => 
                    opt.classList.remove('selected')
                );
                option.classList.add('selected');
            });
        });
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
        const selectedSize = document.querySelector('.size-option.selected');
        
        if (!name || !category || !color || !purchasePrice || !salePrice || !selectedSize) {
            this.showToast('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (salePrice <= purchasePrice) {
            this.showToast('El precio de venta debe ser mayor al de compra', 'error');
            return;
        }
        
        // Crear nuevo producto
        const newProduct = {
            id: this.generateId(),
            name: name,
            category: category,
            brand: document.getElementById('productBrand').value.trim() || 'Genérico',
            color: color,
            size: selectedSize.dataset.size,
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            stock: stock,
            minStock: minStock,
            status: stock === 0 ? 'out' : stock < minStock ? 'low' : 'available',
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        // Agregar a la lista
        this.products.push(newProduct);
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

    generateId() {
        const maxId = this.products.reduce((max, p) => Math.max(max, p.id || 0), 0);
        return maxId + 1;
    }

    resetProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('profitMargin').value = '0%';
        
        const sizeOptions = document.getElementById('sizeOptions');
        if (sizeOptions) {
            sizeOptions.querySelectorAll('.size-option').forEach(opt => 
                opt.classList.remove('selected')
            );
        }
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
            
            product.name = e.target.querySelector('input[type="text"]').value;
            product.category = e.target.querySelector('select').value;
            product.stock = parseInt(e.target.querySelectorAll('input')[1].value);
            product.purchasePrice = parseFloat(e.target.querySelectorAll('input')[2].value);
            product.salePrice = parseFloat(e.target.querySelectorAll('input')[3].value);
            product.status = product.stock === 0 ? 'out' : 
                           product.stock < product.minStock ? 'low' : 'available';
            
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
            `¿Estás seguro de eliminar "${product.name}"?`,
            () => {
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
                    ${p.name} - $${p.salePrice.toFixed(2)} (Stock: ${p.stock})
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
                price: product.salePrice,
                quantity: quantity,
                subtotal: quantity * product.salePrice
            });
        }
        
        this.updateCartDisplay();
        this.updatePaymentSummary();
        
        // Limpiar selección
        select.value = '';
        qtyInput.value = 1;
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
                    <div class="cart-item-details">${item.quantity} x $${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-price">$${item.subtotal.toFixed(2)}</span>
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
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('commission').textContent = `$${commission.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
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
                phone: document.getElementById('clientPhone').value.trim()
            },
            products: [...this.currentCart],
            subtotal: subtotal,
            commission: commission,
            total: total,
            paymentMethod: paymentMethod,
            date: new Date().toISOString().split('T')[0]
        };
        
        // Actualizar stock
        for (const item of this.currentCart) {
            const product = this.products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
                product.status = product.stock === 0 ? 'out' : 
                                product.stock < product.minStock ? 'low' : 'available';
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
        }
        
        // Mostrar éxito
        this.showToast(`Venta procesada por $${total.toFixed(2)}`, 'success');
        
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
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        if (recentSales.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
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
                <td>$${sale.total.toFixed(2)}</td>
                <td>${sale.date}</td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="system.viewSaleDetails(${sale.id})">
                        <i class="fas fa-eye"></i>
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
                    <span>${sale.date}</span>
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
                            <span>${p.quantity} x $${p.price.toFixed(2)} = $${p.subtotal.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="total-row">
                    <strong>Total:</strong>
                    <span>$${sale.total.toFixed(2)}</span>
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

    // ============ ESTADÍSTICAS ============
    loadStatistics() {
        this.updateStatsSummary();
        this.createCharts();
        this.loadTopProducts();
    }

    updateStatsSummary() {
        // Calcular ventas del período
        const period = document.getElementById('statsPeriod')?.value || 'month';
        const salesInPeriod = this.getSalesByPeriod(period);
        
        const totalSales = salesInPeriod.reduce((sum, sale) => sum + sale.total, 0);
        const totalProfit = salesInPeriod.reduce((sum, sale) => {
            const profit = sale.products.reduce((profitSum, item) => {
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    return profitSum + (item.subtotal - (item.quantity * product.purchasePrice));
                }
                return profitSum;
            }, 0);
            return sum + profit;
        }, 0);
        
        const newClients = this.getNewClientsByPeriod(period).length;
        const productsSold = salesInPeriod.reduce((sum, sale) => 
            sum + sale.products.reduce((qtySum, item) => qtySum + item.quantity, 0), 0);
        
        document.getElementById('totalSalesAmount').textContent = `$${totalSales.toFixed(2)}`;
        document.getElementById('totalProfitAmount').textContent = `$${totalProfit.toFixed(2)}`;
        document.getElementById('newClients').textContent = newClients;
        document.getElementById('productsSold').textContent = productsSold;
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
                        label: 'Ventas ($)',
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
                            '#f8bbd9', '#d1c4e9'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
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
                productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
            });
        });
        
        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, quantity]) => {
                const product = this.products.find(p => p.id === parseInt(id));
                return { product, quantity };
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
                    <span class="revenue">$${(item.quantity * item.product.salePrice).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
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
    }

    loadConfigLists() {
        this.loadCategoriesList();
        this.loadColorsList();
        this.loadSizesLists();
    }

    loadCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = this.categories.map(category => `
            <div class="config-list-item">
                <span>${category}</span>
                <button class="btn-delete" onclick="system.deleteCategory('${category}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    loadColorsList() {
        const container = document.getElementById('colorsList');
        if (!container) return;
        
        container.innerHTML = this.colors.map(color => `
            <div class="config-list-item">
                <span>${color}</span>
                <button class="btn-delete" onclick="system.deleteColor('${color}')">
                    <i class="fas fa-trash"></i>
                </button>
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
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `backup_jessica_boutique_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Datos exportados correctamente', 'success');
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
                
                this.saveAllData();
                this.loadInitialData();
                this.updateDashboard();
                this.showToast('Sistema reiniciado correctamente', 'success');
            }
        );
    }

    // ============ UTILIDADES ============
    saveData(type) {
        const keys = {
            'products': 'jb_products',
            'categories': 'jb_categories',
            'colors': 'jb_colors',
            'sizes': 'jb_sizes',
            'pantsSizes': 'jb_pantsSizes',
            'sales': 'jb_sales',
            'clients': 'jb_clients'
        };
        
        localStorage.setItem(keys[type], JSON.stringify(this[type]));
    }

    saveAllData() {
        this.saveData('products');
        this.saveData('categories');
        this.saveData('colors');
        this.saveData('sizes');
        this.saveData('pantsSizes');
        this.saveData('sales');
        this.saveData('clients');
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
        if (!container) return;
        
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

    exportInventory() {
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
        
        let csv = 'ID,Producto,Categoría,Marca,Color,Talla,Stock,Precio Compra,Precio Venta,Estado\n';
        data.forEach(row => {
            csv += `${row.ID},"${row.Producto}",${row.Categoría},${row.Marca},${row.Color},${row.Talla},${row.Stock},${row['Precio Compra']},${row['Precio Venta']},${row.Estado}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showToast('Inventario exportado en formato CSV', 'success');
    }
}

// Inicializar sistema
let system;
document.addEventListener('DOMContentLoaded', () => {
    system = new JessicaBoutique();
});

// Hacer funciones globales disponibles
window.system = system;