/**
 * Módulo de gestión de categorías para Jessica Boutique
 * Maneja categorías y subcategorías de productos
 */

class CategoryManager {
    constructor() {
        this.categories = new Map();
        this.subcategories = new Map();
        this.currentCategoryId = null;
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    async init() {
        console.log('📁 Inicializando gestor de categorías...');
        
        try {
            // Cargar datos desde almacenamiento
            await this.loadFromStorage();
            
            // Configurar eventos
            this.setupEvents();
            
            // Verificar datos iniciales
            await this.checkInitialData();
            
            console.log('✅ Gestor de categorías inicializado');
            console.log(`📂 Categorías cargadas: ${this.categories.size}`);
            console.log(`📄 Subcategorías cargadas: ${this.subcategories.size}`);
            
        } catch (error) {
            console.error('❌ Error inicializando gestor de categorías:', error);
            throw error;
        }
    }

    /**
     * Carga datos desde almacenamiento
     */
    async loadFromStorage() {
        // Cargar categorías
        const storedCategories = Utils.getItem('categories', []);
        this.categories = new Map(storedCategories.map(c => [c.id, c]));
        
        // Cargar subcategorías
        const storedSubcategories = Utils.getItem('subcategories', []);
        this.subcategories = new Map(storedSubcategories.map(s => [s.id, s]));
    }

    /**
     * Guarda datos en almacenamiento
     */
    async saveToStorage() {
        try {
            // Guardar categorías
            const categoriesArray = Array.from(this.categories.values());
            Utils.setItem('categories', categoriesArray);
            
            // Guardar subcategorías
            const subcategoriesArray = Array.from(this.subcategories.values());
            Utils.setItem('subcategories', subcategoriesArray);
            
            console.log('💾 Datos de categorías guardados');
            
        } catch (error) {
            console.error('Error guardando datos de categorías:', error);
            throw error;
        }
    }

    /**
     * Configura eventos del módulo
     */
    setupEvents() {
        // Escuchar eventos de categorías
        window.addEventListener('category:create', this.handleCreateCategory.bind(this));
        window.addEventListener('category:update', this.handleUpdateCategory.bind(this));
        window.addEventListener('category:delete', this.handleDeleteCategory.bind(this));
        window.addEventListener('category:reorder', this.handleReorderCategories.bind(this));
        
        // Escuchar eventos de subcategorías
        window.addEventListener('subcategory:create', this.handleCreateSubcategory.bind(this));
        window.addEventListener('subcategory:update', this.handleUpdateSubcategory.bind(this));
        window.addEventListener('subcategory:delete', this.handleDeleteSubcategory.bind(this));
        
        // Escuchar eventos relacionados
        window.addEventListener('product:created', this.handleProductCreated.bind(this));
        window.addEventListener('product:deleted', this.handleProductDeleted.bind(this));
        window.addEventListener('app:foreground', this.handleAppForeground.bind(this));
    }

    /**
     * Verifica datos iniciales
     */
    async checkInitialData() {
        // Si no hay categorías, crear algunas de ejemplo
        if (this.categories.size === 0) {
            console.log('Creando categorías de ejemplo...');
            await this.createSampleCategories();
        }
    }

    /**
     * Crea categorías de ejemplo
     */
    async createSampleCategories() {
        const sampleCategories = [
            {
                id: 'ropa',
                name: 'Ropa',
                description: 'Vestidos, blusas, pantalones, faldas y más',
                icon: 'shirt',
                color: 'from-pink-500 to-rose-500',
                status: 'active',
                productCount: 0,
                subcategories: ['vestidos', 'blusas', 'pantalones', 'faldas'],
                displayOrder: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'accesorios',
                name: 'Accesorios',
                description: 'Relojes, joyería, gafas, bolsos',
                icon: 'watch',
                color: 'from-blue-500 to-cyan-500',
                status: 'active',
                productCount: 0,
                subcategories: ['relojes', 'joyeria', 'gafas', 'bolsos'],
                displayOrder: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'calzado',
                name: 'Calzado',
                description: 'Zapatos, sandalias, botas',
                icon: 'shoe',
                color: 'from-green-500 to-emerald-500',
                status: 'active',
                productCount: 0,
                subcategories: ['zapatos', 'sandalias', 'botas'],
                displayOrder: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'bolsos',
                name: 'Bolsos',
                description: 'Bolsos, carteras, mochilas',
                icon: 'shopping-bag',
                color: 'from-purple-500 to-pink-500',
                status: 'active',
                productCount: 0,
                subcategories: ['bolsos', 'carteras', 'mochilas'],
                displayOrder: 4,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'joyeria',
                name: 'Joyería',
                description: 'Collares, aretes, pulseras, anillos',
                icon: 'sparkles',
                color: 'from-amber-500 to-orange-500',
                status: 'active',
                productCount: 0,
                subcategories: ['collares', 'aretes', 'pulseras', 'anillos'],
                displayOrder: 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        for (const category of sampleCategories) {
            this.categories.set(category.id, category);
            
            // Crear subcategorías
            for (const subId of category.subcategories) {
                const subcategory = {
                    id: subId,
                    name: this.formatSubcategoryName(subId),
                    categoryId: category.id,
                    description: '',
                    status: 'active',
                    productCount: 0,
                    displayOrder: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.subcategories.set(`${category.id}_${subId}`, subcategory);
            }
        }
        
        await this.saveToStorage();
    }

    /**
     * Formatea el nombre de subcategoría
     * @param {string} subId - ID de subcategoría
     * @returns {string} Nombre formateado
     */
    formatSubcategoryName(subId) {
        return subId.charAt(0).toUpperCase() + subId.slice(1);
    }

    // ==================== CRUD DE CATEGORÍAS ====================

    /**
     * Crea una nueva categoría
     * @param {Object} categoryData - Datos de la categoría
     * @returns {Object} Categoría creada
     */
    async createCategory(categoryData) {
        console.log('Creando nueva categoría...', categoryData);
        
        try {
            // Validar datos de la categoría
            this.validateCategoryData(categoryData);
            
            // Generar ID único
            const categoryId = categoryData.id || Utils.generateId('cat');
            
            // Crear objeto de categoría
            const category = {
                id: categoryId,
                name: categoryData.name.trim(),
                description: categoryData.description?.trim() || '',
                icon: categoryData.icon || 'folder',
                color: categoryData.color || 'from-gray-500 to-gray-600',
                status: categoryData.status || 'active',
                productCount: 0,
                subcategories: categoryData.subcategories || [],
                displayOrder: this.getNextDisplayOrder(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system',
                metadata: categoryData.metadata || {}
            };
            
            // Guardar categoría
            this.categories.set(categoryId, category);
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchCategoryEvent('created', category);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Categoría "${category.name}" creada exitosamente`, 'success');
            }
            
            console.log('✅ Categoría creada:', category);
            return category;
            
        } catch (error) {
            console.error('❌ Error creando categoría:', error);
            throw error;
        }
    }

    /**
     * Actualiza una categoría existente
     * @param {string} categoryId - ID de la categoría
     * @param {Object} updates - Actualizaciones a aplicar
     * @returns {Object} Categoría actualizada
     */
    async updateCategory(categoryId, updates) {
        console.log(`Actualizando categoría ${categoryId}...`, updates);
        
        try {
            // Verificar que la categoría existe
            const category = this.categories.get(categoryId);
            if (!category) {
                throw new Error(`Categoría ${categoryId} no encontrada`);
            }
            
            // Validar actualizaciones
            this.validateCategoryUpdates(updates);
            
            // Aplicar actualizaciones
            const updatedCategory = {
                ...category,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Actualizar en el mapa
            this.categories.set(categoryId, updatedCategory);
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchCategoryEvent('updated', updatedCategory);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Categoría "${updatedCategory.name}" actualizada`, 'success');
            }
            
            console.log('✅ Categoría actualizada:', updatedCategory);
            return updatedCategory;
            
        } catch (error) {
            console.error(`❌ Error actualizando categoría ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una categoría
     * @param {string} categoryId - ID de la categoría
     * @param {boolean} force - Forzar eliminación incluso con productos
     * @returns {boolean} True si se eliminó
     */
    async deleteCategory(categoryId, force = false) {
        console.log(`Eliminando categoría ${categoryId}...`);
        
        try {
            // Verificar que la categoría existe
            const category = this.categories.get(categoryId);
            if (!category) {
                throw new Error(`Categoría ${categoryId} no encontrada`);
            }
            
            // Verificar si tiene productos
            if (category.productCount > 0 && !force) {
                throw new Error(
                    `No se puede eliminar la categoría "${category.name}" porque tiene ${category.productCount} productos. ` +
                    'Reasigna los productos a otra categoría primero o usa force=true.'
                );
            }
            
            // Eliminar categoría
            this.categories.delete(categoryId);
            
            // Eliminar subcategorías asociadas
            this.deleteCategorySubcategories(categoryId);
            
            // Reordenar las demás categorías
            await this.reorderCategoriesAfterDelete(category.displayOrder);
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchCategoryEvent('deleted', category);
            
            // Mostrar notificación
            if (typeof window.showToast === 'function') {
                window.showToast(`Categoría "${category.name}" eliminada`, 'success');
            }
            
            console.log(`✅ Categoría ${categoryId} eliminada`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error eliminando categoría ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene una categoría por ID
     * @param {string} categoryId - ID de la categoría
     * @returns {Object} Categoría encontrada
     */
    getCategory(categoryId) {
        const category = this.categories.get(categoryId);
        if (!category) {
            throw new Error(`Categoría ${categoryId} no encontrada`);
        }
        return { ...category };
    }

    /**
     * Obtiene todas las categorías
     * @param {Object} options - Opciones de filtrado
     * @returns {Array} Lista de categorías
     */
    getCategories(options = {}) {
        let categories = Array.from(this.categories.values());
        
        // Filtrar por estado si se especifica
        if (options.status) {
            categories = categories.filter(cat => cat.status === options.status);
        }
        
        // Ordenar por displayOrder
        categories.sort((a, b) => a.displayOrder - b.displayOrder);
        
        // Aplicar límite si se especifica
        if (options.limit) {
            categories = categories.slice(0, options.limit);
        }
        
        return categories;
    }

    /**
     * Obtiene categorías activas
     * @returns {Array} Categorías activas
     */
    getActiveCategories() {
        return this.getCategories({ status: 'active' });
    }

    /**
     * Busca categorías por nombre
     * @param {string} query - Término de búsqueda
     * @returns {Array} Categorías encontradas
     */
    searchCategories(query) {
        if (!query || query.trim() === '') {
            return this.getCategories();
        }
        
        const searchTerm = query.toLowerCase().trim();
        const categories = Array.from(this.categories.values());
        
        return categories.filter(category => {
            return category.name.toLowerCase().includes(searchTerm) ||
                   category.description.toLowerCase().includes(searchTerm);
        });
    }

    // ==================== GESTIÓN DE SUBCATEGORÍAS ====================

    /**
     * Crea una nueva subcategoría
     * @param {string} categoryId - ID de la categoría padre
     * @param {Object} subcategoryData - Datos de la subcategoría
     * @returns {Object} Subcategoría creada
     */
    async createSubcategory(categoryId, subcategoryData) {
        console.log(`Creando subcategoría en ${categoryId}...`, subcategoryData);
        
        try {
            // Verificar que la categoría existe
            const category = this.categories.get(categoryId);
            if (!category) {
                throw new Error(`Categoría ${categoryId} no encontrada`);
            }
            
            // Validar datos de la subcategoría
            this.validateSubcategoryData(subcategoryData);
            
            // Generar ID único
            const subId = subcategoryData.id || Utils.generateId('sub');
            const subcategoryKey = `${categoryId}_${subId}`;
            
            // Crear objeto de subcategoría
            const subcategory = {
                id: subId,
                key: subcategoryKey,
                name: subcategoryData.name.trim(),
                categoryId,
                description: subcategoryData.description?.trim() || '',
                status: subcategoryData.status || 'active',
                productCount: 0,
                displayOrder: this.getNextSubcategoryDisplayOrder(categoryId),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Guardar subcategoría
            this.subcategories.set(subcategoryKey, subcategory);
            
            // Actualizar lista de subcategorías en la categoría padre
            if (!category.subcategories.includes(subId)) {
                category.subcategories.push(subId);
                category.updatedAt = new Date().toISOString();
                this.categories.set(categoryId, category);
            }
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchSubcategoryEvent('created', subcategory);
            
            console.log('✅ Subcategoría creada:', subcategory);
            return subcategory;
            
        } catch (error) {
            console.error(`❌ Error creando subcategoría en ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza una subcategoría
     * @param {string} categoryId - ID de la categoría padre
     * @param {string} subcategoryId - ID de la subcategoría
     * @param {Object} updates - Actualizaciones
     * @returns {Object} Subcategoría actualizada
     */
    async updateSubcategory(categoryId, subcategoryId, updates) {
        const subcategoryKey = `${categoryId}_${subcategoryId}`;
        console.log(`Actualizando subcategoría ${subcategoryKey}...`, updates);
        
        try {
            // Verificar que la subcategoría existe
            const subcategory = this.subcategories.get(subcategoryKey);
            if (!subcategory) {
                throw new Error(`Subcategoría ${subcategoryKey} no encontrada`);
            }
            
            // Aplicar actualizaciones
            const updatedSubcategory = {
                ...subcategory,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Actualizar en el mapa
            this.subcategories.set(subcategoryKey, updatedSubcategory);
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchSubcategoryEvent('updated', updatedSubcategory);
            
            console.log('✅ Subcategoría actualizada:', updatedSubcategory);
            return updatedSubcategory;
            
        } catch (error) {
            console.error(`❌ Error actualizando subcategoría ${subcategoryKey}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una subcategoría
     * @param {string} categoryId - ID de la categoría padre
     * @param {string} subcategoryId - ID de la subcategoría
     * @returns {boolean} True si se eliminó
     */
    async deleteSubcategory(categoryId, subcategoryId) {
        const subcategoryKey = `${categoryId}_${subcategoryId}`;
        console.log(`Eliminando subcategoría ${subcategoryKey}...`);
        
        try {
            // Verificar que la subcategoría existe
            const subcategory = this.subcategories.get(subcategoryKey);
            if (!subcategory) {
                throw new Error(`Subcategoría ${subcategoryKey} no encontrada`);
            }
            
            // Verificar si tiene productos
            if (subcategory.productCount > 0) {
                throw new Error(
                    `No se puede eliminar la subcategoría porque tiene ${subcategory.productCount} productos. ` +
                    'Reasigna los productos primero.'
                );
            }
            
            // Eliminar subcategoría
            this.subcategories.delete(subcategoryKey);
            
            // Actualizar categoría padre
            const category = this.categories.get(categoryId);
            if (category) {
                category.subcategories = category.subcategories.filter(id => id !== subcategoryId);
                category.updatedAt = new Date().toISOString();
                this.categories.set(categoryId, category);
            }
            
            // Guardar cambios
            await this.saveToStorage();
            
            // Disparar evento
            this.dispatchSubcategoryEvent('deleted', subcategory);
            
            console.log(`✅ Subcategoría ${subcategoryKey} eliminada`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error eliminando subcategoría ${subcategoryKey}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene subcategorías de una categoría
     * @param {string} categoryId - ID de la categoría
     * @returns {Array} Subcategorías
     */
    getSubcategories(categoryId) {
        const subcategories = [];
        
        for (const [key, subcategory] of this.subcategories) {
            if (subcategory.categoryId === categoryId) {
                subcategories.push(subcategory);
            }
        }
        
        // Ordenar por displayOrder
        return subcategories.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    /**
     * Elimina todas las subcategorías de una categoría
     * @param {string} categoryId - ID de la categoría
     */
    deleteCategorySubcategories(categoryId) {
        const keysToDelete = [];
        
        for (const [key, subcategory] of this.subcategories) {
            if (subcategory.categoryId === categoryId) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.subcategories.delete(key);
        });
    }

    // ==================== GESTIÓN DE PRODUCTOS POR CATEGORÍA ====================

    /**
     * Incrementa contador de productos en categoría
     * @param {string} categoryId - ID de la categoría
     * @param {number} delta - Cambio (positivo o negativo)
     */
    async incrementProductCount(categoryId, delta) {
        const category = this.categories.get(categoryId);
        if (category) {
            category.productCount = (category.productCount || 0) + delta;
            category.updatedAt = new Date().toISOString();
            this.categories.set(categoryId, category);
            await this.saveToStorage();
        }
    }

    /**
     * Actualiza contador de productos para todas las categorías
     */
    async updateAllProductCounts() {
        // Obtener gestor de productos
        const productManager = window.productManager;
        if (!productManager) return;
        
        // Obtener todos los productos
        const products = productManager.getProducts();
        
        // Resetear contadores
        for (const category of this.categories.values()) {
            category.productCount = 0;
        }
        
        // Contar productos por categoría
        const counts = {};
        products.forEach(product => {
            if (product.status === 'active') {
                counts[product.category] = (counts[product.category] || 0) + 1;
            }
        });
        
        // Actualizar categorías
        Object.entries(counts).forEach(([categoryId, count]) => {
            const category = this.categories.get(categoryId);
            if (category) {
                category.productCount = count;
                category.updatedAt = new Date().toISOString();
            }
        });
        
        await this.saveToStorage();
        console.log('📊 Contadores de productos actualizados');
    }

    /**
     * Obtiene categorías con más productos
     * @param {number} limit - Límite de resultados
     * @returns {Array} Categorías ordenadas por cantidad de productos
     */
    getTopCategories(limit = 5) {
        return this.getActiveCategories()
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, limit);
    }

    /**
     * Obtiene categorías vacías (sin productos)
     * @returns {Array} Categorías vacías
     */
    getEmptyCategories() {
        return this.getActiveCategories()
            .filter(category => category.productCount === 0);
    }

    // ==================== VALIDACIONES ====================

    /**
     * Valida datos de categoría
     * @param {Object} categoryData - Datos a validar
     */
    validateCategoryData(categoryData) {
        const errors = [];
        
        // Nombre requerido
        if (!categoryData.name || categoryData.name.trim() === '') {
            errors.push('El nombre de la categoría es requerido');
        }
        
        // Nombre único
        const existingCategory = Array.from(this.categories.values()).find(
            cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
        );
        if (existingCategory) {
            errors.push('Ya existe una categoría con ese nombre');
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    /**
     * Valida actualizaciones de categoría
     * @param {Object} updates - Actualizaciones a validar
     */
    validateCategoryUpdates(updates) {
        const errors = [];
        
        // Si se actualiza el nombre, verificar que sea único
        if (updates.name) {
            const existingCategory = Array.from(this.categories.values()).find(
                cat => cat.name.toLowerCase() === updates.name.toLowerCase()
            );
            if (existingCategory && existingCategory.id !== this.currentCategoryId) {
                errors.push('Ya existe una categoría con ese nombre');
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    /**
     * Valida datos de subcategoría
     * @param {Object} subcategoryData - Datos a validar
     */
    validateSubcategoryData(subcategoryData) {
        const errors = [];
        
        // Nombre requerido
        if (!subcategoryData.name || subcategoryData.name.trim() === '') {
            errors.push('El nombre de la subcategoría es requerido');
        }
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }
    }

    // ==================== MÉTODOS DE AYUDA ====================

    /**
     * Obtiene el siguiente orden de visualización
     * @returns {number} Siguiente orden
     */
    getNextDisplayOrder() {
        const categories = Array.from(this.categories.values());
        if (categories.length === 0) return 1;
        
        const maxOrder = Math.max(...categories.map(cat => cat.displayOrder || 0));
        return maxOrder + 1;
    }

    /**
     * Obtiene el siguiente orden de visualización para subcategorías
     * @param {string} categoryId - ID de la categoría
     * @returns {number} Siguiente orden
     */
    getNextSubcategoryDisplayOrder(categoryId) {
        const subcategories = this.getSubcategories(categoryId);
        if (subcategories.length === 0) return 1;
        
        const maxOrder = Math.max(...subcategories.map(sub => sub.displayOrder || 0));
        return maxOrder + 1;
    }

    /**
     * Reordena categorías después de eliminar una
     * @param {number} deletedOrder - Orden de la categoría eliminada
     */
    async reorderCategoriesAfterDelete(deletedOrder) {
        const categories = this.getCategories();
        
        for (const category of categories) {
            if (category.displayOrder > deletedOrder) {
                category.displayOrder--;
                this.categories.set(category.id, category);
            }
        }
        
        await this.saveToStorage();
    }

    /**
     * Reordena categorías
     * @param {Array} categoryIds - IDs en el nuevo orden
     */
    async reorderCategories(categoryIds) {
        categoryIds.forEach((categoryId, index) => {
            const category = this.categories.get(categoryId);
            if (category) {
                category.displayOrder = index + 1;
                this.categories.set(categoryId, category);
            }
        });
        
        await this.saveToStorage();
        
        // Disparar evento
        this.dispatchCategoryEvent('reordered', { categoryIds });
    }

    /**
     * Reordena subcategorías
     * @param {string} categoryId - ID de la categoría padre
     * @param {Array} subcategoryIds - IDs en el nuevo orden
     */
    async reorderSubcategories(categoryId, subcategoryIds) {
        subcategoryIds.forEach((subId, index) => {
            const key = `${categoryId}_${subId}`;
            const subcategory = this.subcategories.get(key);
            if (subcategory) {
                subcategory.displayOrder = index + 1;
                this.subcategories.set(key, subcategory);
            }
        });
        
        await this.saveToStorage();
        
        // Disparar evento
        this.dispatchSubcategoryEvent('reordered', { categoryId, subcategoryIds });
    }

    // ==================== MANEJADORES DE EVENTOS ====================

    /**
     * Maneja creación de categoría
     * @param {CustomEvent} event - Evento de creación
     */
    async handleCreateCategory(event) {
        const { categoryData } = event.detail;
        try {
            const category = await this.createCategory(categoryData);
            event.detail.callback?.success?.(category);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja actualización de categoría
     * @param {CustomEvent} event - Evento de actualización
     */
    async handleUpdateCategory(event) {
        const { categoryId, updates } = event.detail;
        try {
            const category = await this.updateCategory(categoryId, updates);
            event.detail.callback?.success?.(category);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja eliminación de categoría
     * @param {CustomEvent} event - Evento de eliminación
     */
    async handleDeleteCategory(event) {
        const { categoryId, force } = event.detail;
        try {
            const result = await this.deleteCategory(categoryId, force);
            event.detail.callback?.success?.(result);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja reordenamiento de categorías
     * @param {CustomEvent} event - Evento de reordenamiento
     */
    async handleReorderCategories(event) {
        const { categoryIds } = event.detail;
        try {
            await this.reorderCategories(categoryIds);
            event.detail.callback?.success?.();
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja creación de subcategoría
     * @param {CustomEvent} event - Evento de creación
     */
    async handleCreateSubcategory(event) {
        const { categoryId, subcategoryData } = event.detail;
        try {
            const subcategory = await this.createSubcategory(categoryId, subcategoryData);
            event.detail.callback?.success?.(subcategory);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja actualización de subcategoría
     * @param {CustomEvent} event - Evento de actualización
     */
    async handleUpdateSubcategory(event) {
        const { categoryId, subcategoryId, updates } = event.detail;
        try {
            const subcategory = await this.updateSubcategory(categoryId, subcategoryId, updates);
            event.detail.callback?.success?.(subcategory);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja eliminación de subcategoría
     * @param {CustomEvent} event - Evento de eliminación
     */
    async handleDeleteSubcategory(event) {
        const { categoryId, subcategoryId } = event.detail;
        try {
            const result = await this.deleteSubcategory(categoryId, subcategoryId);
            event.detail.callback?.success?.(result);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja creación de producto
     * @param {CustomEvent} event - Evento de producto creado
     */
    async handleProductCreated(event) {
        const { category } = event.detail;
        if (category) {
            await this.incrementProductCount(category, 1);
        }
    }

    /**
     * Maneja eliminación de producto
     * @param {CustomEvent} event - Evento de producto eliminado
     */
    async handleProductDeleted(event) {
        const { category } = event.detail;
        if (category) {
            await this.incrementProductCount(category, -1);
        }
    }

    /**
     * Maneja aplicación en primer plano
     */
    async handleAppForeground() {
        // Actualizar contadores cuando la app vuelve a primer plano
        await this.updateAllProductCounts();
    }

    // ==================== EVENTOS ====================

    /**
     * Dispara evento de categoría
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchCategoryEvent(action, data) {
        const event = new CustomEvent(`category:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Dispara evento de subcategoría
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchSubcategoryEvent(action, data) {
        const event = new CustomEvent(`subcategory:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Obtiene estadísticas de categorías
     * @returns {Object} Estadísticas
     */
    getStatistics() {
        const categories = this.getActiveCategories();
        
        const totalCategories = categories.length;
        const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
        const averageProducts = totalCategories > 0 ? totalProducts / totalCategories : 0;
        
        // Categorías con más productos
        const topCategories = this.getTopCategories(3);
        
        // Categorías vacías
        const emptyCategories = this.getEmptyCategories();
        
        // Distribución por icono/color
        const distribution = {};
        categories.forEach(category => {
            const key = category.icon || 'unknown';
            distribution[key] = (distribution[key] || 0) + 1;
        });
        
        return {
            totalCategories,
            totalProducts,
            averageProducts: averageProducts.toFixed(1),
            topCategories,
            emptyCategories: emptyCategories.length,
            distribution,
            lastUpdated: new Date().toISOString()
        };
    }

    // ==================== EXPORTACIÓN/IMPORTACIÓN ====================

    /**
     * Exporta categorías a JSON
     * @returns {string} JSON de categorías
     */
    exportToJSON() {
        const data = {
            categories: Array.from(this.categories.values()),
            subcategories: Array.from(this.subcategories.values()),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa categorías desde JSON
     * @param {string} jsonData - Datos JSON
     * @returns {Object} Resultado de la importación
     */
    async importFromJSON(jsonData) {
        console.log('Importando categorías desde JSON...');
        
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.categories || !Array.isArray(data.categories)) {
                throw new Error('Formato JSON inválido: se requiere array de categorías');
            }
            
            const results = {
                total: data.categories.length,
                success: 0,
                errors: []
            };
            
            // Importar categorías
            for (const categoryData of data.categories) {
                try {
                    await this.createCategory(categoryData);
                    results.success++;
                } catch (error) {
                    results.errors.push({
                        category: categoryData.name,
                        error: error.message
                    });
                }
            }
            
            // Importar subcategorías si existen
            if (data.subcategories && Array.isArray(data.subcategories)) {
                for (const subData of data.subcategories) {
                    try {
                        await this.createSubcategory(subData.categoryId, subData);
                    } catch (error) {
                        // Ignorar errores de subcategorías
                        console.warn('Error importando subcategoría:', error);
                    }
                }
            }
            
            console.log(`✅ Importación completada: ${results.success} categorías importadas`);
            return results;
            
        } catch (error) {
            console.error('❌ Error importando categorías:', error);
            throw error;
        }
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    /**
     * Obtiene categoría por nombre
     * @param {string} name - Nombre de la categoría
     * @returns {Object} Categoría encontrada
     */
    getCategoryByName(name) {
        const categories = Array.from(this.categories.values());
        return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Verifica si una categoría existe
     * @param {string} categoryId - ID de la categoría
     * @returns {boolean} True si existe
     */
    categoryExists(categoryId) {
        return this.categories.has(categoryId);
    }

    /**
     * Obtiene el color de una categoría
     * @param {string} categoryId - ID de la categoría
     * @returns {string} Color CSS
     */
    getCategoryColor(categoryId) {
        const category = this.categories.get(categoryId);
        return category?.color || 'from-gray-500 to-gray-600';
    }

    /**
     * Obtiene el icono de una categoría
     * @param {string} categoryId - ID de la categoría
     * @returns {string} Nombre del icono
     */
    getCategoryIcon(categoryId) {
        const category = this.categories.get(categoryId);
        return category?.icon || 'folder';
    }

    /**
     * Obtiene categorías con formato para select
     * @returns {Array} Opciones para select
     */
    getCategoryOptions() {
        return this.getActiveCategories().map(category => ({
            value: category.id,
            label: category.name,
            color: category.color,
            icon: category.icon
        }));
    }

    /**
     * Obtiene subcategorías con formato para select
     * @param {string} categoryId - ID de la categoría
     * @returns {Array} Opciones para select
     */
    getSubcategoryOptions(categoryId) {
        return this.getSubcategories(categoryId).map(sub => ({
            value: sub.id,
            label: sub.name
        }));
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================
let categoryManagerInstance = null;

/**
 * Inicializa el gestor de categorías
 * @returns {CategoryManager} Instancia del gestor
 */
async function initCategoryManager() {
    if (!categoryManagerInstance) {
        categoryManagerInstance = new CategoryManager();
        await categoryManagerInstance.init();
        window.categoryManager = categoryManagerInstance;
    }
    return categoryManagerInstance;
}

/**
 * Obtiene el gestor de categorías
 * @returns {CategoryManager} Instancia del gestor
 */
function getCategoryManager() {
    if (!categoryManagerInstance) {
        throw new Error('CategoryManager no ha sido inicializado. Llama a initCategoryManager() primero.');
    }
    return categoryManagerInstance;
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
window.createCategory = async function(categoryData) {
    const manager = getCategoryManager();
    return await manager.createCategory(categoryData);
};

/**
 * Obtiene todas las categorías
 * @param {Object} options - Opciones
 * @returns {Array} Categorías
 */
window.getCategories = function(options = {}) {
    const manager = getCategoryManager();
    return manager.getCategories(options);
};

/**
 * Obtiene categorías activas
 * @returns {Array} Categorías activas
 */
window.getActiveCategories = function() {
    const manager = getCategoryManager();
    return manager.getActiveCategories();
};

/**
 * Busca categorías
 * @param {string} query - Término de búsqueda
 * @returns {Array} Categorías encontradas
 */
window.searchCategories = function(query) {
    const manager = getCategoryManager();
    return manager.searchCategories(query);
};

// ==================== INICIALIZACIÓN AUTOMÁTICA ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar cuando la aplicación esté lista
    window.addEventListener('app:initialized', async () => {
        try {
            await initCategoryManager();
            console.log('✅ Módulo de categorías listo');
        } catch (error) {
            console.error('❌ Error inicializando módulo de categorías:', error);
        }
    });
});

// ==================== EXPORTACIÓN ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CategoryManager,
        initCategoryManager,
        getCategoryManager,
        createCategory: window.createCategory,
        getCategories: window.getCategories,
        getActiveCategories: window.getActiveCategories,
        searchCategories: window.searchCategories
    };
}