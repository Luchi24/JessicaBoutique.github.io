// Datos de ejemplo para el inventario
let inventoryData = [
    { id: 1, name: "Laptop Dell XPS", category: "Electrónica", quantity: 15, price: 1299.99, supplier: "Dell Inc", location: "A-12", description: "Laptop de alta gama con pantalla 4K" },
    { id: 2, name: "Mouse Inalámbrico", category: "Electrónica", quantity: 42, price: 29.99, supplier: "Logitech", location: "B-05", description: "Mouse ergonómico con conectividad Bluetooth" },
    { id: 3, name: "Camiseta Algodón", category: "Ropa", quantity: 120, price: 19.99, supplier: "Textiles S.A.", location: "C-22", description: "Camiseta 100% algodón de varios colores" },
    { id: 4, name: "Café Premium", category: "Alimentos", quantity: 8, price: 12.50, supplier: "Café del Valle", location: "D-08", description: "Café de especialidad tostado medio" },
    { id: 5, name: "Silla de Oficina", category: "Oficina", quantity: 25, price: 189.99, supplier: "Mobiliario Corp", location: "E-15", description: "Silla ergonómica con soporte lumbar" },
    { id: 6, name: "Smartphone Samsung", category: "Electrónica", quantity: 30, price: 899.99, supplier: "Samsung", location: "A-07", description: "Teléfono inteligente con cámara de 108MP" },
    { id: 7, name: "Aceite de Oliva", category: "Alimentos", quantity: 5, price: 24.99, supplier: "Aceites Mediterráneos", location: "D-11", description: "Aceite de oliva extra virgen 1L" },
    { id: 8, name: "Libreta Ejecutiva", category: "Oficina", quantity: 75, price: 8.99, supplier: "Papelería Central", location: "E-03", description: "Libreta de cuero sintético con 120 páginas" }
];

// Variables globales
let currentPage = 1;
const itemsPerPage = 5;
let filteredData = [...inventoryData];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación entre secciones
    setupSectionNavigation();
    
    // Inicializar inventario
    loadInventoryTable();
    updateInventoryStats();
    
    // Configurar eventos de formulario
    setupFormEvents();
    
    // Configurar eventos de búsqueda y paginación
    setupSearchAndPagination();
    
    // Configurar gráfico de inventario
    setupInventoryChart();
    
    // Actualizar fecha
    updateDate();
});

// Configurar navegación entre secciones
function setupSectionNavigation() {
    const sectionButtons = document.querySelectorAll('.section-btn');
    const sectionContents = document.querySelectorAll('.section-content');
    
    sectionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            sectionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            this.classList.add('active');
            
            // Ocultar todos los contenidos de sección
            sectionContents.forEach(content => content.classList.remove('active'));
            
            // Mostrar el contenido de la sección correspondiente
            const sectionId = this.getAttribute('data-section');
            const contentToShow = document.getElementById(`${sectionId}-content`);
            if (contentToShow) {
                contentToShow.classList.add('active');
            }
        });
    });
}

// Cargar tabla de inventario
function loadInventoryTable() {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '';
    
    // Calcular los productos a mostrar en la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // Crear filas de la tabla
    currentPageData.forEach(product => {
        const totalValue = (product.quantity * product.price).toFixed(2);
        let statusClass = 'in-stock';
        let statusText = 'En Stock';
        
        if (product.quantity < 10) {
            statusClass = 'low-stock';
            statusText = 'Stock Bajo';
        }
        
        if (product.quantity === 0) {
            statusClass = 'out-of-stock';
            statusText = 'Agotado';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td><strong>$${totalValue}</strong></td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-icons">
                    <i class="fas fa-edit" onclick="editProduct(${product.id})" title="Editar producto"></i>
                    <i class="fas fa-trash" onclick="deleteProduct(${product.id})" title="Eliminar producto"></i>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Actualizar información de paginación
    updatePaginationInfo();
}

// Actualizar estadísticas de inventario
function updateInventoryStats() {
    const totalProducts = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, product) => {
        return sum + (product.quantity * product.price);
    }, 0);
    
    const lowStockItems = inventoryData.filter(product => product.quantity < 10).length;
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('low-stock').textContent = lowStockItems;
}

// Configurar eventos del formulario
function setupFormEvents() {
    const addProductForm = document.getElementById('add-product-form');
    
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const quantity = parseInt(document.getElementById('product-quantity').value);
        const price = parseFloat(document.getElementById('product-price').value);
        const supplier = document.getElementById('product-supplier').value;
        const location = document.getElementById('product-location').value;
        const description = document.getElementById('product-description').value;
        
        // Crear nuevo producto
        const newProduct = {
            id: inventoryData.length > 0 ? Math.max(...inventoryData.map(p => p.id)) + 1 : 1,
            name,
            category,
            quantity,
            price,
            supplier,
            location,
            description
        };
        
        // Agregar producto al inventario
        inventoryData.push(newProduct);
        filteredData = [...inventoryData];
        
        // Actualizar interfaz
        loadInventoryTable();
        updateInventoryStats();
        setupInventoryChart();
        
        // Mostrar mensaje de éxito
        alert(`Producto "${name}" agregado exitosamente al inventario.`);
        
        // Limpiar formulario
        addProductForm.reset();
    });
}

// Configurar búsqueda y paginación
function setupSearchAndPagination() {
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm.length === 0) {
            filteredData = [...inventoryData];
        } else {
            filteredData = inventoryData.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.category.toLowerCase().includes(searchTerm) ||
                product.supplier.toLowerCase().includes(searchTerm)
            );
        }
        
        currentPage = 1;
        loadInventoryTable();
    });
    
    // Botón de actualizar
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadInventoryTable();
        updateInventoryStats();
        setupInventoryChart();
        
        // Mostrar notificación visual
        this.innerHTML = '<i class="fas fa-check"></i> Actualizado';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
        }, 1500);
    });
    
    // Paginación
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadInventoryTable();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadInventoryTable();
        }
    });
}

// Actualizar información de paginación
function updatePaginationInfo() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Calcular productos mostrados
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    // Actualizar texto
    document.getElementById('items-shown').textContent = totalItems > 0 ? `${startItem}-${endItem}` : '0';
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages > 0 ? totalPages : 1}`;
    
    // Habilitar/deshabilitar botones de paginación
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

// Configurar gráfico de inventario
function setupInventoryChart() {
    const ctx = document.getElementById('inventory-chart').getContext('2d');
    
    // Agrupar productos por categoría
    const categories = {};
    inventoryData.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category] += product.quantity * product.price;
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryValues = Object.values(categories);
    
    // Colores para el gráfico
    const backgroundColors = [
        'rgba(52, 152, 219, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(230, 126, 34, 0.7)'
    ];
    
    // Destruir gráfico anterior si existe
    if (window.inventoryChart) {
        window.inventoryChart.destroy();
    }
    
    // Crear nuevo gráfico
    window.inventoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryValues,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = categoryValues.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Editar producto
function editProduct(productId) {
    const product = inventoryData.find(p => p.id === productId);
    if (product) {
        // Cambiar a la sección de agregar producto
        document.querySelector('[data-section="add"]').click();
        
        // Llenar el formulario con los datos del producto
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-supplier').value = product.supplier;
        document.getElementById('product-location').value = product.location;
        document.getElementById('product-description').value = product.description;
        
        // Cambiar el texto del botón
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
        
        // Cambiar el evento del formulario para actualizar en lugar de agregar
        const form = document.getElementById('add-product-form');
        const newSubmitHandler = function(e) {
            e.preventDefault();
            
            // Actualizar producto
            product.name = document.getElementById('product-name').value;
            product.category = document.getElementById('product-category').value;
            product.quantity = parseInt(document.getElementById('product-quantity').value);
            product.price = parseFloat(document.getElementById('product-price').value);
            product.supplier = document.getElementById('product-supplier').value;
            product.location = document.getElementById('product-location').value;
            product.description = document.getElementById('product-description').value;
            
            // Actualizar interfaz
            loadInventoryTable();
            updateInventoryStats();
            setupInventoryChart();
            
            // Restaurar formulario
            form.reset();
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
            
            // Restaurar el evento original
            form.removeEventListener('submit', newSubmitHandler);
            form.addEventListener('submit', setupFormEvents);
            
            alert(`Producto "${product.name}" actualizado exitosamente.`);
        };
        
        // Remover el evento anterior y añadir el nuevo
        form.removeEventListener('submit', setupFormEvents);
        form.addEventListener('submit', newSubmitHandler);
    }
}

// Eliminar producto
function deleteProduct(productId) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        // Encontrar índice del producto
        const index = inventoryData.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            const productName = inventoryData[index].name;
            
            // Eliminar producto
            inventoryData.splice(index, 1);
            filteredData = [...inventoryData];
            
            // Actualizar interfaz
            loadInventoryTable();
            updateInventoryStats();
            setupInventoryChart();
            
            alert(`Producto "${productName}" eliminado exitosamente.`);
        }
    }
}

// Actualizar fecha
function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('last-update').textContent = now.toLocaleDateString('es-ES', options);
}
