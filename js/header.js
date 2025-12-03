// Header y Navegación - Jessica Boutique

function setupHeader() {
  setupNotifications();
  setupUserMenu();
  setupSearch();
  updateHeaderStats();
  setupMobileMenu();
}

function setupNotifications() {
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  
  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('show');
      
      // Marcar notificaciones como leídas
      markNotificationsAsRead();
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', () => {
      notificationDropdown.classList.remove('show');
    });
    
    // Cargar notificaciones
    loadNotifications();
  }
}

function loadNotifications() {
  const notificationList = document.getElementById('notificationList');
  if (!notificationList) return;
  
  // Notificaciones recientes (últimas 5)
  const recentActivities = appState.activity.slice(0, 5);
  
  if (recentActivities.length === 0) {
    notificationList.innerHTML = `
      <div class="notification-item empty">
        <i class="fas fa-bell-slash"></i>
        <p>No hay notificaciones</p>
      </div>
    `;
    updateNotificationBadge(0);
    return;
  }
  
  notificationList.innerHTML = recentActivities.map((activity, index) => {
    let icon = 'fas fa-info-circle';
    let iconColor = 'var(--info)';
    
    if (activity.type === 'product') {
      icon = 'fas fa-box';
      iconColor = 'var(--secondary)';
    } else if (activity.type === 'sale') {
      icon = 'fas fa-cash-register';
      iconColor = 'var(--primary)';
    } else if (activity.type === 'warning') {
      icon = 'fas fa-exclamation-triangle';
      iconColor = 'var(--warning)';
    }
    
    return `
      <div class="notification-item ${index < 2 ? 'unread' : ''}" data-id="${activity.time}">
        <div class="notification-icon" style="color: ${iconColor};">
          <i class="${icon}"></i>
        </div>
        <div class="notification-content">
          <p class="notification-text">${activity.message}</p>
          <span class="notification-time">${getRelativeTime(activity.time)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Contador de notificaciones no leídas
  const unreadCount = Math.min(2, recentActivities.length); // Simular 2 no leídas
  updateNotificationBadge(unreadCount);
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;
  
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function markNotificationsAsRead() {
  // En una implementación real, marcaríamos notificaciones como leídas
  updateNotificationBadge(0);
}

function setupUserMenu() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
    
    // Actualizar información del usuario
    updateUserInfo();
  }
  
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showModal(
        'Cerrar Sesión',
        '¿Está segura de cerrar la sesión?',
        () => {
          // En una implementación real, aquí iría la lógica de logout
          showNotification('Sesión cerrada correctamente', 'success');
          setTimeout(() => {
            // Redirigir a login (simulado)
            window.location.href = 'index.html';
          }, 1000);
        }
      );
    });
  }
  
  // Profile link
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      showNotification('Perfil de usuario (en desarrollo)', 'info');
    });
  }
}

function updateUserInfo() {
  const userName = document.getElementById('headerUserName');
  const userRole = document.getElementById('headerUserRole');
  const userAvatar = document.getElementById('headerUserAvatar');
  
  if (userName) userName.textContent = 'Jessica';
  if (userRole) userRole.textContent = 'Dueña';
  if (userAvatar) {
    userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
  }
}

function setupSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchBox = document.getElementById('searchBox');
  const searchInput = document.getElementById('searchInput');
  const closeSearch = document.getElementById('closeSearch');
  
  if (searchBtn && searchBox) {
    searchBtn.addEventListener('click', () => {
      searchBox.classList.add('active');
      if (searchInput) searchInput.focus();
    });
  }
  
  if (closeSearch) {
    closeSearch.addEventListener('click', () => {
      searchBox.classList.remove('active');
      if (searchInput) searchInput.value = '';
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value.trim());
      }
    });
    
    // Search icon in input
    const searchIcon = searchInput.parentElement.querySelector('.fa-search');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
      });
    }
  }
  
  // Cerrar búsqueda al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (searchBox && !searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
      searchBox.classList.remove('active');
    }
  });
}

function performSearch(query) {
  if (!query) return;
  
  // Buscar en productos, ventas y clientes
  const results = {
    products: appState.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    ),
    sales: appState.sales.filter(s =>
      s.clientName.toLowerCase().includes(query.toLowerCase()) ||
      s.items.some(item => item.name.toLowerCase().includes(query.toLowerCase()))
    ),
    clients: appState.clients.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone && c.phone.includes(query))
    )
  };
  
  showSearchResults(results, query);
}

function showSearchResults(results, query) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;
  
  const totalResults = results.products.length + results.sales.length + results.clients.length;
  
  if (totalResults === 0) {
    searchResults.innerHTML = `
      <div class="search-result-item empty">
        <i class="fas fa-search"></i>
        <p>No se encontraron resultados para "${query}"</p>
      </div>
    `;
  } else {
    searchResults.innerHTML = '';
    
    // Productos
    if (results.products.length > 0) {
      searchResults.innerHTML += `
        <div class="search-result-section">
          <h4><i class="fas fa-box"></i> Productos (${results.products.length})</h4>
          ${results.products.slice(0, 3).map(product => `
            <div class="search-result-item" data-type="product" data-id="${product.id}">
              <div class="result-icon">
                <i class="fas fa-tshirt"></i>
              </div>
              <div class="result-content">
                <p class="result-title">${product.name}</p>
                <p class="result-subtitle">${product.category} • ${formatCurrency(product.price)} • Stock: ${product.quantity}</p>
              </div>
            </div>
          `).join('')}
          ${results.products.length > 3 ? `
            <div class="search-result-more">
              <a href="inventario.html?search=${encodeURIComponent(query)}">
                Ver ${results.products.length - 3} más...
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Ventas
    if (results.sales.length > 0) {
      searchResults.innerHTML += `
        <div class="search-result-section">
          <h4><i class="fas fa-cash-register"></i> Ventas (${results.sales.length})</h4>
          ${results.sales.slice(0, 2).map(sale => `
            <div class="search-result-item" data-type="sale" data-id="${sale.id}">
              <div class="result-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <div class="result-content">
                <p class="result-title">${sale.clientName || 'Cliente general'}</p>
                <p class="result-subtitle">${formatDate(sale.date)} • ${formatCurrency(sale.total)}</p>
              </div>
            </div>
          `).join('')}
          ${results.sales.length > 2 ? `
            <div class="search-result-more">
              <a href="reportes.html?search=${encodeURIComponent(query)}">
                Ver ${results.sales.length - 2} más...
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Clientes
    if (results.clients.length > 0) {
      searchResults.innerHTML += `
        <div class="search-result-section">
          <h4><i class="fas fa-users"></i> Clientes (${results.clients.length})</h4>
          ${results.clients.slice(0, 2).map(client => `
            <div class="search-result-item" data-type="client" data-id="${client.id}">
              <div class="result-icon">
                <i class="fas fa-user"></i>
              </div>
              <div class="result-content">
                <p class="result-title">${client.name}</p>
                <p class="result-subtitle">${client.phone || 'Sin teléfono'} • ${client.purchaseCount || 0} compras</p>
              </div>
            </div>
          `).join('')}
          ${results.clients.length > 2 ? `
            <div class="search-result-more">
              <a href="reportes.html?tab=clients&search=${encodeURIComponent(query)}">
                Ver ${results.clients.length - 2} más...
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Ver todos los resultados
    if (totalResults > 5) {
      searchResults.innerHTML += `
        <div class="search-result-footer">
          <a href="reportes.html?search=${encodeURIComponent(query)}" class="btn btn-outline">
            <i class="fas fa-search"></i> Ver todos los resultados (${totalResults})
          </a>
        </div>
      `;
    }
    
    // Agregar listeners a los resultados
    document.querySelectorAll('.search-result-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        const id = item.dataset.id;
        
        switch(type) {
          case 'product':
            window.location.href = `inventario.html?highlight=${id}`;
            break;
          case 'sale':
            showSaleDetails(id);
            break;
          case 'client':
            showClientDetails(id);
            break;
        }
        
        // Cerrar búsqueda
        document.getElementById('searchBox')?.classList.remove('active');
      });
    });
  }
  
  searchResults.style.display = 'block';
}

function showSaleDetails(saleId) {
  const sale = appState.sales.find(s => s.id === saleId);
  if (!sale) return;
  
  showModal(
    `Detalles de Venta #${sale.id.slice(-6)}`,
    `
      <div class="sale-details-modal">
        <div class="sale-info">
          <p><strong>Cliente:</strong> ${sale.clientName || 'Cliente general'}</p>
          <p><strong>Fecha:</strong> ${formatDate(sale.date)}</p>
          <p><strong>Método de pago:</strong> ${getPaymentMethodName(sale.paymentMethod)}</p>
        </div>
        
        <div class="sale-items">
          <h4>Productos:</h4>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="sale-totals">
          <p><strong>Subtotal:</strong> ${formatCurrency(sale.subtotal)}</p>
          <p><strong>IGV:</strong> ${formatCurrency(sale.igv)}</p>
          ${sale.cardFee > 0 ? `<p><strong>Recargo tarjeta:</strong> ${formatCurrency(sale.cardFee)}</p>` : ''}
          <p><strong>Total:</strong> ${formatCurrency(sale.total)}</p>
        </div>
      </div>
    `,
    null,
    'Cerrar'
  );
}

function showClientDetails(clientId) {
  const client = appState.clients.find(c => c.id === clientId);
  if (!client) return;
  
  const clientSales = appState.sales.filter(s => 
    s.clientName.toLowerCase() === client.name.toLowerCase()
  );
  
  const totalSpent = clientSales.reduce((sum, sale) => sum + sale.total, 0);
  const lastPurchase = clientSales.length > 0 ? 
    formatDate(clientSales[0].date) : 'Ninguna';
  
  showModal(
    `Cliente: ${client.name}`,
    `
      <div class="client-details-modal">
        <div class="client-info">
          <p><strong>Teléfono:</strong> ${client.phone || 'No registrado'}</p>
          <p><strong>Primera compra:</strong> ${formatDate(client.firstPurchase)}</p>
          <p><strong>Última compra:</strong> ${lastPurchase}</p>
          <p><strong>Total de compras:</strong> ${client.purchaseCount || 0}</p>
          <p><strong>Total gastado:</strong> ${formatCurrency(totalSpent)}</p>
        </div>
        
        ${clientSales.length > 0 ? `
          <div class="client-recent-sales">
            <h4>Últimas compras:</h4>
            <div class="sales-list">
              ${clientSales.slice(0, 3).map(sale => `
                <div class="sale-item">
                  <span>${formatDate(sale.date)}</span>
                  <span>${formatCurrency(sale.total)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `,
    null,
    'Cerrar'
  );
}

function updateHeaderStats() {
  // Actualizar estadísticas en el header (si existen)
  const today = new Date().toISOString().split('T')[0];
  const todaySales = appState.sales
    .filter(sale => sale.date.startsWith(today))
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const lowStock = appState.products.filter(p => p.quantity <= (p.minStock || 5)).length;
  
  // Actualizar elementos si existen
  const todaySalesEl = document.getElementById('headerTodaySales');
  const lowStockEl = document.getElementById('headerLowStock');
  
  if (todaySalesEl) todaySalesEl.textContent = formatCurrency(todaySales);
  if (lowStockEl) lowStockEl.textContent = lowStock;
  
  // Actualizar cada minuto
  setInterval(updateHeaderStats, 60000);
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('active');
    });
  }
  
  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  }
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
      mobileMenu.classList.remove('active');
    }
  });
  
  // Navegación móvil
  setupMobileNavigation();
}

function setupMobileNavigation() {
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Cerrar menú móvil
      document.getElementById('mobileMenu')?.classList.remove('active');
    });
  });
}

// Añadir CSS para el header (se puede incluir en un archivo CSS separado o en styles.css)
function addHeaderStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Header Styles for Jessica Boutique */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .header-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: white;
    }
    
    .header-logo h1 {
      font-size: 1.5rem;
      font-weight: 700;
      font-family: var(--font-heading);
      margin: 0;
    }
    
    .header-stats {
      display: flex;
      gap: 1.5rem;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .stat-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .stat-icon {
      font-size: 1.25rem;
      color: var(--secondary-light);
    }
    
    .stat-content h4 {
      font-size: 0.75rem;
      opacity: 0.8;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-content p {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      font-family: var(--font-heading);
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
    }
    
    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    
    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: var(--danger);
      color: white;
      font-size: 0.7rem;
      min-width: 1.25rem;
      height: 1.25rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    
    /* Dropdowns */
    .dropdown {
      position: relative;
    }
    
    .dropdown-content {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-height: 400px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
      border: 1px solid var(--gray-200);
    }
    
    .dropdown-content.show {
      display: block;
      animation: fadeInUp 0.3s ease;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dropdown-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-200);
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    
    .dropdown-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    
    /* Notificaciones */
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--gray-200);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .notification-item:hover {
      background-color: var(--gray-100);
    }
    
    .notification-item.unread {
      background-color: rgba(231, 84, 128, 0.05);
    }
    
    .notification-item.empty {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 1rem;
    }
    
    .notification-item.empty i {
      font-size: 2.5rem;
      color: var(--gray-400);
      margin-bottom: 1rem;
    }
    
    .notification-icon {
      font-size: 1.25rem;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }
    
    .notification-content {
      flex-grow: 1;
    }
    
    .notification-text {
      margin: 0 0 0.5rem 0;
      color: var(--boutique-charcoal);
      font-size: 0.95rem;
      line-height: 1.4;
    }
    
    .notification-time {
      font-size: 0.8rem;
      color: var(--gray-600);
    }
    
    /* User Menu */
    .user-info-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .user-avatar-large {
      font-size: 3rem;
      color: var(--primary);
    }
    
    .user-details-header h4 {
      margin: 0 0 0.25rem 0;
      color: var(--boutique-charcoal);
      font-size: 1.1rem;
    }
    
    .user-details-header p {
      margin: 0;
      color: var(--gray-600);
      font-size: 0.9rem;
    }
    
    .user-menu-actions {
      padding: 0.5rem 0;
    }
    
    .user-menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      color: var(--gray-700);
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .user-menu-item:hover {
      background-color: var(--gray-100);
      color: var(--primary);
    }
    
    .user-menu-item i {
      width: 1.25rem;
      text-align: center;
    }
    
    /* Search */
    .search-box {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      display: none;
      z-index: 1000;
    }
    
    .search-box.active {
      display: block;
      animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .search-input-container {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .search-input-container i {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-500);
    }
    
    .search-input-container input {
      width: 100%;
      padding: 1rem 1.25rem 1rem 3.5rem;
      border: 2px solid var(--gray-300);
      border-radius: 8px;
      font-size: 1rem;
    }
    
    .search-input-container input:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .close-search {
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--gray-500);
      font-size: 1.25rem;
      cursor: pointer;
    }
    
    .search-results {
      max-width: 600px;
      margin: 1rem auto 0;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      max-height: 500px;
      overflow-y: auto;
      display: none;
    }
    
    .search-result-section {
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .search-result-section:last-child {
      border-bottom: none;
    }
    
    .search-result-section h4 {
      margin: 0 0 1rem 0;
      color: var(--primary);
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .search-result-item:hover {
      background-color: var(--gray-100);
    }
    
    .result-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
    }
    
    .result-content {
      flex-grow: 1;
    }
    
    .result-title {
      margin: 0 0 0.25rem 0;
      color: var(--boutique-charcoal);
      font-weight: 600;
    }
    
    .result-subtitle {
      margin: 0;
      color: var(--gray-600);
      font-size: 0.85rem;
    }
    
    .search-result-more {
      margin-top: 0.75rem;
      text-align: center;
    }
    
    .search-result-more a {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .search-result-footer {
      padding: 1.5rem;
      text-align: center;
      border-top: 1px solid var(--gray-200);
    }
    
    /* Mobile Menu */
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .mobile-menu {
      position: fixed;
      top: 0;
      left: -300px;
      width: 300px;
      height: 100vh;
      background: white;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
      transition: left 0.3s ease;
      z-index: 1001;
      overflow-y: auto;
    }
    
    .mobile-menu.active {
      left: 0;
    }
    
    .mobile-menu-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .mobile-menu-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .mobile-nav {
      padding: 1.5rem;
    }
    
    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      color: var(--boutique-charcoal);
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .mobile-nav-link:hover {
      background-color: var(--gray-100);
      color: var(--primary);
    }
    
    .mobile-nav-link.active {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
    }
    
    .mobile-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }
    
    .mobile-overlay.active {
      display: block;
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .header-stats {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      .header {
        padding: 1rem;
      }
      
      .header-logo h1 {
        font-size: 1.25rem;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .header-right .action-btn:nth-child(2),
      .header-right .action-btn:nth-child(3) {
        display: none;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Inicializar el header cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  addHeaderStyles();
  setupHeader();
});