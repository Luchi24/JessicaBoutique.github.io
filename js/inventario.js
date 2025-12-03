// Inventario Functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('inventory')) {
    loadInventory();
  }
});

function loadInventory() {
  populateFilters();
  renderInventoryTable();
  updateInventorySummary();
  
  // Event listeners
  const searchInput = document.getElementById('searchInventory');
  if (searchInput) {
    searchInput.addEventListener('input', filterInventory);
  }
  
  const filterCategory = document.getElementById('filterCategory');
  if (filterCategory) {
    filterCategory.addEventListener('change', filterInventory);
  }
  
  const filterSize = document.getElementById('filterSize');
  if (filterSize) {
    filterSize.addEventListener('change', filterInventory);
  }
  
  const filterColor = document.getElementById('filterColor');
  if (filterColor) {
    filterColor.addEventListener('change', filterInventory);
  }
  
  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.addEventListener('change', filterInventory);
  }
  
  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', resetInventoryFilters);
  }
}

function populateFilters() {
  const categoryFilter = document.getElementById('filterCategory');
  const sizeFilter = document.getElementById('filterSize');
  const colorFilter = document.getElementById('filterColor');
  
  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="">Todas</option>' +
      appState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  
  if (sizeFilter) {
    sizeFilter.innerHTML = '<option value="">Todas</option>' +
      appState.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
  }
  
  if (colorFilter) {
    colorFilter.innerHTML = '<option value="">Todos</option>' +
      appState.colors.map(color => `<option value="${color.hex}">${color.name}</option>`).join('');
  }
}

function renderInventoryTable(products = appState.products) {
  const tableBody = document.getElementById('inventoryTableBody');
  const emptyState = document.getElementById('emptyInventory');
  
  if (!tableBody) return;
  
  if (products.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  tableBody.innerHTML = products.map(product => {
    const colorDisplay = product.color ? 
      `<div class="color-indicator" style="background-color: ${product.color};"></div> ${appState.colors.find(c => c.hex === product.color)?.name || product.color}` 
      : 'N/A';
    
    const totalValue = product.price * product.quantity;
    const minStock = product.minStock || 5;
    const stockClass = product.quantity <= minStock ? 'low-stock' : '';
    
    return `
      <tr class="${stockClass}">
        <td>
          <strong>${product.name}</strong>
          ${product.description ? `<br><small>${product.description}</small>` : ''}
        </td>
        <td>${product.category || 'N/A'}</td>
        <td>${product.size || 'N/A'}</td>
        <td>${colorDisplay}</td>
        <td><span class="quantity-badge ${stockClass}">${product.quantity}</span></td>
        <td>${formatCurrency(product.price)}</td>
        <td>${formatCurrency(totalValue)}</td>
        <td class="product-actions">
          <button class="btn-icon edit-product" data-id="${product.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-product" data-id="${product.id}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  attachProductActions();
}

function attachProductActions() {
  document.querySelectorAll('.edit-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

function editProduct(productId) {
  // Redirigir a la página de agregar producto con el ID para editar
  window.location.href = `agregar-producto.html?edit=${productId}`;
}

function deleteProduct(productId) {
  showModal(
    'Eliminar Producto',
    '¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.',
    () => {
      const index = appState.products.findIndex(p => p.id === productId);
      if (index !== -1) {
        const productName = appState.products[index].name;
        appState.products.splice(index, 1);
        saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
        renderInventoryTable();
        updateInventorySummary();
        updateDashboardStats();
        addActivity('product', `Producto "${productName}" eliminado del inventario`);
        showNotification('Producto eliminado correctamente', 'success');
      }
    }
  );
}

function filterInventory() {
  const searchTerm = document.getElementById('searchInventory')?.value.toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || '';
  const size = document.getElementById('filterSize')?.value || '';
  const color = document.getElementById('filterColor')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'quantity';
  
  let filteredProducts = appState.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || product.category === category;
    const matchesSize = !size || product.size === size;
    const matchesColor = !color || product.color === color;
    
    return matchesSearch && matchesCategory && matchesSize && matchesColor;
  });
  
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'quantity':
        return b.quantity - a.quantity;
      case 'quantity_asc':
        return a.quantity - b.quantity;
      case 'price':
        return b.price - a.price;
      case 'price_asc':
        return a.price - b.price;
      case 'date':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'date_asc':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return 0;
    }
  });
  
  renderInventoryTable(filteredProducts);
  updateInventorySummary(filteredProducts);
}

function resetInventoryFilters() {
  if (document.getElementById('searchInventory')) {
    document.getElementById('searchInventory').value = '';
  }
  if (document.getElementById('filterCategory')) {
    document.getElementById('filterCategory').value = '';
  }
  if (document.getElementById('filterSize')) {
    document.getElementById('filterSize').value = '';
  }
  if (document.getElementById('filterColor')) {
    document.getElementById('filterColor').value = '';
  }
  if (document.getElementById('sortBy')) {
    document.getElementById('sortBy').value = 'quantity';
  }
  
  renderInventoryTable();
  updateInventorySummary();
}

function updateInventorySummary(products = appState.products) {
  const totalProducts = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStock = products.filter(p => p.quantity <= (p.minStock || 5)).length;
  
  if (document.getElementById('summaryTotal')) {
    document.getElementById('summaryTotal').textContent = totalProducts;
  }
  
  if (document.getElementById('summaryValue')) {
    document.getElementById('summaryValue').textContent = formatCurrency(totalValue);
  }
  
  if (document.getElementById('summaryLow')) {
    document.getElementById('summaryLow').textContent = lowStock;
  }
}