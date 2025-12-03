// Configuración - Jessica Boutique

function setupSettingsSection() {
  setupSettingsTabs();
  loadCategories();
  loadSizes();
  loadColors();
  loadUsers();
  setupDataManagement();
  setupAppearanceSettings();
  setupSystemSettings();
}

function setupSettingsTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const tabId = button.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      document.getElementById(`${tabId}-tab`)?.classList.add('active');
    });
  });
}

function loadCategories() {
  const container = document.getElementById('categoriesList');
  const addBtn = document.getElementById('addCategory');
  const input = document.getElementById('newCategory');
  
  if (!container || !addBtn || !input) return;
  
  function renderCategories() {
    if (appState.categories.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay categorías registradas</p>';
      return;
    }
    
    container.innerHTML = appState.categories.map(category => `
      <div class="category-item fade-in-up">
        <span>${category}</span>
        <button class="delete-btn delete-category" data-category="${category}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    
    attachCategoryDeletion();
  }
  
  addBtn.addEventListener('click', () => {
    const newCategory = input.value.trim();
    
    if (!newCategory) {
      showNotification('Ingrese un nombre para la categoría', 'warning');
      return;
    }
    
    if (appState.categories.includes(newCategory)) {
      showNotification('Esta categoría ya existe', 'warning');
      return;
    }
    
    appState.categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, appState.categories);
    renderCategories();
    input.value = '';
    showNotification('Categoría agregada correctamente', 'success');
    
    // Update category selects in other pages
    updateCategorySelects();
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
  
  renderCategories();
}

function attachCategoryDeletion() {
  document.querySelectorAll('.delete-category').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.getAttribute('data-category');
      deleteCategory(category);
    });
  });
}

function deleteCategory(category) {
  showModal(
    'Eliminar Categoría',
    `¿Está segura de eliminar la categoría "${category}"? Los productos con esta categoría quedarán sin categoría asignada.`,
    () => {
      const index = appState.categories.indexOf(category);
      if (index !== -1) {
        appState.categories.splice(index, 1);
        saveToStorage(STORAGE_KEYS.CATEGORIES, appState.categories);
        
        // Update products that use this category
        appState.products.forEach(product => {
          if (product.category === category) {
            product.category = '';
          }
        });
        saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
        
        showNotification('Categoría eliminada', 'success');
        loadCategories();
        updateCategorySelects();
      }
    }
  );
}

function loadSizes() {
  const container = document.getElementById('sizesList');
  const addBtn = document.getElementById('addSize');
  const input = document.getElementById('newSize');
  
  if (!container || !addBtn || !input) return;
  
  function renderSizes() {
    if (appState.sizes.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay tallas registradas</p>';
      return;
    }
    
    container.innerHTML = appState.sizes.map(size => `
      <div class="size-item fade-in-up">
        <span>${size}</span>
        <button class="delete-btn delete-size" data-size="${size}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    
    attachSizeDeletion();
  }
  
  addBtn.addEventListener('click', () => {
    let newSize = input.value.trim().toUpperCase();
    
    if (!newSize) {
      showNotification('Ingrese una talla', 'warning');
      return;
    }
    
    if (appState.sizes.includes(newSize)) {
      showNotification('Esta talla ya existe', 'warning');
      return;
    }
    
    appState.sizes.push(newSize);
    saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
    renderSizes();
    input.value = '';
    showNotification('Talla agregada correctamente', 'success');
    
    updateSizeSelects();
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
  
  renderSizes();
}

function attachSizeDeletion() {
  document.querySelectorAll('.delete-size').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const size = e.currentTarget.getAttribute('data-size');
      deleteSize(size);
    });
  });
}

function deleteSize(size) {
  showModal(
    'Eliminar Talla',
    `¿Está segura de eliminar la talla "${size}"? Los productos con esta talla quedarán sin talla asignada.`,
    () => {
      const index = appState.sizes.indexOf(size);
      if (index !== -1) {
        appState.sizes.splice(index, 1);
        saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
        
        // Update products that use this size
        appState.products.forEach(product => {
          if (product.size === size) {
            product.size = '';
          }
        });
        saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
        
        showNotification('Talla eliminada', 'success');
        loadSizes();
        updateSizeSelects();
      }
    }
  );
}

function loadColors() {
  const container = document.getElementById('colorsList');
  const addBtn = document.getElementById('addColor');
  const nameInput = document.getElementById('newColorName');
  const valueInput = document.getElementById('newColorValue');
  
  if (!container || !addBtn || !nameInput || !valueInput) return;
  
  function renderColors() {
    if (appState.colors.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay colores registrados</p>';
      return;
    }
    
    container.innerHTML = appState.colors.map(color => `
      <div class="color-item fade-in-up">
        <div class="color-display">
          <div class="color-sample" style="background-color: ${color.hex};"></div>
          <span>${color.name}</span>
        </div>
        <button class="delete-btn delete-color" data-color="${color.name}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    
    attachColorDeletion();
  }
  
  addBtn.addEventListener('click', () => {
    const newColorName = nameInput.value.trim();
    const newColorValue = valueInput.value;
    
    if (!newColorName) {
      showNotification('Ingrese un nombre para el color', 'warning');
      return;
    }
    
    if (appState.colors.some(c => c.name.toLowerCase() === newColorName.toLowerCase())) {
      showNotification('Este color ya existe', 'warning');
      return;
    }
    
    appState.colors.push({
      name: newColorName,
      hex: newColorValue
    });
    
    saveToStorage(STORAGE_KEYS.COLORS, appState.colors);
    renderColors();
    nameInput.value = '';
    valueInput.value = '#ff0000';
    showNotification('Color agregado correctamente', 'success');
    
    updateColorSelects();
  });
  
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
  
  renderColors();
}

function attachColorDeletion() {
  document.querySelectorAll('.delete-color').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const colorName = e.currentTarget.getAttribute('data-color');
      deleteColor(colorName);
    });
  });
}

function deleteColor(colorName) {
  showModal(
    'Eliminar Color',
    `¿Está segura de eliminar el color "${colorName}"? Los productos con este color quedarán sin color asignado.`,
    () => {
      const index = appState.colors.findIndex(c => c.name === colorName);
      if (index !== -1) {
        const colorHex = appState.colors[index].hex;
        appState.colors.splice(index, 1);
        saveToStorage(STORAGE_KEYS.COLORS, appState.colors);
        
        // Update products that use this color
        appState.products.forEach(product => {
          if (product.color === colorHex) {
            product.color = '';
          }
        });
        saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
        
        showNotification('Color eliminado', 'success');
        loadColors();
        updateColorSelects();
      }
    }
  );
}

function updateCategorySelects() {
  // This function would update all category selects in the application
  // Implementation depends on your specific needs
}

function updateSizeSelects() {
  // This function would update all size selects in the application
}

function updateColorSelects() {
  // This function would update all color selects in the application
}

function loadUsers() {
  const container = document.getElementById('usersList');
  const addBtn = document.getElementById('addUserBtn');
  
  if (!container || !addBtn) return;
  
  // For now, we'll show a static list
  // In a real app, you would load users from your data store
  
  addBtn.addEventListener('click', () => {
    showUserModal();
  });
  
  // Load users from storage if available
  const users = appState.clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.phone ? `${client.name.toLowerCase().replace(/\s+/g, '.')}@cliente.com` : 'sin-email@cliente.com',
    role: 'cliente'
  }));
  
  // Add admin user
  users.unshift({
    id: 'admin_1',
    name: 'Jessica',
    email: 'jessica@boutique.com',
    role: 'admin'
  });
  
  renderUsers(users);
}

function renderUsers(users) {
  const container = document.getElementById('usersList');
  if (!container) return;
  
  container.innerHTML = users.map(user => `
    <div class="user-item fade-in-up">
      <div class="user-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="user-info">
        <h4>${user.name}</h4>
        <p class="user-email">${user.email}</p>
        <span class="user-role ${user.role}">${getRoleName(user.role)}</span>
      </div>
      <div class="user-actions">
        <button class="btn-icon edit-user" data-id="${user.id}" title="Editar usuario">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete-user" data-id="${user.id}" title="Eliminar usuario">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  attachUserActions();
}

function getRoleName(role) {
  const roles = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'seller': 'Vendedor',
    'cliente': 'Cliente',
    'viewer': 'Solo lectura'
  };
  return roles[role] || role;
}

function attachUserActions() {
  document.querySelectorAll('.edit-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      showUserModal(userId);
    });
  });
  
  document.querySelectorAll('.delete-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      deleteUser(userId);
    });
  });
}

function showUserModal(userId = null) {
  const modal = document.getElementById('userModal');
  const title = document.getElementById('userModalTitle');
  const form = document.getElementById('userForm');
  
  if (!modal || !title || !form) return;
  
  if (userId) {
    title.textContent = 'Editar Usuario';
    // Load user data
  } else {
    title.textContent = 'Nuevo Usuario';
    form.reset();
  }
  
  modal.classList.add('active');
  
  // Close button
  document.getElementById('closeUserModal')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  document.getElementById('cancelUserForm')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userRole = document.getElementById('userRole').value;
    
    if (userId) {
      showNotification('Usuario actualizado correctamente', 'success');
    } else {
      showNotification('Usuario creado correctamente', 'success');
    }
    
    modal.classList.remove('active');
  });
}

function deleteUser(userId) {
  showModal(
    'Eliminar Usuario',
    '¿Está segura de eliminar este usuario? Esta acción no se puede deshacer.',
    () => {
      showNotification('Usuario eliminado', 'success');
    }
  );
}

function setupDataManagement() {
  setupExportData();
  setupImportData();
  setupResetData();
}

function setupExportData() {
  const exportBtn = document.getElementById('exportData');
  if (!exportBtn) return;
  
  exportBtn.addEventListener('click', () => {
    const data = {
      system: 'Jessica Boutique',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: {
        products: appState.products,
        sales: appState.sales,
        categories: appState.categories,
        sizes: appState.sizes,
        colors: appState.colors,
        clients: appState.clients,
        settings: appState.settings,
        activity: appState.activity
      }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_jessica_boutique_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Respaldo exportado correctamente', 'success');
    addActivity('system', 'Respaldo de datos exportado');
  });
}

function setupImportData() {
  const selectFileBtn = document.getElementById('selectImportFile');
  const importBtn = document.getElementById('importData');
  const fileNameSpan = document.getElementById('fileName');
  const fileInput = document.getElementById('importFile');
  
  if (!selectFileBtn || !importBtn || !fileNameSpan || !fileInput) return;
  
  let selectedFile = null;
  
  selectFileBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      fileNameSpan.textContent = file.name;
      importBtn.disabled = false;
    }
  });
  
  importBtn.addEventListener('click', () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        showModal(
          'Importar Datos',
          '¿Está segura de importar estos datos? Esto sobrescribirá todos los datos actuales. Haga un respaldo primero.',
          () => {
            if (data.system !== 'Jessica Boutique') {
              showNotification('El archivo no es compatible con Jessica Boutique', 'error');
              return;
            }
            
            // Import data
            appState.products = data.data.products || [];
            appState.sales = data.data.sales || [];
            appState.categories = data.data.categories || DEFAULT_CATEGORIES;
            appState.sizes = data.data.sizes || DEFAULT_SIZES;
            appState.colors = data.data.colors || DEFAULT_COLORS;
            appState.clients = data.data.clients || [];
            appState.settings = data.data.settings || {};
            appState.activity = data.data.activity || [];
            
            saveAppState();
            
            showNotification('Datos importados correctamente', 'success');
            addActivity('system', 'Datos importados desde archivo');
            
            // Reload page after 1 second
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        );
      } catch (error) {
        showNotification('Error al leer el archivo: formato inválido', 'error');
      }
    };
    reader.readAsText(selectedFile);
  });
}

function setupResetData() {
  const resetBtn = document.getElementById('resetData');
  if (!resetBtn) return;
  
  resetBtn.addEventListener('click', () => {
    showModal(
      'Restablecer Sistema',
      '¿Está completamente segura de restablecer todos los datos? Esta acción eliminará todos los productos, ventas, categorías, tallas, colores y configuraciones. NO SE PUEDE DESHACER.',
      () => {
        // Clear all data
        localStorage.clear();
        
        showNotification('Sistema restablecido correctamente', 'success');
        
        // Reload page after 1 second
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      'Restablecer Todo'
    );
  });
}

function setupAppearanceSettings() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const accentColor = document.getElementById('accentColor');
  const accentColorPreview = document.getElementById('accentColorPreview');
  const fontSizeOptions = document.querySelectorAll('input[name="fontSize"]');
  const sidebarStyle = document.getElementById('sidebarStyle');
  const animationsToggle = document.getElementById('animationsToggle');
  const saveBtn = document.getElementById('saveAppearance');
  
  if (!saveBtn) return;
  
  // Load current settings
  if (darkModeToggle) {
    darkModeToggle.checked = appState.settings.darkMode || true;
  }
  
  if (accentColor) {
    accentColor.value = appState.settings.accentColor || '#e75480';
    if (accentColorPreview) {
      accentColorPreview.style.backgroundColor = accentColor.value;
    }
  }
  
  if (fontSizeOptions) {
    fontSizeOptions.forEach(option => {
      option.checked = option.value === (appState.settings.fontSize || 'medium');
    });
  }
  
  if (sidebarStyle) {
    sidebarStyle.value = appState.settings.sidebarStyle || 'default';
  }
  
  if (animationsToggle) {
    animationsToggle.checked = appState.settings.animations !== false;
  }
  
  // Update color preview
  if (accentColor && accentColorPreview) {
    accentColor.addEventListener('input', () => {
      accentColorPreview.style.backgroundColor = accentColor.value;
    });
  }
  
  // Save settings
  saveBtn.addEventListener('click', () => {
    // Collect settings
    const settings = {
      darkMode: darkModeToggle?.checked || true,
      accentColor: accentColor?.value || '#e75480',
      fontSize: document.querySelector('input[name="fontSize"]:checked')?.value || 'medium',
      sidebarStyle: sidebarStyle?.value || 'default',
      animations: animationsToggle?.checked !== false
    };
    
    // Apply settings
    appState.settings = { ...appState.settings, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
    applySettings();
    
    showNotification('Configuración de apariencia guardada', 'success');
  });
}

function setupSystemSettings() {
  const igvPercentage = document.getElementById('igvPercentage');
  const cardFeePercentage = document.getElementById('cardFeePercentage');
  const autoUpdateStock = document.getElementById('autoUpdateStock');
  const lowStockAlert = document.getElementById('lowStockAlert');
  const alertThreshold = document.getElementById('alertThreshold');
  const dailyReportAlert = document.getElementById('dailyReportAlert');
  const sessionTimeout = document.getElementById('sessionTimeout');
  const timeoutMinutes = document.getElementById('timeoutMinutes');
  const backupAuto = document.getElementById('backupAuto');
  const saveBtn = document.getElementById('saveSystemSettings');
  
  if (!saveBtn) return;
  
  // Load current settings
  if (igvPercentage) {
    igvPercentage.value = appState.settings.igvPercentage || 18;
  }
  
  if (cardFeePercentage) {
    cardFeePercentage.value = appState.settings.cardFeePercentage || 5;
  }
  
  if (autoUpdateStock) {
    autoUpdateStock.checked = appState.settings.autoUpdateStock !== false;
  }
  
  if (lowStockAlert) {
    lowStockAlert.checked = appState.settings.lowStockAlert !== false;
  }
  
  if (alertThreshold) {
    alertThreshold.value = appState.settings.alertThreshold || 5;
  }
  
  if (dailyReportAlert) {
    dailyReportAlert.checked = appState.settings.dailyReportAlert !== false;
  }
  
  if (sessionTimeout) {
    sessionTimeout.checked = appState.settings.sessionTimeout !== false;
  }
  
  if (timeoutMinutes) {
    timeoutMinutes.value = appState.settings.timeoutMinutes || 30;
  }
  
  if (backupAuto) {
    backupAuto.checked = appState.settings.backupAuto !== false;
  }
  
  // Save settings
  saveBtn.addEventListener('click', () => {
    // Collect settings
    const settings = {
      igvPercentage: parseInt(igvPercentage?.value) || 18,
      cardFeePercentage: parseInt(cardFeePercentage?.value) || 5,
      autoUpdateStock: autoUpdateStock?.checked !== false,
      lowStockAlert: lowStockAlert?.checked !== false,
      alertThreshold: parseInt(alertThreshold?.value) || 5,
      dailyReportAlert: dailyReportAlert?.checked !== false,
      sessionTimeout: sessionTimeout?.checked !== false,
      timeoutMinutes: parseInt(timeoutMinutes?.value) || 30,
      backupAuto: backupAuto?.checked !== false
    };
    
    // Apply settings
    appState.settings = { ...appState.settings, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
    
    showNotification('Configuración del sistema guardada', 'success');
    addActivity('system', 'Configuración del sistema actualizada');
  });
  
  // Setup auto backup if enabled
  if (appState.settings.backupAuto) {
    setupAutoBackup();
  }
}

function setupAutoBackup() {
  // Check if backup is due (once per day)
  const lastBackup = localStorage.getItem('lastAutoBackup');
  const today = new Date().toISOString().split('T')[0];
  
  if (lastBackup !== today) {
    // Create backup
    const data = {
      system: 'Jessica Boutique',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: {
        products: appState.products,
        sales: appState.sales,
        categories: appState.categories,
        sizes: appState.sizes,
        colors: appState.colors,
        clients: appState.clients
      }
    };
    
    const dataStr = JSON.stringify(data);
    localStorage.setItem(`auto_backup_${today}`, dataStr);
    localStorage.setItem('lastAutoBackup', today);
    
    // Keep only last 7 backups
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('auto_backup_'));
    if (backupKeys.length > 7) {
      backupKeys.sort().slice(0, -7).forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    addActivity('system', 'Respaldo automático creado');
  }
}