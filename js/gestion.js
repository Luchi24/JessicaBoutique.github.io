// Configuración Functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('settings')) {
    setupSettingsSection();
  }
});

function setupSettingsSection() {
  setupSettingsTabs();
  loadCategories();
  loadSizes();
  loadColors();
  setupDataManagement();
  setupAppearanceSettings();
}

function setupSettingsTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

function loadCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  
  renderCategories(container);
  
  const addCategoryBtn = document.getElementById('addCategory');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      const newCategoryInput = document.getElementById('newCategory');
      const newCategory = newCategoryInput?.value.trim() || '';
      
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
      renderCategories(container);
      
      if (newCategoryInput) newCategoryInput.value = '';
      showNotification('Categoría agregada correctamente', 'success');
    });
  }
}

function renderCategories(container) {
  container.innerHTML = appState.categories.map(category => `
    <div class="category-item">
      <span>${category}</span>
      <button class="delete-btn delete-category" data-category="${category}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
  
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
    `¿Está seguro de eliminar la categoría "${category}"? Esto no eliminará los productos asociados, pero dejarán de tener categoría.`,
    () => {
      const index = appState.categories.indexOf(category);
      if (index !== -1) {
        appState.categories.splice(index, 1);
        saveToStorage(STORAGE_KEYS.CATEGORIES, appState.categories);
        renderCategories(document.getElementById('categoriesList'));
        showNotification('Categoría eliminada', 'success');
      }
    }
  );
}

function loadSizes() {
  const container = document.getElementById('sizesList');
  if (!container) return;
  
  renderSizes(container);
  
  const addSizeBtn = document.getElementById('addSize');
  if (addSizeBtn) {
    addSizeBtn.addEventListener('click', () => {
      const newSizeInput = document.getElementById('newSize');
      const newSize = newSizeInput?.value.trim().toUpperCase() || '';
      
      if (!newSize) {
        showNotification('Ingrese un nombre para la talla', 'warning');
        return;
      }
      
      if (appState.sizes.includes(newSize)) {
        showNotification('Esta talla ya existe', 'warning');
        return;
      }
      
      appState.sizes.push(newSize);
      saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
      renderSizes(container);
      
      if (newSizeInput) newSizeInput.value = '';
      showNotification('Talla agregada correctamente', 'success');
    });
  }
}

function renderSizes(container) {
  container.innerHTML = appState.sizes.map(size => `
    <div class="size-item">
      <span>${size}</span>
      <button class="delete-btn delete-size" data-size="${size}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
  
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
    `¿Está seguro de eliminar la talla "${size}"? Esto no eliminará los productos asociados, pero dejarán de tener talla.`,
    () => {
      const index = appState.sizes.indexOf(size);
      if (index !== -1) {
        appState.sizes.splice(index, 1);
        saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
        renderSizes(document.getElementById('sizesList'));
        showNotification('Talla eliminada', 'success');
      }
    }
  );
}

function loadColors() {
  const container = document.getElementById('colorsList');
  if (!container) return;
  
  renderColors(container);
  
  const addColorBtn = document.getElementById('addColor');
  if (addColorBtn) {
    addColorBtn.addEventListener('click', () => {
      const newColorName = document.getElementById('newColorName')?.value.trim() || '';
      const newColorValue = document.getElementById('newColorValue')?.value || '#ff0000';
      
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
      renderColors(container);
      
      if (document.getElementById('newColorName')) {
        document.getElementById('newColorName').value = '';
      }
      showNotification('Color agregado correctamente', 'success');
    });
  }
}

function renderColors(container) {
  container.innerHTML = appState.colors.map(color => `
    <div class="color-item">
      <div class="color-display">
        <div class="color-sample" style="background-color: ${color.hex};"></div>
        <span>${color.name}</span>
      </div>
      <button class="delete-btn delete-color" data-color="${color.name}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
  
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
    `¿Está seguro de eliminar el color "${colorName}"? Esto no eliminará los productos asociados, pero dejarán de tener color.`,
    () => {
      const index = appState.colors.findIndex(c => c.name === colorName);
      if (index !== -1) {
        appState.colors.splice(index, 1);
        saveToStorage(STORAGE_KEYS.COLORS, appState.colors);
        renderColors(document.getElementById('colorsList'));
        showNotification('Color eliminado', 'success');
      }
    }
  );
}

function setupDataManagement() {
  const exportDataBtn = document.getElementById('exportData');
  const importDataBtn = document.getElementById('importData');
  const resetDataBtn = document.getElementById('resetData');
  
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportData);
  }
  
  if (importDataBtn) {
    importDataBtn.addEventListener('click', importData);
  }
  
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', resetData);
  }
}

function exportData() {
  const data = {
    products: appState.products,
    sales: appState.sales,
    categories: appState.categories,
    sizes: appState.sizes,
    colors: appState.colors,
    settings: appState.settings,
    activity: appState.activity,
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `inventorypro_backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showNotification('Datos exportados correctamente', 'success');
}

function importData() {
  const fileInput = document.getElementById('importFile');
  
  if (!fileInput || !fileInput.files.length) {
    showNotification('Seleccione un archivo JSON para importar', 'warning');
    return;
  }
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      showModal(
        'Importar Datos',
        '¿Está seguro de importar estos datos? Esto sobrescribirá todos los datos actuales.',
        () => {
          appState.products = data.products || [];
          appState.sales = data.sales || [];
          appState.categories = data.categories || DEFAULT_CATEGORIES;
          appState.sizes = data.sizes || DEFAULT_SIZES;
          appState.colors = data.colors || DEFAULT_COLORS;
          appState.settings = data.settings || {};
          appState.activity = data.activity || [];
          
          saveAppState();
          showNotification('Datos importados correctamente', 'success');
          addActivity('system', 'Datos importados desde archivo');
          
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      );
    } catch (error) {
      showNotification('Error al importar datos: archivo inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}

function resetData() {
  showModal(
    'Restablecer Sistema',
    '¿Está seguro de restablecer todos los datos? Esta acción eliminará todos los productos, ventas, categorías, tallas y colores. No se puede deshacer.',
    () => {
      appState.products = [];
      appState.sales = [];
      appState.categories = DEFAULT_CATEGORIES;
      appState.sizes = DEFAULT_SIZES;
      appState.colors = DEFAULT_COLORS;
      appState.settings = { darkMode: true, accentColor: '#4e73df', fontSize: 'medium' };
      appState.activity = [{ type: 'system', message: 'Sistema restablecido', time: new Date().toISOString() }];
      
      saveAppState();
      
      showNotification('Sistema restablecido correctamente', 'success');
      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  );
}

function setupAppearanceSettings() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const accentColor = document.getElementById('accentColor');
  const fontSize = document.getElementById('fontSize');
  const saveButton = document.getElementById('saveAppearance');
  
  if (darkModeToggle) {
    darkModeToggle.checked = appState.settings.darkMode || true;
  }
  
  if (accentColor) {
    accentColor.value = appState.settings.accentColor || '#4e73df';
  }
  
  if (fontSize) {
    fontSize.value = appState.settings.fontSize || 'medium';
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      appState.settings.darkMode = darkModeToggle?.checked || true;
      appState.settings.accentColor = accentColor?.value || '#4e73df';
      appState.settings.fontSize = fontSize?.value || 'medium';
      
      saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
      applySettings();
      
      showNotification('Configuración guardada correctamente', 'success');
    });
  }
}