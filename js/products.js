/**
 * Módulo de gestión de productos para Jessica Boutique
 * Maneja CRUD de productos, inventario y variantes
 */

class ProductManager {
    constructor() {
        this.products = new Map();
        this.categories = new Map();
        this.variants = new Map();
        this.currentProductId = null;
        this.filters = {
            category: 'all',
            stock: 'all',
            status: 'active',
            search: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    async init() {
        console.log('🛍️ Inicializando gestor de productos...');
        
        try {
            // Cargar datos desde almacenamiento
            await this.loadFromStorage();
            
            // Configurar eventos
            this.setupEvents();
            
            // Verificar datos iniciales
            await this.checkInitialData();
            
            console.log('✅ Gestor de productos inicializado');
            console.log(`📦 Productos cargados: ${this.products.size}`);
            console.log(`📁 Categorías cargadas: ${this.categories.size}`);
            
        } catch (error) {
            console.error('❌ Error inicializando gestor de productos:', error);
            throw error;
        }
    }

    /**
     * Carga datos desde almacenamiento
     */
    async loadFromStorage() {
        // Cargar productos
        const storedProducts = Utils.getItem('products', []);
        this.products = new Map(storedProducts.map(p => [p.id, p]));
        
        // Cargar categorías
        const storedCategories = Utils.getItem('categories', []);
        this.categories = new Map(storedCategories.map(c => [c.id, c]));
        
        // Cargar variantes
        const storedVariants = Utils.getItem('product_variants', []);
        this.variants = new Map(storedVariants.map(v => [v.id, v]));
        
        // Cargar configuración
        const config = Utils.getItem('product_config', {});
        this.filters = { ...this.filters, ...config.filters };
        this.sortBy = config.sortBy || this.sortBy;
        this.sortOrder = config.sortOrder || this.sortOrder;
    }

    /**
     * Guarda datos en almacenamiento
     */
    async saveToStorage() {
        try {
            // Guardar productos
            const productsArray = Array.from(this.products.values());
            Utils.setItem('products', productsArray);
            
            // Guardar categorías
            const categoriesArray = Array.from(this.categories.values());
            Utils.setItem('categories', categoriesArray);
            
            // Guardar variantes
            const variantsArray = Array.from(this.variants.values());
            Utils.setItem('product_variants', variantsArray);
            
            // Guardar configuración
            Utils.setItem('product_config', {
                filters: this.filters,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder,
                lastUpdated: new Date().toISOString()
            });
            
            console.log('💾 Datos de productos guardados');
            
        } catch (error) {
            console.error('Error guardando datos de productos:', error);
            throw error;
        }
    }

    /**
     * Configura eventos del módulo
     */
    setupEvents() {
        // Escuchar eventos de productos
        window.addEventListener('product:create', this.handleCreateProduct.bind(this));
        window.addEventListener('product:update', this.handleUpdateProduct.bind(this));
        window.addEventListener('product:delete', this.handleDeleteProduct.bind(this));
        window.addEventListener('product:filter', this.handleFilterChange.bind(this));
        window.addEventListener('product:sort', this.handleSortChange.bind(this));
        
        // Escuchar eventos de inventario
        window.addEventListener('inventory:adjust', this.handleInventoryAdjustment.bind(this));
        window.addEventListener('inventory:transfer', this.handleInventoryTransfer.bind(this));
        
        // Escuchar eventos de sincronización
        window.addEventListener('sync:required', this.handleSyncRequired.bind(this));
        window.addEventListener('app:foreground', this.handleAppForeground.bind(this));
    }

    /**
     * Verifica datos iniciales
     */
    async checkInitialData() {
        // Si no hay productos, crear algunos de ejemplo
        if (this.products.size === 0) {
            console.log('Creando productos de ejemplo...');
            await this.createSampleProducts();
        }
        
        // Si no hay categorías, crear algunas de ejemplo
        if (this.categories.size === 0) {
            console.log('Creando categorías de ejemplo...');
            await this.createSampleCategories();
        }
    }

    /**
     * Crea productos de ejemplo
     */
    async createSampleProducts() {
        const sampleProducts = [
            {
                id: Utils.generateId('prod'),
                code: 'VF-2024-001',
                name: 'Vestido Floral Elegante',
                description: 'Vestido floral de verano con diseño elegante y cómodo',
                category: 'ropa',
                subcategory: 'vestidos',
                price: 39.99,
                costPrice: 22.50,
                initialStock: 45,
                currentStock: 45,
                minStock: 5,
                maxStock: 100,
                status: 'active',
                images: [],
                colors: ['#ec4899', '#3b82f6', '#10b981'],
                sizes: ['S', 'M', 'L', 'XL'],
                location: 'Estante A-3',
                supplier: 'Moda Elegante S.A.',
                tags: ['verano', 'floral', 'elegante'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: Utils.generateId('prod'),
                code: 'AC-2024-015',
                name: 'Reloj de Lujo Dorado',
                description: 'Reloj elegante con correa de cuero y detalles dorados',
                category: 'accesorios',
                subcategory: 'relojes',
                price: 89.99,
                costPrice: 45.00,
                initialStock: 18,
                currentStock: 3,
                minStock: 3,
                maxStock: 50,
                status: 'active',
                images: [],
                colors: ['#f59e0b', '#000000'],
                sizes: ['Única'],
                location: 'Caja de Joyería 2',
                supplier: 'Accesorios Premium',
                tags: ['lujo', 'dorado', 'elegante'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        for (const product of sampleProducts) {
            this.products.set(product.id, product);
        }
        
        await this.saveToStorage();
    }

    /**
     * Crea categorías de ejemplo
     */
    async createSampleCategories() {
        const sampleCategories = [
            {
                id: 'ropa',
                name: 'Ropa',
                description: 'Vestidos, blusas, pantalones, faldas',
                icon: 'shirt',
                color: 'from-pink-500 to-rose-500',
                status: 'active',
                productCount: 24,
                subcategories: ['vestidos', 'blusas', 'pantalones', 'faldas'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'accesorios',
                name: 'Accesorios',
                description: 'Relojes, joyería, gafas, bolsos',
                icon: 'watch',
                color: 'from-blue-500 to-cyan-500',
                status: 'active',
                productCount: 18,
                subcategories: ['relojes', 'joyeria', 'gafas', 'bolsos'],
                createdAt: new Date().toISOString()
            }
        ];
        
        for (const category of sampleCategories) {
            this.categories.set(category.id, category);
        }
        
        await this.saveToStorage();
    }

    // ==================== CRUD DE PRODUCTOS ====================

    /**
     * Crea un nuevo producto
     * @param {Object} productData - Datos del producto
     * @returns {Object} Producto creado
     */
    async createProduct(productData) {
        console.log('Creando nuevo producto...', productData);
        
        try {
            // Validar datos del producto
            this.validateProductData(productData);
            
            // Generar ID único
            const productId = Utils.generateId('prod');
            
            // Crear objeto de producto
            const product = {
                id: productId,
                code: productData.code || this.generateProductCode(productData.category),
                name: productData.name.trim(),
                description: productData.description?.trim() || '',
                category: productData.category,
                subcategory: productData.subcategory || '',
                price: parseFloat(productData.price) || 0,
                costPrice: parseFloat(productData.costPrice) || 0,
                initialStock: parseInt(productData.initialStock) || 0,
                currentStock: parseInt(productData.initialStock) || 0,
                minStock: parseInt(productData.minStock) || 5,
                maxStock: parseInt(productData.maxStock) || 100,
                status: productData.status || 'active',
                images: productData.images || [],
                colors: productData.colors || [],
                sizes: productData.sizes || [],
                location: productData.location || '',
                supplier: productData.supplier || '',
                tags: productData.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system', // En una app real, sería el ID del usuario
                metadata: productData.metadata || {}
            };
            
            // Guardar producto
            this.products.set(productId, product);
            
            // Actualizar contador de categoría
            await this.updateCategoryProductCount(product.category, 1);
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchProductEvent('created', product);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Producto "${product.name}" creado exitosamente`, 'success');
            }
            
            console.log('✅ Producto creado:', product);
            return product;
            
        } catch (error) {
            console.error('❌ Error creando producto:', error);
            throw error;
        }
    }

    /**
     * Actualiza un producto existente
     * @param {string} productId - ID del producto
     * @param {Object} updates - Actualizaciones a aplicar
     * @returns {Object} Producto actualizado
     */
    async updateProduct(productId, updates) {
        console.log(`Actualizando producto ${productId}...`, updates);
        
        try {
            // Verificar que el producto existe
            const product = this.products.get(productId);
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado`);
            }
            
            // Validar actualizaciones
            this.validateProductUpdates(updates);
            
            // Guardar categoría anterior
            const oldCategory = product.category;
            
            // Aplicar actualizaciones
            const updatedProduct = {
                ...product,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Actualizar en el mapa
            this.products.set(productId, updatedProduct);
            
            // Si cambió la categoría, actualizar contadores
            if (updates.category && updates.category !== oldCategory) {
                await this.updateCategoryProductCount(oldCategory, -1);
                await this.updateCategoryProductCount(updates.category, 1);
            }
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchProductEvent('updated', updatedProduct);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Producto "${updatedProduct.name}" actualizado`, 'success');
            }
            
            console.log('✅ Producto actualizado:', updatedProduct);
            return updatedProduct;
            
        } catch (error) {
            console.error(`❌ Error actualizando producto ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un producto
     * @param {string} productId - ID del producto
     * @param {boolean} permanent - Si es eliminación permanente
     * @returns {boolean} True si se eliminó
     */
    async deleteProduct(productId, permanent = false) {
        console.log(`Eliminando producto ${productId}...`);
        
        try {
            // Verificar que el producto existe
            const product = this.products.get(productId);
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado`);
            }
            
            if (permanent) {
                // Eliminación permanente
                this.products.delete(productId);
                
                // Eliminar variantes asociadas
                this.deleteProductVariants(productId);
                
                // Actualizar contador de categoría
                await this.updateCategoryProductCount(product.category, -1);
                
            } else {
                // Eliminación suave (cambiar estado)
                product.status = 'deleted';
                product.updatedAt = new Date().toISOString();
                this.products.set(productId, product);
            }
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchProductEvent('deleted', product);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Producto "${product.name}" ${permanent ? 'eliminado' : 'archivado'}`, 'success');
            }
            
            console.log(`✅ Producto ${productId} ${permanent ? 'eliminado' : 'archivado'}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error eliminando producto ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene un producto por ID
     * @param {string} productId - ID del producto
     * @returns {Object} Producto encontrado
     */
    getProduct(productId) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Producto ${productId} no encontrado`);
        }
        return { ...product };
    }

    /**
     * Obtiene todos los productos
     * @param {Object} options - Opciones de filtrado y ordenamiento
     * @returns {Array} Lista de productos
     */
    getProducts(options = {}) {
        let products = Array.from(this.products.values());
        
        // Aplicar filtros
        if (options.filters) {
            products = this.applyFilters(products, options.filters);
        } else {
            products = this.applyFilters(products, this.filters);
        }
        
        // Aplicar ordenamiento
        if (options.sortBy) {
            products = Utils.sortBy(products, options.sortBy, options.sortOrder || 'asc');
        } else {
            products = Utils.sortBy(products, this.sortBy, this.sortOrder);
        }
        
        // Aplicar paginación si se especifica
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            products = products.slice(start, end);
        }
        
        return products;
    }

    /**
     * Busca productos
     * @param {string} query - Término de búsqueda
     * @param {Array} fields - Campos donde buscar
     * @returns {Array} Productos encontrados
     */
    searchProducts(query, fields = ['name', 'code', 'description', 'tags']) {
        if (!query || query.trim() === '') {
            return this.getProducts();
        }
        
        const searchTerm = query.toLowerCase().trim();
        const products = Array.from(this.products.values());
        
        return products.filter(product => {
            return fields.some(field => {
                const value = product[field];
                
                if (Array.isArray(value)) {
                    // Buscar en arrays (como tags)
                    return value.some(item => 
                        item.toString().toLowerCase().includes(searchTerm)
                    );
                } else if (typeof value === 'string') {
                    // Buscar en strings
                    return value.toLowerCase().includes(searchTerm);
                } else if (typeof value === 'number') {
                    // Buscar en números
                    return value.toString().includes(searchTerm);
                }
                
                return false;
            });
        });
    }

    // ==================== GESTIÓN DE INVENTARIO ====================

    /**
     * Ajusta el stock de un producto
     * @param {string} productId - ID del producto
     * @param {number} quantity - Cantidad a ajustar (positivo o negativo)
     * @param {string} reason - Razón del ajuste
     * @param {string} notes - Notas adicionales
     * @returns {Object} Producto actualizado
     */
    async adjustStock(productId, quantity, reason = 'ajuste', notes = '') {
        console.log(`Ajustando stock de ${productId}: ${quantity} unidades`);
        
        try {
            // Verificar que el producto existe
            const product = this.products.get(productId);
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado`);
            }
            
            // Calcular nuevo stock
            const newStock = product.currentStock + quantity;
            
            // Verificar que no sea negativo
            if (newStock < 0) {
                throw new Error(`Stock no puede ser negativo. Stock actual: ${product.currentStock}, Ajuste: ${quantity}`);
            }
            
            // Actualizar producto
            const updatedProduct = await this.updateProduct(productId, {
                currentStock: newStock
            });
            
            // Registrar movimiento de inventario
            await this.logInventoryMovement({
                productId,
                productName: product.name,
                type: quantity > 0 ? 'entrada' : 'salida',
                quantity: Math.abs(quantity),
                previousStock: product.currentStock,
                newStock: newStock,
                reason,
                notes,
                date: new Date().toISOString()
            });
            
            // Verificar alertas de stock bajo
            this.checkStockAlerts(updatedProduct);
            
            return updatedProduct;
            
        } catch (error) {
            console.error(`❌ Error ajustando stock de ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Realiza una transferencia de inventario
     * @param {string} fromProductId - Producto origen
     * @param {string} toProductId - Producto destino
     * @param {number} quantity - Cantidad a transferir
     * @param {string} reason - Razón de la transferencia
     * @returns {Object} Resultado de la transferencia
     */
    async transferStock(fromProductId, toProductId, quantity, reason = 'transferencia') {
        console.log(`Transferiendo ${quantity} unidades de ${fromProductId} a ${toProductId}`);
        
        try {
            // Verificar productos
            const fromProduct = this.products.get(fromProductId);
            const toProduct = this.products.get(toProductId);
            
            if (!fromProduct || !toProduct) {
                throw new Error('Uno o ambos productos no existen');
            }
            
            // Verificar stock suficiente
            if (fromProduct.currentStock < quantity) {
                throw new Error(`Stock insuficiente en ${fromProduct.name}. Disponible: ${fromProduct.currentStock}`);
            }
            
            // Realizar transferencia
            await this.adjustStock(fromProductId, -quantity, reason, `Transferido a ${toProduct.name}`);
            await this.adjustStock(toProductId, quantity, reason, `Recibido de ${fromProduct.name}`);
            
            // Registrar transferencia
            await this.logTransfer({
                fromProductId,
                toProductId,
                quantity,
                reason,
                date: new Date().toISOString()
            });
            
            const result = {
                success: true,
                fromProduct: this.products.get(fromProductId),
                toProduct: this.products.get(toProductId),
                quantity,
                date: new Date().toISOString()
            };
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Transferencia de ${quantity} unidades realizada`, 'success');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Error en transferencia de stock:', error);
            throw error;
        }
    }

    /**
     * Verifica alertas de stock bajo
     * @param {Object} product - Producto a verificar
     */
    checkStockAlerts(product) {
        if (product.currentStock <= product.minStock) {
            // Disparar alerta de stock bajo
            this.dispatchAlert('low_stock', {
                productId: product.id,
                productName: product.name,
                currentStock: product.currentStock,
                minStock: product.minStock,
                threshold: Math.round((product.currentStock / product.minStock) * 100)
            });
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(
                    `¡Alerta! Stock bajo en "${product.name}" (${product.currentStock}/${product.minStock})`,
                    'warning'
                );
            }
        }
        
        if (product.currentStock === 0) {
            // Disparar alerta de stock agotado
            this.dispatchAlert('out_of_stock', {
                productId: product.id,
                productName: product.name,
                lastStockDate: new Date().toISOString()
            });
        }
    }

    /**
     * Obtiene productos con stock bajo
     * @param {number} threshold - Umbral (porcentaje del stock mínimo)
     * @returns {Array} Productos con stock bajo
     */
    getLowStockProducts(threshold = 100) {
        return Array.from(this.products.values()).filter(product => {
            if (product.status !== 'active') return false;
            if (product.minStock <= 0) return false;
            
            const percentage = (product.currentStock / product.minStock) * 100;
            return percentage <= threshold;
        });
    }

    /**
     * Obtiene productos agotados
     * @returns {Array} Productos sin stock
     */
    getOutOfStockProducts() {
        return Array.from(this.products.values()).filter(product => 
            product.status === 'active' && product.currentStock === 0
        );
    }

    // ==================== GESTIÓN DE VARIANTES ====================

    /**
     * Agrega una variante a un producto
     * @param {string} productId - ID del producto
     * @param {Object} variantData - Datos de la variante
     * @returns {Object} Variante creada
     */
    async addVariant(productId, variantData) {
        console.log(`Agregando variante a producto ${productId}...`, variantData);
        
        try {
            // Verificar que el producto existe
            const product = this.products.get(productId);
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado`);
            }
            
            // Validar datos de la variante
            this.validateVariantData(variantData);
            
            // Crear objeto de variante
            const variantId = Utils.generateId('var');
            const variant = {
                id: variantId,
                productId,
                sku: variantData.sku || this.generateVariantSKU(product.code, variantData),
                name: variantData.name || `${product.name} - ${variantData.color || variantData.size}`,
                color: variantData.color || '',
                size: variantData.size || '',
                material: variantData.material || '',
                price: variantData.price || product.price,
                costPrice: variantData.costPrice || product.costPrice,
                stock: variantData.stock || 0,
                minStock: variantData.minStock || product.minStock,
                images: variantData.images || [],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Guardar variante
            this.variants.set(variantId, variant);
            
            // Actualizar producto principal
            if (!product.variants) product.variants = [];
            product.variants.push(variantId);
            product.updatedAt = new Date().toISOString();
            this.products.set(productId, product);
            
            // Guardar cambios
            await this.saveToStorage();
            
            console.log('✅ Variante creada:', variant);
            return variant;
            
        } catch (error) {
            console.error(`❌ Error agregando variante a ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina variantes de un producto
     * @param {string} productId - ID del producto
     */
    deleteProductVariants(productId) {
        // Encontrar y eliminar todas las variantes del producto
        for (const [variantId, variant] of this.variants) {
            if (variant.productId === productId) {
                this.variants.delete(variantId);
            }
        }
    }

    // ==================== VALIDACIONES ====================

    /**
     * Valida datos de producto
     * @param {Object} productData - Datos a validar
     */
    validateProductData(productData) {
        const errors = [];
        
        // Nombre requerido
        if (!productData.name || productData.name.trim() === '') {
            errors.push('El nombre del producto es requerido');
        }
        
        // Categoría requerida
        if (!productData.category || productData.category.trim() === '') {
            errors.push('La categoría es requerida');
        }
        
        // Precio válido
        const price = parseFloat(productData.price);
        if (isNaN(price) || price < 0) {
            errors.push('El precio debe ser un número positivo');
        }
        
        // Stock inicial válido
        const stock = parseInt(productData.initialStock);
        if (isNaN(stock) || stock < 0) {
            errors.push('El stock inicial debe ser un número entero positivo');
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    /**
     * Valida actualizaciones de producto
     * @param {Object} updates - Actualizaciones a validar
     */
    validateProductUpdates(updates) {
        const errors = [];
        
        // Precio válido si se actualiza
        if (updates.price !== undefined) {
            const price = parseFloat(updates.price);
            if (isNaN(price) || price < 0) {
                errors.push('El precio debe ser un número positivo');
            }
        }
        
        // Stock válido si se actualiza
        if (updates.currentStock !== undefined) {
            const stock = parseInt(updates.currentStock);
            if (isNaN(stock) || stock < 0) {
                errors.push('El stock debe ser un número entero positivo');
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    /**
     * Valida datos de variante
     * @param {Object} variantData - Datos a validar
     */
    validateVariantData(variantData) {
        const errors = [];
        
        // Al menos color o tamaño debe estar especificado
        if (!variantData.color && !variantData.size) {
            errors.push('Debe especificar al menos color o tamaño');
        }
        
        // Stock válido
        if (variantData.stock !== undefined) {
            const stock = parseInt(variantData.stock);
            if (isNaN(stock) || stock < 0) {
                errors.push('El stock debe ser un número entero positivo');
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    // ==================== MÉTODOS DE AYUDA ====================

    /**
     * Genera código de producto
     * @param {string} category - Categoría del producto
     * @returns {string} Código generado
     */
    generateProductCode(category) {
        const prefix = category.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Genera SKU para variante
     * @param {string} productCode - Código del producto
     * @param {Object} variantData - Datos de la variante
     * @returns {string} SKU generado
     */
    generateVariantSKU(productCode, variantData) {
        const colorCode = variantData.color ? variantData.color.substring(1, 4) : '000';
        const sizeCode = variantData.size ? variantData.size.substring(0, 2).toUpperCase() : 'UN';
        return `${productCode}-${colorCode}-${sizeCode}`;
    }

    /**
     * Aplica filtros a productos
     * @param {Array} products - Productos a filtrar
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} Productos filtrados
     */
    applyFilters(products, filters) {
        return products.filter(product => {
            // Filtrar por categoría
            if (filters.category !== 'all' && product.category !== filters.category) {
                return false;
            }
            
            // Filtrar por estado de stock
            if (filters.stock !== 'all') {
                switch (filters.stock) {
                    case 'low':
                        if (product.currentStock > product.minStock || product.minStock === 0) {
                            return false;
                        }
                        break;
                    case 'out':
                        if (product.currentStock > 0) {
                            return false;
                        }
                        break;
                    case 'good':
                        if (product.currentStock <= product.minStock || product.currentStock === 0) {
                            return false;
                        }
                        break;
                }
            }
            
            // Filtrar por estado
            if (filters.status !== 'all' && product.status !== filters.status) {
                return false;
            }
            
            // Filtrar por búsqueda
            if (filters.search && filters.search.trim() !== '') {
                const searchTerm = filters.search.toLowerCase();
                const searchableFields = [
                    product.name,
                    product.code,
                    product.description,
                    ...(product.tags || [])
                ].join(' ').toLowerCase();
                
                if (!searchableFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Actualiza contador de productos en categoría
     * @param {string} categoryId - ID de la categoría
     * @param {number} delta - Cambio en el contador
     */
    async updateCategoryProductCount(categoryId, delta) {
        const category = this.categories.get(categoryId);
        if (category) {
            category.productCount = (category.productCount || 0) + delta;
            category.updatedAt = new Date().toISOString();
            this.categories.set(categoryId, category);
            await this.saveToStorage();
        }
    }

    /**
     * Registra movimiento de inventario
     * @param {Object} movement - Datos del movimiento
     */
    async logInventoryMovement(movement) {
        const movements = Utils.getItem('inventory_movements', []);
        movements.push({
            ...movement,
            id: Utils.generateId('mov'),
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo los últimos 1000 movimientos
        if (movements.length > 1000) {
            movements.splice(0, movements.length - 1000);
        }
        
        Utils.setItem('inventory_movements', movements);
    }

    /**
     * Registra transferencia
     * @param {Object} transfer - Datos de la transferencia
     */
    async logTransfer(transfer) {
        const transfers = Utils.getItem('inventory_transfers', []);
        transfers.push({
            ...transfer,
            id: Utils.generateId('trans'),
            timestamp: new Date().toISOString()
        });
        
        Utils.setItem('inventory_transfers', transfers);
    }

    // ==================== MANEJADORES DE EVENTOS ====================

    /**
     * Maneja creación de producto
     * @param {CustomEvent} event - Evento de creación
     */
    async handleCreateProduct(event) {
        const { productData } = event.detail;
        try {
            const product = await this.createProduct(productData);
            event.detail.callback?.success?.(product);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja actualización de producto
     * @param {CustomEvent} event - Evento de actualización
     */
    async handleUpdateProduct(event) {
        const { productId, updates } = event.detail;
        try {
            const product = await this.updateProduct(productId, updates);
            event.detail.callback?.success?.(product);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja eliminación de producto
     * @param {CustomEvent} event - Evento de eliminación
     */
    async handleDeleteProduct(event) {
        const { productId, permanent } = event.detail;
        try {
            const result = await this.deleteProduct(productId, permanent);
            event.detail.callback?.success?.(result);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja cambio de filtros
     * @param {CustomEvent} event - Evento de filtro
     */
    handleFilterChange(event) {
        const { filters } = event.detail;
        this.filters = { ...this.filters, ...filters };
        this.saveToStorage();
        this.dispatchProductEvent('filtered', { filters: this.filters });
    }

    /**
     * Maneja cambio de ordenamiento
     * @param {CustomEvent} event - Evento de ordenamiento
     */
    handleSortChange(event) {
        const { sortBy, sortOrder } = event.detail;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.saveToStorage();
        this.dispatchProductEvent('sorted', { sortBy: this.sortBy, sortOrder: this.sortOrder });
    }

    /**
     * Maneja ajuste de inventario
     * @param {CustomEvent} event - Evento de ajuste
     */
    async handleInventoryAdjustment(event) {
        const { productId, quantity, reason, notes } = event.detail;
        try {
            const product = await this.adjustStock(productId, quantity, reason, notes);
            event.detail.callback?.success?.(product);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja transferencia de inventario
     * @param {CustomEvent} event - Evento de transferencia
     */
    async handleInventoryTransfer(event) {
        const { fromProductId, toProductId, quantity, reason } = event.detail;
        try {
            const result = await this.transferStock(fromProductId, toProductId, quantity, reason);
            event.detail.callback?.success?.(result);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja sincronización requerida
     */
    async handleSyncRequired() {
        console.log('Sincronizando datos de productos...');
        // Aquí implementarías la sincronización con servidor
    }

    /**
     * Maneja aplicación en primer plano
     */
    async handleAppForeground() {
        // Verificar alertas de stock cuando la app vuelve a primer plano
        const lowStockProducts = this.getLowStockProducts();
        if (lowStockProducts.length > 0) {
            console.log(`⚠️ ${lowStockProducts.length} productos con stock bajo`);
        }
    }

    // ==================== EVENTOS ====================

    /**
     * Dispara evento de producto
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchProductEvent(action, data) {
        const event = new CustomEvent(`product:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Dispara alerta
     * @param {string} type - Tipo de alerta
     * @param {Object} data - Datos de la alerta
     */
    dispatchAlert(type, data) {
        const event = new CustomEvent(`alert:${type}`, { detail: data });
        window.dispatchEvent(event);
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Obtiene estadísticas de productos
     * @returns {Object} Estadísticas
     */
    getStatistics() {
        const products = Array.from(this.products.values());
        
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
        const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.price || 0), 0);
        
        const lowStockCount = this.getLowStockProducts().length;
        const outOfStockCount = this.getOutOfStockProducts().length;
        
        // Productos por categoría
        const productsByCategory = {};
        products.forEach(product => {
            if (product.status === 'active') {
                productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1;
            }
        });
        
        // Valor por categoría
        const valueByCategory = {};
        products.forEach(product => {
            if (product.status === 'active') {
                const value = product.currentStock * product.price;
                valueByCategory[product.category] = (valueByCategory[product.category] || 0) + value;
            }
        });
        
        return {
            totalProducts,
            activeProducts,
            totalStock,
            totalValue: Utils.formatCurrency(totalValue),
            lowStockCount,
            outOfStockCount,
            productsByCategory,
            valueByCategory,
            lastUpdated: new Date().toISOString()
        };
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    /**
     * Obtiene todas las categorías
     * @returns {Array} Lista de categorías
     */
    getCategories() {
        return Array.from(this.categories.values());
    }

    /**
     * Obtiene productos por categoría
     * @param {string} categoryId - ID de la categoría
     * @returns {Array} Productos de la categoría
     */
    getProductsByCategory(categoryId) {
        return this.getProducts({ 
            filters: { ...this.filters, category: categoryId } 
        });
    }

    /**
     * Obtiene productos más vendidos
     * @param {number} limit - Límite de resultados
     * @returns {Array} Productos más vendidos
     */
    getTopSellingProducts(limit = 10) {
        // En una implementación real, esto vendría de datos de ventas
        // Por ahora, retornamos productos con más stock como ejemplo
        return this.getProducts()
            .sort((a, b) => b.currentStock - a.currentStock)
            .slice(0, limit);
    }

    /**
     * Exporta productos a CSV
     * @returns {string} CSV de productos
     */
    exportToCSV() {
        const products = this.getProducts();
        
        // Encabezados
        const headers = [
            'Código',
            'Nombre',
            'Categoría',
            'Precio',
            'Stock Actual',
            'Stock Mínimo',
            'Ubicación',
            'Estado'
        ];
        
        // Datos
        const rows = products.map(product => [
            product.code,
            product.name,
            product.category,
            product.price,
            product.currentStock,
            product.minStock,
            product.location,
            product.status
        ]);
        
        // Crear CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Importa productos desde CSV
     * @param {string} csvContent - Contenido CSV
     * @returns {Object} Resultado de la importación
     */
    async importFromCSV(csvContent) {
        console.log('Importando productos desde CSV...');
        
        try {
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const results = {
                total: lines.length - 1,
                success: 0,
                errors: []
            };
            
            // Procesar cada línea
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    const productData = {};
                    
                    // Mapear headers a datos
                    headers.forEach((header, index) => {
                        productData[header.toLowerCase()] = values[index];
                    });
                    
                    // Convertir tipos
                    productData.price = parseFloat(productData.precio || productData.price);
                    productData.currentStock = parseInt(productData.stock || productData.currentstock);
                    productData.minStock = parseInt(productData.stockminimo || productData.minstock);
                    
                    // Crear producto
                    await this.createProduct({
                        name: productData.nombre,
                        code: productData.codigo,
                        category: productData.categoria,
                        price: productData.price,
                        initialStock: productData.currentStock,
                        minStock: productData.minStock,
                        location: productData.ubicacion,
                        status: productData.estado || 'active'
                    });
                    
                    results.success++;
                    
                } catch (error) {
                    results.errors.push({
                        line: i + 1,
                        error: error.message
                    });
                }
            }
            
            console.log(`✅ Importación completada: ${results.success} productos importados, ${results.errors.length} errores`);
            return results;
            
        } catch (error) {
            console.error('❌ Error importando productos:', error);
            throw error;
        }
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================
let productManagerInstance = null;

/**
 * Inicializa el gestor de productos
 * @returns {ProductManager} Instancia del gestor
 */
async function initProductManager() {
    if (!productManagerInstance) {
        productManagerInstance = new ProductManager();
        await productManagerInstance.init();
        window.productManager = productManagerInstance;
    }
    return productManagerInstance;
}

/**
 * Obtiene el gestor de productos
 * @returns {ProductManager} Instancia del gestor
 */
function getProductManager() {
    if (!productManagerInstance) {
        throw new Error('ProductManager no ha sido inicializado. Llama a initProductManager() primero.');
    }
    return productManagerInstance;
}

// ==================== FUNCIONES GLOBALES ====================
// Estas funciones están disponibles globalmente para facilitar el uso

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>} Producto creado
 */
window.createProduct = async function(productData) {
    const manager = getProductManager();
    return await manager.createProduct(productData);
};

/**
 * Actualiza un producto
 * @param {string} productId - ID del producto
 * @param {Object} updates - Actualizaciones
 * @returns {Promise<Object>} Producto actualizado
 */
window.updateProduct = async function(productId, updates) {
    const manager = getProductManager();
    return await manager.updateProduct(productId, updates);
};

/**
 * Elimina un producto
 * @param {string} productId - ID del producto
 * @param {boolean} permanent - Si es eliminación permanente
 * @returns {Promise<boolean>} Resultado
 */
window.deleteProduct = async function(productId, permanent = false) {
    const manager = getProductManager();
    return await manager.deleteProduct(productId, permanent);
};

/**
 * Obtiene productos
 * @param {Object} options - Opciones
 * @returns {Array} Productos
 */
window.getProducts = function(options = {}) {
    const manager = getProductManager();
    return manager.getProducts(options);
};

/**
 * Busca productos
 * @param {string} query - Término de búsqueda
 * @returns {Array} Productos encontrados
 */
window.searchProducts = function(query) {
    const manager = getProductManager();
    return manager.searchProducts(query);
};

/**
 * Ajusta stock de producto
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad
 * @param {string} reason - Razón
 * @returns {Promise<Object>} Producto actualizado
 */
window.adjustStock = async function(productId, quantity, reason = 'ajuste') {
    const manager = getProductManager();
    return await manager.adjustStock(productId, quantity, reason);
};

// ==================== INICIALIZACIÓN AUTOMÁTICA ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar cuando la aplicación esté lista
    window.addEventListener('app:initialized', async () => {
        try {
            await initProductManager();
            console.log('✅ Módulo de productos listo');
        } catch (error) {
            console.error('❌ Error inicializando módulo de productos:', error);
        }
    });
});

// ==================== EXPORTACIÓN ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProductManager,
        initProductManager,
        getProductManager,
        createProduct: window.createProduct,
        updateProduct: window.updateProduct,
        deleteProduct: window.deleteProduct,
        getProducts: window.getProducts,
        searchProducts: window.searchProducts,
        adjustStock: window.adjustStock
    };
}