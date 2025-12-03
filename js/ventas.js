// Ventas Functions
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sales')) {
    setupSalesSection();
  }
});

function setupSalesSection() {
  loadProductsForSale();
  setupCartListeners();
  setupPaymentListeners();
  
  // Inicializar búsqueda de clientes si existe
  const clientNameInput = document.getElementById('clientName');
  if (clientNameInput) {
    clientNameInput.addEventListener('input', searchClients);
  }
}

function loadProductsForSale() {
  const container = document.getElementById('saleProductsGrid');
  if (!container) return;
  
  if (appState.products.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay productos disponibles para la venta</p>';
    return;
  }
  
  const availableProducts = appState.products.filter(p => p.quantity > 0);
  
  if (availableProducts.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay stock disponible para la venta</p>';
    return;
  }
  
  container.innerHTML = availableProducts.map(product => {
    const colorName = product.color ? 
      appState.colors.find(c => c.hex === product.color)?.name || 'Color' 
      : '';
    
    const attributes = [];
    if (product.size) attributes.push(product.size);
    if (colorName) attributes.push(colorName);
    
    const stockClass = product.quantity <= (product.minStock || 5) ? 'low' : '';
    
    return `
      <div class="product-card" data-id="${product.id}">
        <h4>${product.name}</h4>
        ${attributes.length > 0 ? `<p><small>${attributes.join(' - ')}</small></p>` : ''}
        <p class="price">${formatCurrency(product.price)}</p>
        <p class="stock ${stockClass}">Stock: ${product.quantity}</p>
        <button class="btn btn-outline add-to-cart" data-id="${product.id}">
          <i class="fas fa-cart-plus"></i> Agregar
        </button>
      </div>
    `;
  }).join('');
  
  attachAddToCartListeners();
  setupProductSearch();
}

function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      addProductToCart(productId);
    });
  });
  
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('dblclick', (e) => {
      const productId = card.getAttribute('data-id');
      addProductToCart(productId);
    });
  });
}

function setupProductSearch() {
  const searchInput = document.getElementById('searchSaleProduct');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      const productName = card.querySelector('h4').textContent.toLowerCase();
      const isVisible = productName.includes(searchTerm);
      card.style.display = isVisible ? 'block' : 'none';
    });
  });
}

function addProductToCart(productId) {
  const product = appState.products.find(p => p.id === productId);
  
  if (!product) return;
  
  if (product.quantity <= 0) {
    showNotification('Producto sin stock disponible', 'warning');
    return;
  }
  
  const existingCartItem = cart.find(item => item.productId === productId);
  
  if (existingCartItem) {
    if (existingCartItem.quantity >= product.quantity) {
      showNotification('No hay suficiente stock disponible', 'warning');
      return;
    }
    existingCartItem.quantity += 1;
    existingCartItem.subtotal = existingCartItem.quantity * existingCartItem.price;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      maxStock: product.quantity
    });
  }
  
  updateCartDisplay();
  showNotification(`${product.name} agregado al carrito`, 'success');
}

function setupCartListeners() {
  const cancelSaleBtn = document.getElementById('cancelSale');
  if (cancelSaleBtn) {
    cancelSaleBtn.addEventListener('click', () => {
      showModal(
        'Cancelar Venta',
        '¿Está seguro de cancelar la venta actual? Se perderán todos los productos del carrito.',
        () => {
          cart = [];
          updateCartDisplay();
          showNotification('Venta cancelada', 'info');
        }
      );
    });
  }
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartElement = document.getElementById('emptyCart');
  
  if (!cartItemsContainer || !emptyCartElement) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    emptyCartElement.style.display = 'flex';
    updatePaymentSummary();
    return;
  }
  
  emptyCartElement.style.display = 'none';
  
  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td>
        <div class="quantity-control">
          <button class="quantity-btn decrease-qty" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn increase-qty" data-index="${index}">+</button>
        </div>
      </td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.subtotal)}</td>
      <td>
        <button class="remove-item" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  attachCartItemListeners();
  updatePaymentSummary();
}

function attachCartItemListeners() {
  document.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      updateCartItemQuantity(index, -1);
    });
  });
  
  document.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      updateCartItemQuantity(index, 1);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      removeCartItem(index);
    });
  });
}

function updateCartItemQuantity(index, change) {
  const item = cart[index];
  const product = appState.products.find(p => p.id === item.productId);
  
  const newQuantity = item.quantity + change;
  
  if (newQuantity < 1) {
    removeCartItem(index);
    return;
  }
  
  if (newQuantity > product.quantity) {
    showNotification('No hay suficiente stock disponible', 'warning');
    return;
  }
  
  item.quantity = newQuantity;
  item.subtotal = item.quantity * item.price;
  
  updateCartDisplay();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  updateCartDisplay();
  showNotification('Producto eliminado del carrito', 'info');
}

function setupPaymentListeners() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', () => {
      updatePaymentSummary();
    });
  });
  
  const completeSaleBtn = document.getElementById('completeSale');
  if (completeSaleBtn) {
    completeSaleBtn.addEventListener('click', completeSale);
  }
}

function updatePaymentSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const igv = subtotal * 0.18;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
  const cardFee = paymentMethod === 'card' ? subtotal * 0.05 : 0;
  const total = subtotal + igv + cardFee;
  
  if (document.getElementById('subtotalAmount')) {
    document.getElementById('subtotalAmount').textContent = formatCurrency(subtotal);
  }
  
  if (document.getElementById('igvAmount')) {
    document.getElementById('igvAmount').textContent = formatCurrency(igv);
  }
  
  if (document.getElementById('totalAmount')) {
    document.getElementById('totalAmount').textContent = formatCurrency(total);
  }
  
  const cardFeeRow = document.getElementById('cardFeeRow');
  const cardFeeAmount = document.getElementById('cardFeeAmount');
  
  if (cardFeeRow && cardFeeAmount) {
    if (paymentMethod === 'card') {
      cardFeeRow.style.display = 'flex';
      cardFeeAmount.textContent = formatCurrency(cardFee);
    } else {
      cardFeeRow.style.display = 'none';
    }
  }
}

function searchClients() {
  const input = document.getElementById('clientName');
  const resultsContainer = document.getElementById('clientResults');
  
  if (!input || !resultsContainer) return;
  
  const searchTerm = input.value.toLowerCase().trim();
  
  if (searchTerm.length < 2) {
    resultsContainer.classList.remove('active');
    return;
  }
  
  // Buscar clientes en las ventas anteriores
  const clients = appState.sales.reduce((acc, sale) => {
    if (sale.clientName && sale.clientName.toLowerCase().includes(searchTerm)) {
      if (!acc.some(c => c.name === sale.clientName)) {
        acc.push({
          name: sale.clientName,
          phone: sale.clientPhone,
          salesCount: appState.sales.filter(s => s.clientName === sale.clientName).length
        });
      }
    }
    return acc;
  }, []);
  
  if (clients.length === 0) {
    resultsContainer.classList.remove('active');
    return;
  }
  
  resultsContainer.innerHTML = clients.map(client => `
    <div class="client-result" data-name="${client.name}" data-phone="${client.phone || ''}">
      <div class="client-name">${client.name}</div>
      ${client.phone ? `<div class="client-phone">${client.phone}</div>` : ''}
      <div class="client-sales">${client.salesCount} compras</div>
    </div>
  `).join('');
  
  resultsContainer.classList.add('active');
  
  // Agregar event listeners a los resultados
  document.querySelectorAll('.client-result').forEach(result => {
    result.addEventListener('click', () => {
      const name = result.getAttribute('data-name');
      const phone = result.getAttribute('data-phone');
      
      document.getElementById('clientName').value = name;
      if (document.getElementById('clientPhone')) {
        document.getElementById('clientPhone').value = phone || '';
      }
      
      resultsContainer.classList.remove('active');
    });
  });
  
  // Cerrar resultados al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove('active');
    }
  });
}

function completeSale() {
  if (cart.length === 0) {
    showNotification('El carrito está vacío', 'warning');
    return;
  }
  
  const clientName = document.getElementById('clientName')?.value.trim() || 'Cliente general';
  const clientPhone = document.getElementById('clientPhone')?.value.trim() || '';
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
  
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const igv = subtotal * 0.18;
  const cardFee = paymentMethod === 'card' ? subtotal * 0.05 : 0;
  const total = subtotal + igv + cardFee;
  
  const saleItems = cart.map(item => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal
  }));
  
  const newSale = {
    id: generateId('sale_'),
    date: new Date().toISOString(),
    clientName,
    clientPhone,
    items: saleItems,
    paymentMethod,
    subtotal,
    igv,
    cardFee,
    total
  };
  
  appState.sales.push(newSale);
  
  cart.forEach(cartItem => {
    const product = appState.products.find(p => p.id === cartItem.productId);
    if (product) {
      product.quantity -= cartItem.quantity;
      product.updatedAt = new Date().toISOString();
      
      if (product.quantity <= (product.minStock || 5)) {
        addActivity('warning', `Stock bajo para "${product.name}" (${product.quantity} unidades)`);
      }
    }
  });
  
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  saveToStorage(STORAGE_KEYS.SALES, appState.sales);
  
  const saleTotalFormatted = formatCurrency(total);
  showNotification(`Venta completada por ${saleTotalFormatted}`, 'success');
  addActivity('sale', `Venta registrada por ${saleTotalFormatted} para ${clientName}`);
  
  cart = [];
  if (document.getElementById('clientName')) {
    document.getElementById('clientName').value = '';
  }
  if (document.getElementById('clientPhone')) {
    document.getElementById('clientPhone').value = '';
  }
  
  const cashRadio = document.querySelector('input[name="paymentMethod"][value="cash"]');
  if (cashRadio) {
    cashRadio.checked = true;
  }
  
  updateCartDisplay();
  updateDashboardStats();
  loadProductsForSale();
}