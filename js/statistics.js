/**
 * Módulo de estadísticas y reportes para Jessica Boutique
 * Análisis de datos, reportes y métricas del negocio
 */

class StatisticsManager {
    constructor() {
        this.metrics = new Map();
        this.reports = new Map();
        this.charts = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutos
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    async init() {
        console.log('📊 Inicializando gestor de estadísticas...');
        
        try {
            // Cargar configuración
            await this.loadConfig();
            
            // Configurar eventos
            this.setupEvents();
            
            // Inicializar métricas básicas
            await this.initBasicMetrics();
            
            console.log('✅ Gestor de estadísticas inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando gestor de estadísticas:', error);
            throw error;
        }
    }

    /**
     * Carga configuración
     */
    async loadConfig() {
        this.config = Utils.getItem('stats_config', {
            autoRefresh: true,
            refreshInterval: 300000, // 5 minutos
            cacheEnabled: true,
            showCharts: true,
            reportFormats: ['pdf', 'excel', 'csv'],
            defaultPeriod: 'month',
            currency: 'USD'
        });
    }

    /**
     * Configura eventos del módulo
     */
    setupEvents() {
        // Escuchar eventos de actualización
        window.addEventListener('stats:refresh', this.handleRefresh.bind(this));
        window.addEventListener('stats:generate-report', this.handleGenerateReport.bind(this));
        window.addEventListener('stats:export-data', this.handleExportData.bind(this));
        
        // Escuchar eventos de datos
        window.addEventListener('product:created', this.handleDataChange.bind(this));
        window.addEventListener('product:updated', this.handleDataChange.bind(this));
        window.addEventListener('product:deleted', this.handleDataChange.bind(this));
        window.addEventListener('category:created', this.handleDataChange.bind(this));
        window.addEventListener('category:updated', this.handleDataChange.bind(this));
        
        // Configurar actualización automática
        if (this.config.autoRefresh) {
            this.setupAutoRefresh();
        }
    }

    /**
     * Configura actualización automática
     */
    setupAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshAllMetrics();
        }, this.config.refreshInterval);
    }

    /**
     * Inicializa métricas básicas
     */
    async initBasicMetrics() {
        // Métricas predefinidas
        this.registerMetric('total_products', {
            name: 'Total Productos',
            description: 'Número total de productos en inventario',
            type: 'count',
            calculate: this.calculateTotalProducts.bind(this),
            format: 'number',
            icon: 'package',
            color: 'pink'
        });

        this.registerMetric('total_categories', {
            name: 'Total Categorías',
            description: 'Número total de categorías activas',
            type: 'count',
            calculate: this.calculateTotalCategories.bind(this),
            format: 'number',
            icon: 'layers',
            color: 'blue'
        });

        this.registerMetric('total_stock', {
            name: 'Stock Total',
            description: 'Cantidad total de unidades en inventario',
            type: 'sum',
            calculate: this.calculateTotalStock.bind(this),
            format: 'number',
            icon: 'package',
            color: 'green'
        });

        this.registerMetric('inventory_value', {
            name: 'Valor del Inventario',
            description: 'Valor total del inventario actual',
            type: 'currency',
            calculate: this.calculateInventoryValue.bind(this),
            format: 'currency',
            icon: 'dollar-sign',
            color: 'purple'
        });

        this.registerMetric('low_stock_count', {
            name: 'Productos con Stock Bajo',
            description: 'Productos que necesitan reabastecimiento',
            type: 'count',
            calculate: this.calculateLowStockCount.bind(this),
            format: 'number',
            icon: 'alert-triangle',
            color: 'red'
        });

        this.registerMetric('out_of_stock_count', {
            name: 'Productos Agotados',
            description: 'Productos sin stock disponible',
            type: 'count',
            calculate: this.calculateOutOfStockCount.bind(this),
            format: 'number',
            icon: 'x-circle',
            color: 'orange'
        });

        this.registerMetric('average_price', {
            name: 'Precio Promedio',
            description: 'Precio promedio de los productos',
            type: 'average',
            calculate: this.calculateAveragePrice.bind(this),
            format: 'currency',
            icon: 'tag',
            color: 'indigo'
        });

        this.registerMetric('top_category', {
            name: 'Categoría Más Popular',
            description: 'Categoría con más productos',
            type: 'text',
            calculate: this.calculateTopCategory.bind(this),
            format: 'text',
            icon: 'trending-up',
            color: 'teal'
        });

        // Reportes predefinidos
        this.registerReport('inventory_summary', {
            name: 'Resumen de Inventario',
            description: 'Reporte completo del estado del inventario',
            generate: this.generateInventorySummary.bind(this),
            formats: ['pdf', 'excel', 'csv'],
            schedule: 'weekly'
        });

        this.registerReport('sales_analysis', {
            name: 'Análisis de Ventas',
            description: 'Análisis detallado de ventas por período',
            generate: this.generateSalesAnalysis.bind(this),
            formats: ['pdf', 'excel'],
            schedule: 'monthly'
        });

        this.registerReport('stock_alerts', {
            name: 'Alertas de Stock',
            description: 'Productos que necesitan atención',
            generate: this.generateStockAlerts.bind(this),
            formats: ['pdf', 'csv'],
            schedule: 'daily'
        });

        this.registerReport('category_analysis', {
            name: 'Análisis por Categoría',
            description: 'Distribución y rendimiento por categoría',
            generate: this.generateCategoryAnalysis.bind(this),
            formats: ['pdf', 'excel'],
            schedule: 'monthly'
        });

        // Calcular métricas iniciales
        await this.refreshAllMetrics();
    }

    // ==================== GESTIÓN DE MÉTRICAS ====================

    /**
     * Registra una nueva métrica
     * @param {string} metricId - ID de la métrica
     * @param {Object} metricConfig - Configuración de la métrica
     */
    registerMetric(metricId, metricConfig) {
        this.metrics.set(metricId, {
            ...metricConfig,
            id: metricId,
            value: null,
            lastUpdated: null,
            trend: null,
            cacheKey: `metric_${metricId}`,
            dependencies: metricConfig.dependencies || []
        });
    }

    /**
     * Obtiene una métrica
     * @param {string} metricId - ID de la métrica
     * @param {boolean} forceRefresh - Forzar recálculo
     * @returns {Object} Métrica actualizada
     */
    async getMetric(metricId, forceRefresh = false) {
        const metric = this.metrics.get(metricId);
        if (!metric) {
            throw new Error(`Métrica ${metricId} no encontrada`);
        }

        // Verificar cache
        if (!forceRefresh && this.shouldUseCache(metric)) {
            const cached = this.getCachedMetric(metricId);
            if (cached) {
                return cached;
            }
        }

        // Calcular métrica
        await this.calculateMetric(metricId);
        
        return this.metrics.get(metricId);
    }

    /**
     * Calcula una métrica
     * @param {string} metricId - ID de la métrica
     */
    async calculateMetric(metricId) {
        const metric = this.metrics.get(metricId);
        if (!metric) return;

        try {
            console.log(`Calculando métrica: ${metricId}`);
            
            // Calcular valor
            const value = await metric.calculate();
            
            // Calcular tendencia si es posible
            const trend = await this.calculateTrend(metricId, value);
            
            // Actualizar métrica
            metric.value = value;
            metric.lastUpdated = new Date().toISOString();
            metric.trend = trend;
            
            // Formatear valor
            metric.formattedValue = this.formatMetricValue(value, metric.format);
            
            // Cachear
            this.cacheMetric(metricId, metric);
            
            // Disparar evento
            this.dispatchMetricEvent('updated', metric);
            
        } catch (error) {
            console.error(`Error calculando métrica ${metricId}:`, error);
            metric.error = error.message;
        }
    }

    /**
     * Calcula tendencia de métrica
     * @param {string} metricId - ID de la métrica
     * @param {*} currentValue - Valor actual
     * @returns {Object} Tendencia
     */
    async calculateTrend(metricId, currentValue) {
        // Obtener valor anterior del historial
        const history = this.getMetricHistory(metricId);
        if (history.length < 2) return null;
        
        const previousValue = history[history.length - 2].value;
        
        if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
            return null;
        }
        
        const change = currentValue - previousValue;
        const percentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;
        
        return {
            change,
            percentage,
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
            isPositive: change > 0
        };
    }

    /**
     * Formatea valor de métrica
     * @param {*} value - Valor a formatear
     * @param {string} format - Formato
     * @returns {string} Valor formateado
     */
    formatMetricValue(value, format) {
        switch (format) {
            case 'currency':
                return Utils.formatCurrency(value, this.config.currency);
            case 'number':
                return Utils.formatNumber(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'text':
                return value.toString();
            default:
                return value;
        }
    }

    /**
     * Obtiene todas las métricas
     * @param {boolean} forceRefresh - Forzar recálculo
     * @returns {Array} Lista de métricas
     */
    async getAllMetrics(forceRefresh = false) {
        const metricIds = Array.from(this.metrics.keys());
        const metrics = [];
        
        for (const metricId of metricIds) {
            const metric = await this.getMetric(metricId, forceRefresh);
            metrics.push(metric);
        }
        
        return metrics;
    }

    /**
     * Refresca todas las métricas
     */
    async refreshAllMetrics() {
        console.log('🔄 Refrescando todas las métricas...');
        
        const metricIds = Array.from(this.metrics.keys());
        
        for (const metricId of metricIds) {
            await this.calculateMetric(metricId);
        }
        
        console.log('✅ Todas las métricas actualizadas');
        this.dispatchStatsEvent('refreshed');
    }

    // ==================== CÁLCULOS DE MÉTRICAS ====================

    /**
     * Calcula total de productos
     * @returns {number} Total de productos
     */
    async calculateTotalProducts() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const products = productManager.getProducts();
        return products.filter(p => p.status === 'active').length;
    }

    /**
     * Calcula total de categorías
     * @returns {number} Total de categorías
     */
    async calculateTotalCategories() {
        const categoryManager = window.categoryManager;
        if (!categoryManager) return 0;
        
        const categories = categoryManager.getActiveCategories();
        return categories.length;
    }

    /**
     * Calcula stock total
     * @returns {number} Stock total
     */
    async calculateTotalStock() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const products = productManager.getProducts();
        return products
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + (p.currentStock || 0), 0);
    }

    /**
     * Calcula valor del inventario
     * @returns {number} Valor del inventario
     */
    async calculateInventoryValue() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const products = productManager.getProducts();
        return products
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + ((p.currentStock || 0) * (p.price || 0)), 0);
    }

    /**
     * Calcula productos con stock bajo
     * @returns {number} Cantidad de productos
     */
    async calculateLowStockCount() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const lowStockProducts = productManager.getLowStockProducts();
        return lowStockProducts.length;
    }

    /**
     * Calcula productos agotados
     * @returns {number} Cantidad de productos
     */
    async calculateOutOfStockCount() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const outOfStockProducts = productManager.getOutOfStockProducts();
        return outOfStockProducts.length;
    }

    /**
     * Calcula precio promedio
     * @returns {number} Precio promedio
     */
    async calculateAveragePrice() {
        const productManager = window.productManager;
        if (!productManager) return 0;
        
        const products = productManager.getProducts();
        const activeProducts = products.filter(p => p.status === 'active' && p.price > 0);
        
        if (activeProducts.length === 0) return 0;
        
        const total = activeProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        return total / activeProducts.length;
    }

    /**
     * Calcula categoría más popular
     * @returns {string} Nombre de la categoría
     */
    async calculateTopCategory() {
        const categoryManager = window.categoryManager;
        if (!categoryManager) return 'N/A';
        
        const topCategories = categoryManager.getTopCategories(1);
        return topCategories.length > 0 ? topCategories[0].name : 'N/A';
    }

    // ==================== GESTIÓN DE REPORTES ====================

    /**
     * Registra un nuevo reporte
     * @param {string} reportId - ID del reporte
     * @param {Object} reportConfig - Configuración del reporte
     */
    registerReport(reportId, reportConfig) {
        this.reports.set(reportId, {
            ...reportConfig,
            id: reportId,
            lastGenerated: null,
            schedule: reportConfig.schedule || 'manual'
        });
    }

    /**
     * Genera un reporte
     * @param {string} reportId - ID del reporte
     * @param {Object} options - Opciones del reporte
     * @returns {Object} Reporte generado
     */
    async generateReport(reportId, options = {}) {
        const report = this.reports.get(reportId);
        if (!report) {
            throw new Error(`Reporte ${reportId} no encontrado`);
        }

        try {
            console.log(`Generando reporte: ${reportId}`);
            
            // Generar datos del reporte
            const data = await report.generate(options);
            
            // Crear objeto de reporte
            const generatedReport = {
                id: Utils.generateId('rep'),
                reportId,
                name: report.name,
                description: report.description,
                data,
                format: options.format || 'pdf',
                generatedAt: new Date().toISOString(),
                period: options.period || this.config.defaultPeriod,
                filters: options.filters || {}
            };
            
            // Actualizar último generado
            report.lastGenerated = new Date().toISOString();
            
            // Guardar en historial
            this.saveReportToHistory(generatedReport);
            
            // Disparar evento
            this.dispatchReportEvent('generated', generatedReport);
            
            console.log(`✅ Reporte ${reportId} generado`);
            return generatedReport;
            
        } catch (error) {
            console.error(`Error generando reporte ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Genera resumen de inventario
     * @param {Object} options - Opciones
     * @returns {Object} Datos del reporte
     */
    async generateInventorySummary(options = {}) {
        // Obtener métricas actualizadas
        const metrics = await this.getAllMetrics();
        
        // Obtener datos adicionales
        const productManager = window.productManager;
        const categoryManager = window.categoryManager;
        
        const products = productManager ? productManager.getProducts() : [];
        const categories = categoryManager ? categoryManager.getActiveCategories() : [];
        
        // Productos más importantes
        const topProducts = productManager ? productManager.getTopSellingProducts(10) : [];
        const lowStockProducts = productManager ? productManager.getLowStockProducts() : [];
        const outOfStockProducts = productManager ? productManager.getOutOfStockProducts() : [];
        
        // Análisis por categoría
        const categoryAnalysis = categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category.id);
            const categoryValue = categoryProducts.reduce(
                (sum, p) => sum + (p.currentStock * p.price || 0), 0
            );
            
            return {
                category: category.name,
                productCount: categoryProducts.length,
                stockValue: categoryValue,
                percentage: 0 // Se calculará después
            };
        });
        
        // Calcular porcentajes
        const totalValue = categoryAnalysis.reduce((sum, c) => sum + c.stockValue, 0);
        categoryAnalysis.forEach(c => {
            c.percentage = totalValue > 0 ? (c.stockValue / totalValue) * 100 : 0;
        });
        
        return {
            metadata: {
                title: 'Resumen de Inventario',
                generatedAt: new Date().toISOString(),
                period: options.period || 'current',
                currency: this.config.currency
            },
            metrics: metrics.map(m => ({
                name: m.name,
                value: m.value,
                formattedValue: m.formattedValue,
                trend: m.trend
            })),
            products: {
                total: products.length,
                active: products.filter(p => p.status === 'active').length,
                topProducts: topProducts.slice(0, 5),
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts.length
            },
            categories: {
                total: categories.length,
                analysis: categoryAnalysis,
                topCategory: categoryAnalysis.sort((a, b) => b.stockValue - a.stockValue)[0]
            },
            recommendations: this.generateInventoryRecommendations(
                lowStockProducts,
                outOfStockProducts
            )
        };
    }

    /**
     * Genera análisis de ventas
     * @param {Object} options - Opciones
     * @returns {Object} Datos del reporte
     */
    async generateSalesAnalysis(options = {}) {
        // En una implementación real, esto vendría de datos de ventas
        // Por ahora, generamos datos simulados
        
        const period = options.period || 'month';
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
        
        // Generar datos de ventas simulados
        const salesData = [];
        const categories = ['ropa', 'accesorios', 'calzado', 'bolsos'];
        
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            
            const dailySales = {
                date: date.toISOString().split('T')[0],
                total: Math.floor(Math.random() * 1000) + 500,
                transactions: Math.floor(Math.random() * 20) + 5,
                averageTicket: 0,
                byCategory: {}
            };
            
            let categoryTotal = 0;
            categories.forEach(category => {
                const amount = Math.floor(Math.random() * 300) + 100;
                dailySales.byCategory[category] = amount;
                categoryTotal += amount;
            });
            
            dailySales.averageTicket = dailySales.transactions > 0 
                ? dailySales.total / dailySales.transactions 
                : 0;
            
            salesData.push(dailySales);
        }
        
        // Calcular métricas
        const totalSales = salesData.reduce((sum, day) => sum + day.total, 0);
        const averageDailySales = totalSales / days;
        const bestDay = salesData.reduce((best, day) => 
            day.total > best.total ? day : best
        );
        
        // Análisis por categoría
        const categoryTotals = {};
        salesData.forEach(day => {
            Object.entries(day.byCategory).forEach(([category, amount]) => {
                categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            });
        });
        
        return {
            metadata: {
                title: 'Análisis de Ventas',
                generatedAt: new Date().toISOString(),
                period: period,
                days: days,
                currency: this.config.currency
            },
            summary: {
                totalSales: Utils.formatCurrency(totalSales),
                averageDailySales: Utils.formatCurrency(averageDailySales),
                totalTransactions: salesData.reduce((sum, day) => sum + day.transactions, 0),
                averageTicket: Utils.formatCurrency(
                    salesData.reduce((sum, day) => sum + day.averageTicket, 0) / days
                ),
                bestDay: {
                    date: bestDay.date,
                    sales: Utils.formatCurrency(bestDay.total),
                    transactions: bestDay.transactions
                }
            },
            dailyData: salesData,
            categoryAnalysis: Object.entries(categoryTotals).map(([category, total]) => ({
                category,
                total: Utils.formatCurrency(total),
                percentage: (total / totalSales) * 100,
                averageDaily: Utils.formatCurrency(total / days)
            })),
            trends: {
                growthRate: this.calculateGrowthRate(salesData),
                seasonality: this.analyzeSeasonality(salesData),
                peakHours: this.analyzePeakHours() // Simulado
            }
        };
    }

    /**
     * Genera alertas de stock
     * @param {Object} options - Opciones
     * @returns {Object} Datos del reporte
     */
    async generateStockAlerts(options = {}) {
        const productManager = window.productManager;
        if (!productManager) {
            throw new Error('ProductManager no disponible');
        }
        
        const lowStockProducts = productManager.getLowStockProducts();
        const outOfStockProducts = productManager.getOutOfStockProducts();
        
        // Calcular prioridades
        const prioritizedAlerts = [
            ...outOfStockProducts.map(p => ({
                ...p,
                priority: 'critical',
                action: 'reorder_urgent',
                estimatedRestockDays: 0
            })),
            ...lowStockProducts.map(p => {
                const daysRemaining = this.calculateStockDaysRemaining(p);
                return {
                    ...p,
                    priority: daysRemaining <= 3 ? 'high' : 'medium',
                    action: daysRemaining <= 3 ? 'reorder_urgent' : 'reorder_soon',
                    daysRemaining,
                    estimatedRestockDays: this.estimateRestockDays(p)
                };
            })
        ];
        
        // Ordenar por prioridad
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        prioritizedAlerts.sort((a, b) => 
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        
        return {
            metadata: {
                title: 'Alertas de Stock',
                generatedAt: new Date().toISOString(),
                totalAlerts: prioritizedAlerts.length,
                criticalCount: prioritizedAlerts.filter(a => a.priority === 'critical').length,
                highCount: prioritizedAlerts.filter(a => a.priority === 'high').length
            },
            alerts: prioritizedAlerts,
            summary: {
                totalValueAtRisk: prioritizedAlerts.reduce(
                    (sum, p) => sum + (p.currentStock * p.price || 0), 0
                ),
                potentialLostSales: this.estimatePotentialLostSales(prioritizedAlerts),
                recommendedActions: this.generateStockAlertActions(prioritizedAlerts)
            },
            byCategory: this.groupAlertsByCategory(prioritizedAlerts),
            bySupplier: this.groupAlertsBySupplier(prioritizedAlerts)
        };
    }

    /**
     * Genera análisis por categoría
     * @param {Object} options - Opciones
     * @returns {Object} Datos del reporte
     */
    async generateCategoryAnalysis(options = {}) {
        const productManager = window.productManager;
        const categoryManager = window.categoryManager;
        
        if (!productManager || !categoryManager) {
            throw new Error('Módulos no disponibles');
        }
        
        const products = productManager.getProducts();
        const categories = categoryManager.getActiveCategories();
        
        // Análisis detallado por categoría
        const detailedAnalysis = categories.map(category => {
            const categoryProducts = products.filter(p => 
                p.status === 'active' && p.category === category.id
            );
            
            const totalStock = categoryProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
            const totalValue = categoryProducts.reduce(
                (sum, p) => sum + ((p.currentStock || 0) * (p.price || 0)), 0
            );
            const averagePrice = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length 
                : 0;
            
            const lowStockCount = categoryProducts.filter(p => 
                p.currentStock <= p.minStock && p.currentStock > 0
            ).length;
            
            const outOfStockCount = categoryProducts.filter(p => p.currentStock === 0).length;
            
            return {
                category: category.name,
                productCount: categoryProducts.length,
                totalStock,
                totalValue,
                averagePrice,
                lowStockCount,
                outOfStockCount,
                stockTurnover: this.calculateStockTurnover(categoryProducts),
                profitability: this.calculateCategoryProfitability(categoryProducts)
            };
        });
        
        // Ordenar por valor total
        detailedAnalysis.sort((a, b) => b.totalValue - a.totalValue);
        
        // Calcular porcentajes
        const totalValue = detailedAnalysis.reduce((sum, c) => sum + c.totalValue, 0);
        detailedAnalysis.forEach(c => {
            c.valuePercentage = totalValue > 0 ? (c.totalValue / totalValue) * 100 : 0;
            c.productPercentage = products.length > 0 ? (c.productCount / products.length) * 100 : 0;
        });
        
        return {
            metadata: {
                title: 'Análisis por Categoría',
                generatedAt: new Date().toISOString(),
                totalCategories: categories.length,
                totalProducts: products.length,
                totalInventoryValue: Utils.formatCurrency(totalValue)
            },
            analysis: detailedAnalysis,
            insights: this.generateCategoryInsights(detailedAnalysis),
            recommendations: this.generateCategoryRecommendations(detailedAnalysis)
        };
    }

    // ==================== MÉTODOS DE AYUDA PARA REPORTES ====================

    /**
     * Calcula días restantes de stock
     * @param {Object} product - Producto
     * @returns {number} Días restantes
     */
    calculateStockDaysRemaining(product) {
        if (product.currentStock <= 0) return 0;
        
        // Esto es una simulación - en una app real usarías datos históricos de ventas
        const dailySales = 2; // Ventas diarias promedio simuladas
        return Math.floor(product.currentStock / dailySales);
    }

    /**
     * Estima días para reabastecimiento
     * @param {Object} product - Producto
     * @returns {number} Días estimados
     */
    estimateRestockDays(product) {
        // Simulación - en una app real usarías datos de proveedores
        const supplierLeadTimes = {
            'Moda Elegante S.A.': 7,
            'Accesorios Premium': 5,
            'Textiles Deluxe': 10
        };
        
        return supplierLeadTimes[product.supplier] || 7;
    }

    /**
     * Estima ventas perdidas potenciales
     * @param {Array} alerts - Alertas de stock
     * @returns {number} Valor estimado
     */
    estimatePotentialLostSales(alerts) {
        return alerts.reduce((sum, alert) => {
            if (alert.currentStock === 0) {
                // Producto agotado - estimar ventas perdidas basadas en ventas históricas
                const dailySales = 2; // Simulado
                const restockDays = this.estimateRestockDays(alert);
                return sum + (dailySales * restockDays * alert.price);
            }
            return sum;
        }, 0);
    }

    /**
     * Genera acciones recomendadas para alertas de stock
     * @param {Array} alerts - Alertas de stock
     * @returns {Array} Acciones recomendadas
     */
    generateStockAlertActions(alerts) {
        const actions = [];
        
        // Agrupar por proveedor para pedidos consolidados
        const bySupplier = this.groupAlertsBySupplier(alerts);
        
        Object.entries(bySupplier).forEach(([supplier, products]) => {
            const criticalProducts = products.filter(p => p.priority === 'critical');
            const highProducts = products.filter(p => p.priority === 'high');
            
            if (criticalProducts.length > 0) {
                actions.push({
                    type: 'urgent_order',
                    supplier,
                    products: criticalProducts,
                    message: `Orden urgente con ${supplier} para ${criticalProducts.length} productos`
                });
            }
            
            if (highProducts.length > 0) {
                actions.push({
                    type: 'planned_order',
                    supplier,
                    products: highProducts,
                    message: `Planificar orden con ${supplier} para ${highProducts.length} productos`
                });
            }
        });
        
        return actions;
    }

    /**
     * Agrupa alertas por categoría
     * @param {Array} alerts - Alertas de stock
     * @returns {Object} Alertas agrupadas
     */
    groupAlertsByCategory(alerts) {
        return alerts.reduce((groups, alert) => {
            if (!groups[alert.category]) {
                groups[alert.category] = [];
            }
            groups[alert.category].push(alert);
            return groups;
        }, {});
    }

    /**
     * Agrupa alertas por proveedor
     * @param {Array} alerts - Alertas de stock
     * @returns {Object} Alertas agrupadas
     */
    groupAlertsBySupplier(alerts) {
        return alerts.reduce((groups, alert) => {
            const supplier = alert.supplier || 'Sin proveedor';
            if (!groups[supplier]) {
                groups[supplier] = [];
            }
            groups[supplier].push(alert);
            return groups;
        }, {});
    }

    /**
     * Calcula rotación de stock
     * @param {Array} products - Productos
     * @returns {number} Rotación
     */
    calculateStockTurnover(products) {
        // Simulación - en una app real usarías datos históricos
        const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
        const averageSales = products.length * 2; // Simulado
        return totalStock > 0 ? averageSales / totalStock : 0;
    }

    /**
     * Calcula rentabilidad de categoría
     * @param {Array} products - Productos
     * @returns {number} Margen promedio
     */
    calculateCategoryProfitability(products) {
        if (products.length === 0) return 0;
        
        const totalMargin = products.reduce((sum, p) => {
            const cost = p.costPrice || 0;
            const price = p.price || 0;
            return sum + (cost > 0 ? ((price - cost) / cost) * 100 : 0);
        }, 0);
        
        return totalMargin / products.length;
    }

    /**
     * Genera recomendaciones de inventario
     * @param {Array} lowStock - Productos con stock bajo
     * @param {Array} outOfStock - Productos agotados
     * @returns {Array} Recomendaciones
     */
    generateInventoryRecommendations(lowStock, outOfStock) {
        const recommendations = [];
        
        if (outOfStock.length > 0) {
            recommendations.push({
                type: 'critical',
                title: 'Productos Agotados',
                message: `Hay ${outOfStock.length} productos completamente agotados que necesitan reabastecimiento urgente.`,
                action: 'reorder_urgent'
            });
        }
        
        if (lowStock.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Stock Bajo',
                message: `Hay ${lowStock.length} productos con stock bajo que pronto se agotarán.`,
                action: 'plan_reorder'
            });
        }
        
        // Recomendación de diversificación
        if (lowStock.length + outOfStock.length > 10) {
            recommendations.push({
                type: 'info',
                title: 'Diversificación de Proveedores',
                message: 'Considera diversificar proveedores para reducir riesgos de desabastecimiento.',
                action: 'review_suppliers'
            });
        }
        
        return recommendations;
    }

    /**
     * Genera insights de categorías
     * @param {Array} analysis - Análisis de categorías
     * @returns {Array} Insights
     */
    generateCategoryInsights(analysis) {
        const insights = [];
        
        // Categoría con más valor
        const topCategory = analysis[0];
        if (topCategory) {
            insights.push({
                type: 'highlight',
                message: `La categoría "${topCategory.category}" representa el ${topCategory.valuePercentage.toFixed(1)}% del valor total del inventario.`
            });
        }
        
        // Categoría con mejor rentabilidad
        const mostProfitable = [...analysis].sort((a, b) => b.profitability - a.profitability)[0];
        if (mostProfitable && mostProfitable.profitability > 0) {
            insights.push({
                type: 'success',
                message: `"${mostProfitable.category}" tiene la mejor rentabilidad con un margen del ${mostProfitable.profitability.toFixed(1)}%.`
            });
        }
        
        // Categorías con problemas de stock
        const problematicCategories = analysis.filter(c => 
            c.lowStockCount > 0 || c.outOfStockCount > 0
        );
        
        if (problematicCategories.length > 0) {
            insights.push({
                type: 'warning',
                message: `${problematicCategories.length} categorías tienen productos con stock bajo o agotado.`
            });
        }
        
        return insights;
    }

    /**
     * Genera recomendaciones por categoría
     * @param {Array} analysis - Análisis de categorías
     * @returns {Array} Recomendaciones
     */
    generateCategoryRecommendations(analysis) {
        const recommendations = [];
        
        // Recomendación para categorías con alta rotación
        analysis.forEach(category => {
            if (category.stockTurnover > 5) { // Alta rotación
                recommendations.push({
                    category: category.category,
                  type: 'increase_stock',
                  message: `Alta rotación (${category.stockTurnover.toFixed(1)}). Considera aumentar el stock para evitar desabastecimiento.`
                });
            }
            
            if (category.lowStockCount > category.productCount * 0.3) {
                recommendations.push({
                    category: category.category,
                    type: 'review_supplier',
                    message: `Más del 30% de los productos tienen stock bajo. Revisa el proveedor principal.`
                });
            }
        });
        
        return recommendations;
    }

    // ==================== CACHE ====================

    /**
     * Verifica si debe usar cache
     * @param {Object} metric - Métrica
     * @returns {boolean} True si debe usar cache
     */
    shouldUseCache(metric) {
        if (!this.config.cacheEnabled) return false;
        if (!metric.lastUpdated) return false;
        
        const lastUpdated = new Date(metric.lastUpdated);
        const now = new Date();
        return (now - lastUpdated) < this.cacheDuration;
    }

    /**
     * Obtiene métrica cacheada
     * @param {string} metricId - ID de la métrica
     * @returns {Object|null} Métrica cacheada
     */
    getCachedMetric(metricId) {
        try {
            const cached = Utils.getItem(`metric_cache_${metricId}`);
            if (cached && cached.expires > Date.now()) {
                return cached.data;
            }
        } catch (error) {
            console.warn('Error obteniendo métrica cacheada:', error);
        }
        return null;
    }

    /**
     * Cachea una métrica
     * @param {string} metricId - ID de la métrica
     * @param {Object} metric - Métrica a cachear
     */
    cacheMetric(metricId, metric) {
        if (!this.config.cacheEnabled) return;
        
        try {
            const cacheData = {
                data: metric,
                expires: Date.now() + this.cacheDuration
            };
            Utils.setItem(`metric_cache_${metricId}`, cacheData);
        } catch (error) {
            console.warn('Error cacheando métrica:', error);
        }
    }

    /**
     * Obtiene historial de métrica
     * @param {string} metricId - ID de la métrica
     * @returns {Array} Historial
     */
    getMetricHistory(metricId) {
        return Utils.getItem(`metric_history_${metricId}`, []);
    }

    /**
     * Guarda reporte en historial
     * @param {Object} report - Reporte generado
     */
    saveReportToHistory(report) {
        const history = Utils.getItem('report_history', []);
        history.push({
            ...report,
            id: Utils.generateId('rep_hist')
        });
        
        // Mantener solo los últimos 50 reportes
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        Utils.setItem('report_history', history);
    }

    // ==================== MANEJADORES DE EVENTOS ====================

    /**
     * Maneja refresco de estadísticas
     */
    async handleRefresh() {
        await this.refreshAllMetrics();
    }

    /**
     * Maneja generación de reporte
     * @param {CustomEvent} event - Evento de generación
     */
    async handleGenerateReport(event) {
        const { reportId, options } = event.detail;
        try {
            const report = await this.generateReport(reportId, options);
            event.detail.callback?.success?.(report);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja exportación de datos
     * @param {CustomEvent} event - Evento de exportación
     */
    async handleExportData(event) {
        const { format, data } = event.detail;
        try {
            const result = await this.exportData(format, data);
            event.detail.callback?.success?.(result);
        } catch (error) {
            event.detail.callback?.error?.(error);
        }
    }

    /**
     * Maneja cambio de datos
     */
    async handleDataChange() {
        // Invalidar cache y recalcular métricas
        this.clearCache();
        await this.refreshAllMetrics();
    }

    // ==================== EVENTOS ====================

    /**
     * Dispara evento de estadísticas
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchStatsEvent(action, data) {
        const event = new CustomEvent(`stats:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Dispara evento de métrica
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchMetricEvent(action, data) {
        const event = new CustomEvent(`metric:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Dispara evento de reporte
     * @param {string} action - Acción realizada
     * @param {Object} data - Datos del evento
     */
    dispatchReportEvent(action, data) {
        const event = new CustomEvent(`report:${action}`, { detail: data });
        window.dispatchEvent(event);
    }

    // ==================== MÉTODOS PÚBLICOS ====================

    /**
     * Limpia el cache
     */
    clearCache() {
        // Limpiar cache de métricas
        this.metrics.forEach(metric => {
            Utils.removeItem(`metric_cache_${metric.id}`);
        });
        
        console.log('🧹 Cache de estadísticas limpiado');
    }

    /**
     * Exporta datos
     * @param {string} format - Formato (csv, excel, json)
     * @param {Object} data - Datos a exportar
     * @returns {string} Datos exportados
     */
    exportData(format, data) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(data);
            case 'excel':
                return this.exportToExcel(data);
            case 'json':
                return JSON.stringify(data, null, 2);
            default:
                throw new Error(`Formato ${format} no soportado`);
        }
    }

    /**
     * Exporta a CSV
     * @param {Object} data - Datos a exportar
     * @returns {string} CSV
     */
    exportToCSV(data) {
        // Implementación básica de CSV
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            
            const headers = Object.keys(data[0]);
            const rows = data.map(row => 
                headers.map(header => JSON.stringify(row[header] || '')).join(',')
            );
            
            return [headers.join(','), ...rows].join('\n');
        }
        
        return '';
    }

    /**
     * Exporta a Excel (simulado)
     * @param {Object} data - Datos a exportar
     * @returns {string} Mensaje de confirmación
     */
    exportToExcel(data) {
        // En una implementación real, usarías una librería como SheetJS
        console.log('Exportando a Excel:', data);
        return 'Datos listos para exportar a Excel';
    }

    /**
     * Calcula tasa de crecimiento
     * @param {Array} salesData - Datos de ventas
     * @returns {number} Tasa de crecimiento
     */
    calculateGrowthRate(salesData) {
        if (salesData.length < 2) return 0;
        
        const firstWeek = salesData.slice(0, 7).reduce((sum, day) => sum + day.total, 0);
        const lastWeek = salesData.slice(-7).reduce((sum, day) => sum + day.total, 0);
        
        return firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0;
    }

    /**
     * Analiza estacionalidad
     * @param {Array} salesData - Datos de ventas
     * @returns {Object} Análisis de estacionalidad
     */
    analyzeSeasonality(salesData) {
        // Simulación básica
        const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const byWeekday = {};
        
        salesData.forEach(day => {
            const date = new Date(day.date);
            const weekday = weekdays[date.getDay()];
            byWeekday[weekday] = (byWeekday[weekday] || 0) + day.total;
        });
        
        const bestDay = Object.entries(byWeekday).reduce((best, [day, total]) => 
            total > best.total ? { day, total } : best
        , { day: '', total: 0 });
        
        return {
            bestDay: bestDay.day,
            bestDaySales: bestDay.total,
            byWeekday
        };
    }

    /**
     * Analiza horas pico (simulado)
     * @returns {Array} Horas pico
     */
    analyzePeakHours() {
        // Simulación
        return [
            { hour: '10:00-12:00', percentage: 25 },
            { hour: '14:00-16:00', percentage: 20 },
            { hour: '18:00-20:00', percentage: 30 }
        ];
    }

    /**
     * Obtiene métricas principales
     * @returns {Promise<Array>} Métricas principales
     */
    async getKeyMetrics() {
        const keyMetricIds = [
            'total_products',
            'inventory_value',
            'low_stock_count',
            'average_price',
            'top_category'
        ];
        
        const metrics = [];
        for (const metricId of keyMetricIds) {
            const metric = await this.getMetric(metricId);
            metrics.push(metric);
        }
        
        return metrics;
    }

    /**
     * Obtiene reportes disponibles
     * @returns {Array} Reportes
     */
    getAvailableReports() {
        return Array.from(this.reports.values());
    }

    /**
     * Obtiene historial de reportes
     * @param {number} limit - Límite de resultados
     * @returns {Array} Historial
     */
    getReportHistory(limit = 10) {
        const history = Utils.getItem('report_history', []);
        return history
            .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
            .slice(0, limit);
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================
let statisticsManagerInstance = null;

/**
 * Inicializa el gestor de estadísticas
 * @returns {StatisticsManager} Instancia del gestor
 */
async function initStatisticsManager() {
    if (!statisticsManagerInstance) {
        statisticsManagerInstance = new StatisticsManager();
        await statisticsManagerInstance.init();
        window.statisticsManager = statisticsManagerInstance;
    }
    return statisticsManagerInstance;
}

/**
 * Obtiene el gestor de estadísticas
 * @returns {StatisticsManager} Instancia del gestor
 */
function getStatisticsManager() {
    if (!statisticsManagerInstance) {
        throw new Error('StatisticsManager no ha sido inicializado. Llama a initStatisticsManager() primero.');
    }
    return statisticsManagerInstance;
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Obtiene métricas clave
 * @returns {Promise<Array>} Métricas
 */
window.getKeyMetrics = async function() {
    const manager = getStatisticsManager();
    return await manager.getKeyMetrics();
};

/**
 * Genera un reporte
 * @param {string} reportId - ID del reporte
 * @param {Object} options - Opciones
 * @returns {Promise<Object>} Reporte
 */
window.generateReport = async function(reportId, options = {}) {
    const manager = getStatisticsManager();
    return await manager.generateReport(reportId, options);
};

/**
 * Refresca estadísticas
 * @returns {Promise<void>}
 */
window.refreshStatistics = async function() {
    const manager = getStatisticsManager();
    await manager.refreshAllMetrics();
};

// ==================== INICIALIZACIÓN AUTOMÁTICA ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar cuando la aplicación esté lista
    window.addEventListener('app:initialized', async () => {
        try {
            await initStatisticsManager();
            console.log('✅ Módulo de estadísticas listo');
        } catch (error) {
            console.error('❌ Error inicializando módulo de estadísticas:', error);
        }
    });
});

// ==================== EXPORTACIÓN ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatisticsManager,
        initStatisticsManager,
        getStatisticsManager,
        getKeyMetrics: window.getKeyMetrics,
        generateReport: window.generateReport,
        refreshStatistics: window.refreshStatistics
    };
}