// Inventario - Jessica Boutique

let currentView = 'table';
let selectedProducts = new Set();
let currentPage = 1;
const productsPerPage = 10;

function loadInventory() {
  populateFilters();
  renderInventoryView();
  updateInventorySummary();
  
  // Event listeners
  document.getElementById('searchInventory')?.addEventListener('input', filterInventory);
  document.getElementById('filterCategory')?.addEventListener('change', filterInventory);
  document.getElementById('filterSize')?.addEventListener('change', filterInventory);
  document.getElementById('filterColor')?.addEventListener('change', filterInventory);
  document.getElementById('filterStock')?.addEventListener('change', filterInventory);
  document.getElementById('sortBy')?.addEventListener('change', filterInventory);
  document.getElementById('resetFilters')?.addEventListener('click', resetInventoryFilters);
  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    window.location.href = 'agregar-producto.html';
  });
  document.getElementById('exportInventoryBtn')?.addEventListener('click', exportInventory);
  
  // Vista toggle
  document.getElementById('tableViewBtn')?.addEventListener('click', () => switchView('table'));
  document.getElementById('gridViewBtn')?.addEventListener('click', () => switchView('grid'));
  
  // Bulk actions
  document.getElementById('selectAll')?.addEventListener('change', toggleSelectAll);
  document.getElementById('bulkDeleteBtn')?.addEventListener('click', bulkDeleteProducts);
  document.getElementById('bulkDeselectBtn')?.addEventListener('click', deselectAll);
  
  // Paginación
  document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
}

function populateFilters() {
  const categoryFilter = document.getElementById('filterCategory');
  const sizeFilter = document.getElementById('filterSize');
  const colorFilter = document.getElementById('filterColor');
  
  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
      appState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  
  if (sizeFilter) {
    sizeFilter.innerHTML = '<option value="">Todas las tallas</option>' +
      appState.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
  }
  
  if (colorFilter) {
    colorFilter.innerHTML = '<option value="">Todos los colores</option>' +
      appState.colors.map(color => `<option value="${color.hex}">${color.name}</option>`).join('');
  }
}

function renderInventoryView() {
  const tableView = document.getElementById('tableView');
  const gridView = document.getElementById('gridView');
  const pagination = document.getElementById('pagination');
  
  if (currentView === 'table') {
    if (tableView) tableView.style.display = 'block';
    if (gridView) gridView.style.display = 'none';
    renderInventoryTable();
  } else {
    if (tableView) tableView.style.display = 'none';
    if (gridView) gridView.style.display = 'grid';
    renderInventoryGrid();
  }
  
  updatePagination();
}

function renderInventoryTable(products = appState.products) {
  const tableBody = document.getElementById('inventoryTableBody');
  const emptyState = document.getElementById('emptyInventory');
  const selectAllCheckbox = document.getElementById('selectAll');
  
  if (!tableBody) return;
  
  // Paginación
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  if (paginatedProducts.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  tableBody.innerHTML = paginatedProducts.map((product, index) => {
    const colorInfo = product.color ? 
      appState.colors.find(c => c.hex === product.color) : null;
    
    const totalValue = product.price * product.quantity;
    const stockLevel = getStockLevel(product.quantity, product.minStock || 5);
    
    return `
      <tr class="${stockLevel === 'low' ? 'low-stock' : ''} fade-in-up" style="animation-delay: ${index * 0.05}s">
        <td>
          <input type="checkbox" class="product-checkbox" data-id="${product.id}" 
                 ${selectedProducts.has(product.id) ? 'checked' : ''}>
        </td>
        <td>
          <div class="product-info-cell">
            <div class="product-name">${product.name}</div>
            ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
          </div>
        </td>
        <td>
          <span class="category-badge">${product.category}</span>
        </td>
        <td>${product.size || 'N/A'}</td>
        <td>
          ${colorInfo ? `
            <div class="color-display">
              <div class="color-sample" style="background-color: ${colorInfo.hex};"></div>
              <span>${colorInfo.name}</span>
            </div>
          ` : 'N/A'}
        </td>
        <td>
          <div class="stock-display">
            <span class="quantity-badge ${stockLevel}">${product.quantity}</span>
            <div class="stock-level">
              <div class="stock-fill ${stockLevel}" style="width: ${Math.min((product.quantity / 20) * 100, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="price-cell">${formatCurrency(product.price)}</td>
        <td class="value-cell">${formatCurrency(totalValue)}</td>
        <td>
          <span class="stock-status ${stockLevel}">${getStockStatus(stockLevel)}</span>
        </td>
        <td>
          <div class="product-actions">
            <button class="btn-icon edit-product" data-id="${product.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-product" data-id="${product.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
            <button class="btn-icon quick-sale" data-id="${product.id}" title="Venta rápida">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  attachProductActions();
  attachCheckboxListeners();
}

function renderInventoryGrid(products = appState.products) {
  const gridView = document.getElementById('gridView');
  if (!gridView) return;
  
  // Paginación
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  if (paginatedProducts.length === 0) {
    gridView.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-box-open"></i>
        <p>No hay productos en el inventario</p>
        <a href="agregar-producto.html" class="btn btn-primary">Agregar primer producto</a>
      </div>
    `;
    return;
  }
  
  gridView.innerHTML = paginatedProducts.map((product, index) => {
    const colorInfo = product.color ? 
      appState.colors.find(c => c.hex === product.color) : null;
    
    const stockLevel = getStockLevel(product.quantity, product.minStock || 5);
    const isSelected = selectedProducts.has(product.id);
    
    return `
      <div class="product-card-boutique fade-in-up ${isSelected ? 'selected' : ''}" 
           style="animation-delay: ${index * 0.05}s" data-id="${product.id}">
        <div class="product-tags">
          ${product.tags && product.tags.includes('new') ? `
            <span class="product-tag new">Nuevo</span>
          ` : ''}
          ${product.tags && product.tags.includes('sale') ? `
            <span class="product-tag sale">Oferta</span>
          ` : ''}
          ${product.tags && product.tags.includes('best') ? `
            <span class="product-tag best">Más Vendido</span>
          ` : ''}
        </div>
        
        <div class="product-image">
          <i class="fas fa-${getProductIcon(product.category)}"></i>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          
          <div class="product-category">
            <i class="fas fa-tag"></i> ${product.category}
          </div>
          
          <div class="product-attributes">
            ${product.size ? `
              <div class="attribute">
                <i class="fas fa-ruler"></i> ${product.size}
              </div>
            ` : ''}
            ${colorInfo ? `
              <div class="attribute">
                <i class="fas fa-palette"></i> ${colorInfo.name}
              </div>
            ` : ''}
            ${product.material ? `
              <div class="attribute">
                <i class="fas fa-scroll"></i> ${product.material}
              </div>
            ` : ''}
          </div>
          
          <div class="product-footer">
            <div class="product-price">${formatCurrency(product.price)}</div>
            <div class="product-stock">
              <div class="stock-indicator ${stockLevel}"></div>
              <span>${product.quantity} unidades</span>
            </div>
          </div>
          
          <div class="product-actions-grid">
            <button class="btn btn-outline edit-product" data-id="${product.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger delete-product" data-id="${product.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <input type="checkbox" class="grid-checkbox" data-id="${product.id}" 
               ${isSelected ? 'checked' : ''}>
      </div>
    `;
  }).join('');
  
  attachProductActions();
  attachGridCheckboxListeners();
}

function getProductIcon(category) {
  const icons = {
    'Blusas y Camisetas': 'tshirt',
    'Pantalones y Jeans': 'jeans',
    'Vestidos': 'female',
    'Faldas': 'skating',
    'Abrigos y Chaquetas': 'jacket',
    'Ropa Deportiva': 'running',
    'Ropa Interior': 'socks',
    'Accesorios': 'gem',
    'Calzado': 'shoe-prints',
    'Bolsos': 'shopping-bag'
  };
  
  return icons[category] || 'tshirt';
}

function getStockLevel(quantity, minStock) {
  if (quantity === 0) return 'critical';
  if (quantity <= minStock) return 'low';
  if (quantity <= minStock * 3) return 'medium';
  return 'high';
}

function getStockStatus(level) {
  switch(level) {
    case 'critical': return 'Agotado';
    case 'low': return 'Bajo';
    case 'medium': return 'Normal';
    case 'high': return 'Alto';
    default: return 'Normal';
  }
}

function filterInventory() {
  const searchTerm = document.getElementById('searchInventory')?.value.toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || '';
  const size = document.getElementById('filterSize')?.value || '';
  const color = document.getElementById('filterColor')?.value || '';
  const stockFilter = document.getElementById('filterStock')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'quantity_desc';
  
  let filteredProducts = appState.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || product.category === category;
    const matchesSize = !size || product.size === size;
    const matchesColor = !color || product.color === color;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.quantity <= (product.minStock || 5);
    } else if (stockFilter === 'normal') {
      matchesStock = product.quantity > (product.minStock || 5);
    } else if (stockFilter === 'out') {
      matchesStock = product.quantity === 0;
    }
    
    return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesStock;
  });
  
  // Ordenar productos
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'quantity_desc':
        return b.quantity - a.quantity;
      case 'quantity_asc':
        return a.quantity - b.quantity;
      case 'price_desc':
        return b.price - a.price;
      case 'price_asc':
        return a.price - b.price;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'date_desc':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'date_asc':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return 0;
    }
  });
  
  currentPage = 1;
  renderInventoryView();
  updateInventorySummary(filteredProducts);
}

function resetInventoryFilters() {
  document.getElementById('searchInventory').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterSize').value = '';
  document.getElementById('filterColor').value = '';
  document.getElementById('filterStock').value = '';
  document.getElementById('sortBy').value = 'quantity_desc';
  
  currentPage = 1;
  renderInventoryView();
  updateInventorySummary();
}

function updateInventorySummary(products = appState.products) {
  const totalProducts = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStock = products.filter(p => p.quantity <= (p.minStock || 5)).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryValue = document.getElementById('summaryValue');
  const summaryLow = document.getElementById('summaryLow');
  const summaryOut = document.getElementById('summaryOut');
  
  if (summaryTotal) summaryTotal.textContent = totalProducts.toLocaleString();
  if (summaryValue) summaryValue.textContent = formatCurrency(totalValue);
  if (summaryLow) summaryLow.textContent = lowStock;
  if (summaryOut) summaryOut.textContent = outOfStock;
}

function switchView(view) {
  currentView = view;
  const tableViewBtn = document.getElementById('tableViewBtn');
  const gridViewBtn = document.getElementById('gridViewBtn');
  
  if (tableViewBtn && gridViewBtn) {
    tableViewBtn.classList.toggle('active', view === 'table');
    gridViewBtn.classList.toggle('active', view === 'grid');
  }
  
  renderInventoryView();
}

function attachProductActions() {
  // Editar producto
  document.querySelectorAll('.edit-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  // Eliminar producto
  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
  
  // Venta rápida
  document.querySelectorAll('.quick-sale').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      quickSale(productId);
    });
  });
}

function editProduct(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;
  
  // Redirigir a página de edición o abrir modal
  window.location.href = `agregar-producto.html?edit=${productId}`;
}

function deleteProduct(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;
  
  showModal(
    'Eliminar Producto',
    `¿Está segura de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
    () => {
      const index = appState.products.findIndex(p => p.id === productId);
      if (index !== -1) {
        appState.products.splice(index, 1);
        saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
        renderInventoryView();
        updateInventorySummary();
        updateDashboardStats();
        addActivity('product', `Producto "${product.name}" eliminado del inventario`);
        showNotification('Producto eliminado correctamente', 'success');
      }
    }
  );
}

function quickSale(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;
  
  // Redirigir a ventas con el producto pre-seleccionado
  window.location.href = `ventas.html?product=${productId}`;
}

function attachCheckboxListeners() {
  document.querySelectorAll('.product-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const productId = e.target.getAttribute('data-id');
      if (e.target.checked) {
        selectedProducts.add(productId);
      } else {
        selectedProducts.delete(productId);
        const selectAll = document.getElementById('selectAll');
        if (selectAll) selectAll.checked = false;
      }
      updateBulkActions();
    });
  });
}

function attachGridCheckboxListeners() {
  document.querySelectorAll('.grid-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const productId = e.target.getAttribute('data-id');
      const productCard = e.target.closest('.product-card-boutique');
      
      if (e.target.checked) {
        selectedProducts.add(productId);
        if (productCard) productCard.classList.add('selected');
      } else {
        selectedProducts.delete(productId);
        if (productCard) productCard.classList.remove('selected');
      }
      updateBulkActions();
    });
  });
  
  // Click en tarjeta para seleccionar
  document.querySelectorAll('.product-card-boutique').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
        const productId = card.getAttribute('data-id');
        const checkbox = card.querySelector('.grid-checkbox');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      }
    });
  });
}

function toggleSelectAll(e) {
  const isChecked = e.target.checked;
  const checkboxes = document.querySelectorAll('.product-checkbox, .grid-checkbox');
  
  selectedProducts.clear();
  checkboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
    if (isChecked) {
      const productId = checkbox.getAttribute('data-id');
      selectedProducts.add(productId);
    }
  });
  
  // Actualizar estilos en vista grid
  document.querySelectorAll('.product-card-boutique').forEach(card => {
    card.classList.toggle('selected', isChecked);
  });
  
  updateBulkActions();
}

function deselectAll() {
  selectedProducts.clear();
  const checkboxes = document.querySelectorAll('.product-checkbox, .grid-checkbox');
  const selectAll = document.getElementById('selectAll');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  if (selectAll) selectAll.checked = false;
  
  document.querySelectorAll('.product-card-boutique').forEach(card => {
    card.classList.remove('selected');
  });
  
  updateBulkActions();
}

function updateBulkActions() {
  const bulkActions = document.getElementById('bulkActions');
  const selectedCount = document.getElementById('selectedCount');
  
  if (!bulkActions || !selectedCount) return;
  
  const count = selectedProducts.size;
  
  if (count > 0) {
    bulkActions.classList.add('active');
    selectedCount.textContent = `${count} producto${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}`;
  } else {
    bulkActions.classList.remove('active');
  }
}

function bulkDeleteProducts() {
  if (selectedProducts.size === 0) return;
  
  showModal(
    'Eliminar Productos',
    `¿Está segura de eliminar ${selectedProducts.size} producto${selectedProducts.size !== 1 ? 's' : ''} seleccionado${selectedProducts.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`,
    () => {
      const deletedProducts = [];
      
      selectedProducts.forEach(productId => {
        const index = appState.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          deletedProducts.push(appState.products[index].name);
          appState.products.splice(index, 1);
        }
      });
      
      saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
      selectedProducts.clear();
      renderInventoryView();
      updateInventorySummary();
      updateDashboardStats();
      
      if (deletedProducts.length > 0) {
        addActivity('product', `${deletedProducts.length} productos eliminados del inventario`);
        showNotification(`${deletedProducts.length} productos eliminados correctamente`, 'success');
      }
    }
  );
}

function exportInventory() {
  const data = {
    products: appState.products,
    exportedAt: new Date().toISOString(),
    totalProducts: appState.products.length,
    totalValue: appState.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `inventario_jessica_boutique_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showNotification('Inventario exportado correctamente', 'success');
}

function changePage(direction) {
  const totalProducts = appState.products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  currentPage += direction;
  
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  
  renderInventoryView();
  updatePagination();
}

function updatePagination() {
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (!pageInfo || !prevBtn || !nextBtn) return;
  
  const totalProducts = appState.products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}