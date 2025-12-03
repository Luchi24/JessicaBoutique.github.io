// Jessica Boutique - Sistema de Gestión de Inventario
// Archivo principal de JavaScript

// ============================
// CONSTANTES Y CONFIGURACIÓN
// ============================
const STORAGE_KEYS = {
  PRODUCTS: 'jessicaBoutique_products',
  SALES: 'jessicaBoutique_sales',
  CATEGORIES: 'jessicaBoutique_categories',
  SIZES: 'jessicaBoutique_sizes',
  COLORS: 'jessicaBoutique_colors',
  CLIENTS: 'jessicaBoutique_clients',
  SETTINGS: 'jessicaBoutique_settings',
  ACTIVITY: 'jessicaBoutique_activity'
};

// Categorías específicas para tienda de ropa
const DEFAULT_CATEGORIES = [
  'Blusas y Camisetas',
  'Pantalones y Jeans',
  'Vestidos',
  'Faldas',
  'Abrigos y Chaquetas',
  'Ropa Deportiva',
  'Ropa Interior',
  'Accesorios',
  'Calzado',
  'Bolsos'
];

// Tallas específicas para ropa
const DEFAULT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '28', '30', '32', '34', '36', '38', '40', '42',
  'Única'
];

// Colores específicos para ropa
const DEFAULT_COLORS = [
  { name: 'Rojo', hex: '#ff0000' },
  { name: 'Azul', hex: '#0000ff' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Rosa', hex: '#ffc0cb' },
  { name: 'Morado', hex: '#800080' },
  { name: 'Verde', hex: '#008000' },
  { name: 'Amarillo', hex: '#ffff00' },
  { name: 'Naranja', hex: '#ffa500' },
  { name: 'Marrón', hex: '#8b4513' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Azul Marino', hex: '#000080' },
  { name: 'Turquesa', hex: '#40e0d0' },
  { name: 'Lila', hex: '#c8a2c8' }
];

// Materiales para ropa
const CLOTHING_MATERIALS = [
  'Algodón',
  'Poliéster',
  'Lino',
  'Seda',
  'Lana',
  'Denim',
  'Cuero',
  'Encaje',
  'Saten',
  'Pana'
];

// Temporadas
const SEASONS = [
  'Primavera',
  'Verano',
  'Otoño',
  'Invierno',
  'Todo el año'
];

// ============================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================
let appState = {
  products: [],
  sales: [],
  categories: [],
  sizes: [],
  colors: [],
  clients: [],
  settings: {},
  activity: []
};

// ============================
// FUNCIONES DE ALMACENAMIENTO
// ============================
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
    showNotification('Error al guardar datos', 'error');
    return false;
  }
}

function loadFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error);
    return defaultValue;
  }
}

function initializeStorage() {
  appState.products = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  appState.sales = loadFromStorage(STORAGE_KEYS.SALES, []);
  appState.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  appState.sizes = loadFromStorage(STORAGE_KEYS.SIZES, DEFAULT_SIZES);
  appState.colors = loadFromStorage(STORAGE_KEYS.COLORS, DEFAULT_COLORS);
  appState.clients = loadFromStorage(STORAGE_KEYS.CLIENTS, []);
  appState.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
    darkMode: true,
    accentColor: '#e75480',
    fontSize: 'medium',
    igvPercentage: 18,
    cardFeePercentage: 5,
    lowStockAlert: true,
    alertThreshold: 5
  });
  appState.activity = loadFromStorage(STORAGE_KEYS.ACTIVITY, [
    { type: 'system', message: 'Sistema Jessica Boutique inicializado', time: new Date().toISOString() }
  ]);
  
  applySettings();
  updateSystemInfo();
}

function saveAppState() {
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  saveToStorage(STORAGE_KEYS.SALES, appState.sales);
  saveToStorage(STORAGE_KEYS.CATEGORIES, appState.categories);
  saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
  saveToStorage(STORAGE_KEYS.COLORS, appState.colors);
  saveToStorage(STORAGE_KEYS.CLIENTS, appState.clients);
  saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
  saveToStorage(STORAGE_KEYS.ACTIVITY, appState.activity);
}

// ============================
// FUNCIONES DE UTILIDAD
// ============================
function generateId(prefix = '') {
  return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Hace unos segundos';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  return formatDate(dateString);
}

function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  let icon = 'fas fa-info-circle';
  if (type === 'success') icon = 'fas fa-check-circle';
  if (type === 'error') icon = 'fas fa-exclamation-circle';
  if (type === 'warning') icon = 'fas fa-exclamation-triangle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="${icon}"></i>
      <p>${message}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  container.appendChild(notification);
  
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function showModal(title, message, onConfirm, confirmText = 'Confirmar') {
  const modal = document.getElementById('confirmationModal');
  const titleElement = document.getElementById('modalTitle');
  const messageElement = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  const closeBtn = document.getElementById('modalClose');
  
  if (!modal) return;
  
  titleElement.textContent = title;
  messageElement.textContent = message;
  confirmBtn.textContent = confirmText;
  
  modal.classList.add('active');
  
  const closeModal = () => {
    modal.classList.remove('active');
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', closeModal);
    closeBtn.removeEventListener('click', closeModal);
  };
  
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
}

function addActivity(type, message) {
  const activity = {
    type,
    message,
    time: new Date().toISOString()
  };
  
  appState.activity.unshift(activity);
  if (appState.activity.length > 50) {
    appState.activity = appState.activity.slice(0, 50);
  }
  
  saveToStorage(STORAGE_KEYS.ACTIVITY, appState.activity);
  
  if (document.getElementById('recentActivity')) {
    loadRecentActivity();
  }
}

// ============================
// FUNCIONES DE NAVEGACIÓN Y UI
// ============================
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
  
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        sidebar && 
        !sidebar.contains(e.target) && 
        menuToggle &&
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  });
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  
  if (!themeToggle) return;
  
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      document.body.removeAttribute('data-theme');
      appState.settings.darkMode = false;
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Tema Oscuro</span>';
    } else {
      document.body.setAttribute('data-theme', 'dark');
      appState.settings.darkMode = true;
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Tema Claro</span>';
    }
    
    saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
    showNotification('Tema cambiado', 'success');
  });
}

function applySettings() {
  if (appState.settings.darkMode) {
    document.body.setAttribute('data-theme', 'dark');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Tema Claro</span>';
    }
  } else {
    document.body.removeAttribute('data-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Tema Oscuro</span>';
    }
  }
  
  if (appState.settings.accentColor) {
    document.documentElement.style.setProperty('--primary', appState.settings.accentColor);
    document.documentElement.style.setProperty('--primary-dark', adjustColor(appState.settings.accentColor, -20));
  }
  
  if (appState.settings.fontSize) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${appState.settings.fontSize}`);
  }
}

function adjustColor(color, amount) {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amount;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function updateSystemInfo() {
  const lastUpdate = document.getElementById('lastUpdate');
  const productCount = document.getElementById('systemProductCount');
  const saleCount = document.getElementById('systemSaleCount');
  const storageUsage = document.getElementById('storageUsage');
  
  if (lastUpdate) {
    lastUpdate.textContent = new Date().toLocaleDateString('es-PE');
  }
  
  if (productCount) {
    productCount.textContent = appState.products.length;
  }
  
  if (saleCount) {
    saleCount.textContent = appState.sales.length;
  }
  
  if (storageUsage) {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2;
      }
    }
    storageUsage.textContent = (totalSize / 1024).toFixed(2) + ' KB';
  }
}

// ============================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================
document.addEventListener('DOMContentLoaded', () => {
  initializeStorage();
  
  setupNavigation();
  setupThemeToggle();
  
  // Cargar módulos específicos según la página
  const path = window.location.pathname;
  const page = path.split('/').pop();
  
  switch(page) {
    case 'index.html':
    case '':
      if (typeof loadDashboard === 'function') loadDashboard();
      break;
    case 'inventario.html':
      if (typeof loadInventory === 'function') loadInventory();
      break;
    case 'agregar-producto.html':
      if (typeof setupAddProductForm === 'function') setupAddProductForm();
      break;
    case 'ventas.html':
      if (typeof setupSalesSection === 'function') setupSalesSection();
      break;
    case 'reportes.html':
      if (typeof setupReportsSection === 'function') setupReportsSection();
      break;
    case 'gestion.html':
      if (typeof setupSettingsSection === 'function') setupSettingsSection();
      break;
  }
  
  showNotification('¡Bienvenida a Jessica Boutique! Sistema listo', 'success');
  
  // Actualizar dashboard cada 30 segundos
  setInterval(() => {
    if (typeof updateDashboardStats === 'function') {
      updateDashboardStats();
    }
  }, 30000);
});