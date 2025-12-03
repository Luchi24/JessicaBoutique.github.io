// Ventas - Jessica Boutique

let cart = [];
let currentClient = null;

function setupSalesSection() {
  loadProductsForSale();
  setupCartListeners();
  setupPaymentListeners();
  setupCalculator();
  loadRecentSales();
  populateCategoryFilter();
}

function loadProductsForSale() {
  const container = document.getElementById('saleProductsGrid');
  if (!container) return;
  
  if (appState.products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-box-open"></i>
        <p>No hay productos disponibles para la venta</p>
        <a href="agregar-producto.html" class="btn btn-primary">Agregar primer producto</a>
      </div>
    `;
    return;
  }
  
  // Filtrar productos con stock > 0
  const availableProducts = appState.products.filter(p => p.quantity > 0);
  
  container.innerHTML = availableProducts.map(product => {
    const colorInfo = product.color ? 
      appState.colors.find(c => c.hex === product.color) : null;
    
    const stockLevel = getStockLevel(product.quantity, product.minStock || 5);
    
    return `
      <div class="product-card-sale fade-in-up" data-id="${product.id}">
        <div class="product-image">
          <i class="fas fa-${getProductIcon(product.category)}"></i>
        </div>
        <h4>${product.name}</h4>
        
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
        </div>
        
        <div class="price">${formatCurrency(product.price)}</div>
        
        <div class="stock">
          <div class="stock-indicator ${stockLevel}"></div>
          <span>${product.quantity} unidades</span>
        </div>
        
        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
          <i class="fas fa-cart-plus"></i> Agregar
        </button>
      </div>
    `;
  }).join('');
  
  attachAddToCartListeners();
  setupProductSearch();
  setupProductFilters();
}

function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      addProductToCart(productId);
    });
  });
  
  // Doble click en tarjeta para agregar al carrito
  document.querySelectorAll('.product-card-sale').forEach(card => {
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
    const productCards = document.querySelectorAll('.product-card-sale');
    
    productCards.forEach(card => {
      const productName = card.querySelector('h4').textContent.toLowerCase();
      const isVisible = productName.includes(searchTerm);
      card.style.display = isVisible ? 'block' : 'none';
    });
  });
}

function setupProductFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const categoryFilter = document.getElementById('saleCategoryFilter');
  
  if (filterButtons) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        filterProducts(filter);
      });
    });
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      filterProducts('category');
    });
  }
}

function filterProducts(filterType) {
  const productCards = document.querySelectorAll('.product-card-sale');
  const categoryFilter = document.getElementById('saleCategoryFilter');
  
  productCards.forEach(card => {
    let isVisible = true;
    const productId = card.dataset.id;
    const product = appState.products.find(p => p.id === productId);
    
    if (!product) return;
    
    switch(filterType) {
      case 'popular':
        // Mostrar productos más vendidos (simulado)
        isVisible = product.quantity < 10; // Productos con stock bajo como "populares"
        break;
      case 'low':
        isVisible = product.quantity <= (product.minStock || 5);
        break;
      case 'category':
        const selectedCategory = categoryFilter?.value;
        if (selectedCategory) {
          isVisible = product.category === selectedCategory;
        }
        break;
    }
    
    card.style.display = isVisible ? 'block' : 'none';
  });
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById('saleCategoryFilter');
  if (!categoryFilter) return;
  
  const categories = [...new Set(appState.products.map(p => p.category))];
  
  categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function addProductToCart(productId) {
  const product = appState.products.find(p => p.id === productId);
  
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
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
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    showModal(
      'Vaciar Carrito',
      '¿Está segura de vaciar el carrito? Se perderán todos los productos seleccionados.',
      () => {
        cart = [];
        updateCartDisplay();
        showNotification('Carrito vaciado', 'info');
      }
    );
  });
  
  document.getElementById('saveCartBtn')?.addEventListener('click', () => {
    showNotification('Función de guardar carrito en desarrollo', 'info');
  });
  
  document.getElementById('cancelSale')?.addEventListener('click', () => {
    showModal(
      'Cancelar Venta',
      '¿Está segura de cancelar la venta actual? Se perderán todos los productos del carrito.',
      () => {
        cart = [];
        updateCartDisplay();
        document.getElementById('clientName').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('saleNotes').value = '';
        showNotification('Venta cancelada', 'info');
      }
    );
  });
  
  // Client history button
  document.getElementById('clientHistoryBtn')?.addEventListener('click', () => {
    const clientName = document.getElementById('clientName').value.trim();
    if (clientName) {
      showClientHistory(clientName);
    } else {
      showNotification('Ingrese un nombre de cliente primero', 'warning');
    }
  });
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartElement = document.getElementById('emptyCart');
  const cartCount = document.getElementById('cartCount');
  
  if (!cartItemsContainer || !emptyCartElement || !cartCount) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    emptyCartElement.style.display = 'flex';
    cartCount.textContent = '0 productos';
    updatePaymentSummary();
    return;
  }
  
  emptyCartElement.style.display = 'none';
  cartCount.textContent = `${cart.length} producto${cart.length !== 1 ? 's' : ''}`;
  
  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const product = appState.products.find(p => p.id === item.productId);
    const stockPercentage = Math.min((item.quantity / product.quantity) * 100, 100);
    
    return `
      <tr class="fade-in-up" style="animation-delay: ${index * 0.05}s">
        <td>
          <div class="cart-product-info">
            <strong>${item.name}</strong>
            ${product.size ? `<br><small>Talla: ${product.size}</small>` : ''}
            ${product.color ? `<br><small>Color: ${appState.colors.find(c => c.hex === product.color)?.name || ''}</small>` : ''}
          </div>
        </td>
        <td>
          <div class="quantity-control">
            <button class="quantity-btn decrease-qty" data-index="${index}">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn increase-qty" data-index="${index}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="stock-bar">
            <div class="stock-fill" style="width: ${stockPercentage}%"></div>
          </div>
        </td>
        <td class="price-cell">${formatCurrency(item.price)}</td>
        <td class="price-cell">${formatCurrency(item.subtotal)}</td>
        <td>
          <button class="remove-item" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
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
  const item = cart[index];
  cart.splice(index, 1);
  updateCartDisplay();
  showNotification(`${item.name} eliminado del carrito`, 'info');
}

function setupPaymentListeners() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const mixedPaymentSection = document.getElementById('mixedPaymentSection');
  const cashPaymentSection = document.getElementById('cashPaymentSection');
  const cashReceivedInput = document.getElementById('cashReceived');
  const completeSaleBtn = document.getElementById('completeSale');
  
  if (paymentMethods) {
    paymentMethods.forEach(method => {
      method.addEventListener('change', (e) => {
        const value = e.target.value;
        
        if (mixedPaymentSection) {
          mixedPaymentSection.style.display = value === 'mixed' ? 'block' : 'none';
        }
        
        if (cashPaymentSection) {
          cashPaymentSection.style.display = value === 'cash' ? 'block' : 'none';
        }
        
        updatePaymentSummary();
      });
    });
  }
  
  if (cashReceivedInput) {
    cashReceivedInput.addEventListener('input', () => {
      updatePaymentSummary();
    });
  }
  
  if (completeSaleBtn) {
    completeSaleBtn.addEventListener('click', completeSale);
  }
  
  // Mixed payment inputs
  const mixedInputs = ['cashAmount', 'transferAmount', 'cardAmount'];
  mixedInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', () => {
        updateMixedPayment();
      });
    }
  });
}

function updatePaymentSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const igvPercentage = appState.settings.igvPercentage || 18;
  const igv = subtotal * (igvPercentage / 100);
  
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
  let cardFee = 0;
  
  if (paymentMethod === 'card') {
    const cardFeePercentage = appState.settings.cardFeePercentage || 5;
    cardFee = subtotal * (cardFeePercentage / 100);
  } else if (paymentMethod === 'mixed') {
    cardFee = updateMixedPayment();
  }
  
  const total = subtotal + igv + cardFee;
  
  // Update DOM elements
  const subtotalAmount = document.getElementById('subtotalAmount');
  const igvAmount = document.getElementById('igvAmount');
  const totalAmount = document.getElementById('totalAmount');
  const cardFeeRow = document.getElementById('cardFeeRow');
  const cardFeeAmount = document.getElementById('cardFeeAmount');
  
  if (subtotalAmount) subtotalAmount.textContent = formatCurrency(subtotal);
  if (igvAmount) igvAmount.textContent = formatCurrency(igv);
  if (totalAmount) totalAmount.textContent = formatCurrency(total);
  
  if (cardFeeRow && cardFeeAmount) {
    if (cardFee > 0) {
      cardFeeRow.style.display = 'flex';
      cardFeeAmount.textContent = formatCurrency(cardFee);
    } else {
      cardFeeRow.style.display = 'none';
    }
  }
  
  // Update change amount for cash payment
  if (paymentMethod === 'cash') {
    const cashReceived = parseFloat(document.getElementById('cashReceived')?.value) || 0;
    const changeAmount = document.getElementById('changeAmount');
    if (changeAmount) {
      const change = cashReceived - total;
      changeAmount.textContent = formatCurrency(Math.max(change, 0));
      changeAmount.style.color = change < 0 ? '#f44336' : '#4CAF50';
    }
  }
}

function updateMixedPayment() {
  const cashAmount = parseFloat(document.getElementById('cashAmount')?.value) || 0;
  const transferAmount = parseFloat(document.getElementById('transferAmount')?.value) || 0;
  const cardAmount = parseFloat(document.getElementById('cardAmount')?.value) || 0;
  
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalEntered = cashAmount + transferAmount + cardAmount;
  
  // If card amount is entered, calculate fee
  let cardFee = 0;
  if (cardAmount > 0) {
    const cardFeePercentage = appState.settings.cardFeePercentage || 5;
    cardFee = cardAmount * (cardFeePercentage / 100);
  }
  
  // Update total to match entered amounts
  const totalNeeded = subtotal + (subtotal * (appState.settings.igvPercentage || 18) / 100) + cardFee;
  
  // Show warning if amounts don't match
  if (Math.abs(totalEntered - totalNeeded) > 0.01) {
    document.getElementById('totalAmount').style.color = '#ff9800';
  } else {
    document.getElementById('totalAmount').style.color = '';
  }
  
  return cardFee;
}

function showClientHistory(clientName) {
  const clientSales = appState.sales.filter(sale => 
    sale.clientName.toLowerCase().includes(clientName.toLowerCase())
  ).slice(0, 10); // Mostrar últimas 10 compras
  
  const modal = document.getElementById('clientHistoryModal');
  const content = document.getElementById('clientHistoryContent');
  
  if (!modal || !content) return;
  
  if (clientSales.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-clock"></i>
        <p>No se encontró historial para "${clientName}"</p>
        <small>Este cliente no tiene compras registradas</small>
      </div>
    `;
  } else {
    const totalSpent = clientSales.reduce((sum, sale) => sum + sale.total, 0);
    const lastPurchase = new Date(clientSales[0].date).toLocaleDateString('es-PE');
    
    content.innerHTML = `
      <div class="client-summary">
        <h4>Resumen del Cliente</h4>
        <p><strong>Total gastado:</strong> ${formatCurrency(totalSpent)}</p>
        <p><strong>Compras realizadas:</strong> ${clientSales.length}</p>
        <p><strong>Última compra:</strong> ${lastPurchase}</p>
      </div>
      
      <div class="client-purchases">
        <h5>Últimas Compras</h5>
        <div class="purchase-list">
          ${clientSales.map(sale => `
            <div class="purchase-item">
              <div class="purchase-info">
                <span class="purchase-date">${formatDate(sale.date)}</span>
                <span class="purchase-items">${sale.items.length} producto${sale.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="purchase-amount">${formatCurrency(sale.total)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  modal.classList.add('active');
  
  // Close button
  document.getElementById('closeClientHistory')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

function setupCalculator() {
  const calcDisplay = document.getElementById('calcDisplay');
  const calcButtons = document.querySelectorAll('.calc-btn');
  const calcClear = document.getElementById('calcClear');
  const calcEquals = document.getElementById('calcEquals');
  const applyToCash = document.getElementById('applyToCash');
  const applyToPrice = document.getElementById('applyToPrice');
  
  let currentInput = '0';
  let previousInput = '';
  let operator = '';
  let resetScreen = false;
  
  if (!calcDisplay) return;
  
  function updateDisplay() {
    calcDisplay.textContent = currentInput;
  }
  
  function inputNumber(number) {
    if (resetScreen) {
      currentInput = '';
      resetScreen = false;
    }
    
    if (currentInput === '0' || currentInput === 'Error') {
      currentInput = number;
    } else {
      currentInput += number;
    }
    updateDisplay();
  }
  
  function inputDecimal() {
    if (resetScreen) {
      currentInput = '0';
      resetScreen = false;
    }
    
    if (!currentInput.includes('.')) {
      currentInput += '.';
      updateDisplay();
    }
  }
  
  function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);
    
    if (operator && resetScreen) {
      operator = nextOperator;
      return;
    }
    
    if (previousInput === '') {
      previousInput = inputValue;
    } else if (operator) {
      const result = calculate(previousInput, inputValue, operator);
      
      if (result === 'Error') {
        currentInput = 'Error';
        previousInput = '';
        operator = '';
      } else {
        currentInput = String(result);
        previousInput = result;
      }
    }
    
    resetScreen = true;
    operator = nextOperator;
  }
  
  function calculate(first, second, operator) {
    switch(operator) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': 
        return second === 0 ? 'Error' : first / second;
      default: return second;
    }
  }
  
  function resetCalculator() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    resetScreen = false;
    updateDisplay();
  }
  
  // Button listeners
  calcButtons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;
      
      if (value === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(value)) {
        handleOperator(value);
      } else {
        inputNumber(value);
      }
    });
  });
  
  if (calcClear) {
    calcClear.addEventListener('click', resetCalculator);
  }
  
  if (calcEquals) {
    calcEquals.addEventListener('click', () => {
      if (operator && previousInput !== '') {
        const inputValue = parseFloat(currentInput);
        const result = calculate(previousInput, inputValue, operator);
        
        if (result === 'Error') {
          currentInput = 'Error';
        } else {
          currentInput = String(result);
        }
        
        previousInput = '';
        operator = '';
        resetScreen = true;
        updateDisplay();
      }
    });
  }
  
  // Apply calculator results
  if (applyToCash) {
    applyToCash.addEventListener('click', () => {
      const value = parseFloat(currentInput);
      if (!isNaN(value) && value > 0) {
        document.getElementById('cashReceived').value = value.toFixed(2);
        updatePaymentSummary();
        showNotification('Monto aplicado a efectivo recibido', 'success');
      }
    });
  }
  
  if (applyToPrice) {
    applyToPrice.addEventListener('click', () => {
      showNotification('Función en desarrollo: aplicar a precio de producto', 'info');
    });
  }
}

function loadRecentSales() {
  const container = document.getElementById('recentSales');
  if (!container) return;
  
  const recentSales = appState.sales.slice(-5).reverse(); // Últimas 5 ventas
  
  if (recentSales.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-history"></i>
        <p>No hay ventas recientes</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recentSales.map(sale => `
    <div class="recent-sale-item">
      <div class="sale-info">
        <span class="sale-client">${sale.clientName || 'Cliente general'}</span>
        <span class="sale-time">${getRelativeTime(sale.date)}</span>
      </div>
      <div class="sale-amount">${formatCurrency(sale.total)}</div>
    </div>
  `).join('');
}

function completeSale() {
  if (cart.length === 0) {
    showNotification('El carrito está vacío', 'warning');
    return;
  }
  
  const clientName = document.getElementById('clientName')?.value.trim() || 'Cliente general';
  const clientPhone = document.getElementById('clientPhone')?.value.trim() || '';
  const saleNotes = document.getElementById('saleNotes')?.value.trim() || '';
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
  
  // Validate cash payment
  if (paymentMethod === 'cash') {
    const cashReceived = parseFloat(document.getElementById('cashReceived')?.value) || 0;
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const igv = subtotal * ((appState.settings.igvPercentage || 18) / 100);
    const total = subtotal + igv;
    
    if (cashReceived < total) {
      showNotification('El efectivo recibido es menor al total', 'error');
      return;
    }
  }
  
  // Validate mixed payment
  if (paymentMethod === 'mixed') {
    const cashAmount = parseFloat(document.getElementById('cashAmount')?.value) || 0;
    const transferAmount = parseFloat(document.getElementById('transferAmount')?.value) || 0;
    const cardAmount = parseFloat(document.getElementById('cardAmount')?.value) || 0;
    
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const igv = subtotal * ((appState.settings.igvPercentage || 18) / 100);
    const cardFee = cardAmount * ((appState.settings.cardFeePercentage || 5) / 100);
    const total = subtotal + igv + cardFee;
    const totalEntered = cashAmount + transferAmount + cardAmount;
    
    if (Math.abs(totalEntered - total) > 0.01) {
      showNotification('Los montos ingresados no coinciden con el total', 'error');
      return;
    }
  }
  
  // Calculate sale totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const igvPercentage = appState.settings.igvPercentage || 18;
  const igv = subtotal * (igvPercentage / 100);
  
  let cardFee = 0;
  if (paymentMethod === 'card') {
    const cardFeePercentage = appState.settings.cardFeePercentage || 5;
    cardFee = subtotal * (cardFeePercentage / 100);
  } else if (paymentMethod === 'mixed') {
    const cardAmount = parseFloat(document.getElementById('cardAmount')?.value) || 0;
    const cardFeePercentage = appState.settings.cardFeePercentage || 5;
    cardFee = cardAmount * (cardFeePercentage / 100);
  }
  
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
    saleNotes,
    items: saleItems,
    paymentMethod,
    subtotal,
    igv,
    cardFee,
    total,
    status: 'completed'
  };
  
  // Update stock
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
  
  // Save data
  appState.sales.push(newSale);
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  saveToStorage(STORAGE_KEYS.SALES, appState.sales);
  
  // Add to client history if new client
  if (clientName !== 'Cliente general') {
    const existingClient = appState.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    if (!existingClient) {
      appState.clients.push({
        id: generateId('client_'),
        name: clientName,
        phone: clientPhone,
        firstPurchase: new Date().toISOString(),
        lastPurchase: new Date().toISOString(),
        totalSpent: total,
        purchaseCount: 1
      });
      saveToStorage(STORAGE_KEYS.CLIENTS, appState.clients);
    } else {
      existingClient.lastPurchase = new Date().toISOString();
      existingClient.totalSpent += total;
      existingClient.purchaseCount += 1;
      saveToStorage(STORAGE_KEYS.CLIENTS, appState.clients);
    }
  }
  
  const saleTotalFormatted = formatCurrency(total);
  showNotification(`Venta completada por ${saleTotalFormatted}`, 'success');
  addActivity('sale', `Venta registrada por ${saleTotalFormatted} para ${clientName}`);
  
  // Show ticket
  showTicket(newSale);
  
  // Reset cart and form
  cart = [];
  updateCartDisplay();
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('saleNotes').value = '';
  document.getElementById('cashReceived').value = '';
  document.getElementById('cashAmount').value = '';
  document.getElementById('transferAmount').value = '';
  document.getElementById('cardAmount').value = '';
  document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
  document.getElementById('mixedPaymentSection').style.display = 'none';
  document.getElementById('cashPaymentSection').style.display = 'block';
  
  // Reload products (stock updated)
  loadProductsForSale();
}

function showTicket(sale) {
  const modal = document.getElementById('ticketModal');
  const ticketContent = document.getElementById('ticketContent');
  
  if (!modal || !ticketContent) return;
  
  // Format items for ticket
  const itemsHtml = sale.items.map(item => `
    <tr>
      <td>${item.quantity}</td>
      <td>${item.name}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');
  
  ticketContent.innerHTML = `
    <div class="ticket-header">
      <h2>Jessica Boutique</h2>
      <p>Tienda de Ropa Elegante</p>
      <p>Ticket de Venta</p>
    </div>
    
    <div class="ticket-info">
      <p><strong>N° Venta:</strong> <span id="ticketNumber">${sale.id.slice(-6)}</span></p>
      <p><strong>Fecha:</strong> <span id="ticketDate">${formatDate(sale.date)}</span></p>
      <p><strong>Cliente:</strong> <span id="ticketClient">${sale.clientName}</span></p>
      ${sale.clientPhone ? `<p><strong>Teléfono:</strong> ${sale.clientPhone}</p>` : ''}
    </div>
    
    <div class="ticket-items">
      <table>
        <thead>
          <tr>
            <th>Cant</th>
            <th>Producto</th>
            <th>P.U.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>
    
    <div class="ticket-totals">
      <p><strong>Subtotal:</strong> <span id="ticketSubtotal">${formatCurrency(sale.subtotal)}</span></p>
      <p><strong>IGV (${appState.settings.igvPercentage || 18}%):</strong> <span id="ticketIGV">${formatCurrency(sale.igv)}</span></p>
      ${sale.cardFee > 0 ? `<p><strong>Recargo tarjeta:</strong> <span>${formatCurrency(sale.cardFee)}</span></p>` : ''}
      <p><strong>Total:</strong> <span id="ticketTotal">${formatCurrency(sale.total)}</span></p>
      <p><strong>Método de pago:</strong> <span id="ticketPayment">${getPaymentMethodName(sale.paymentMethod)}</span></p>
    </div>
    
    <div class="ticket-footer">
      <p>¡Gracias por su compra!</p>
      <p>Vuelva pronto a Jessica Boutique</p>
    </div>
  `;
  
  modal.classList.add('active');
  
  // Print button
  document.getElementById('printTicket')?.addEventListener('click', () => {
    const printContent = ticketContent.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  });
  
  // Close button
  document.getElementById('closeTicketBtn')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  document.getElementById('closeTicket')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

function getPaymentMethodName(method) {
  const methods = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'card': 'Tarjeta',
    'mixed': 'Mixto'
  };
  return methods[method] || method;
}