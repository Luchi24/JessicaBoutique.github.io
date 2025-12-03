// Sistema de Gestión de Inventario - Main
const STORAGE_KEYS = {
  PRODUCTS: 'inventoryPro_products',
  SALES: 'inventoryPro_sales',
  CATEGORIES: 'inventoryPro_categories',
  SIZES: 'inventoryPro_sizes',
  COLORS: 'inventoryPro_colors',
  SETTINGS: 'inventoryPro_settings',
  ACTIVITY: 'inventoryPro_activity'
};

const DEFAULT_CATEGORIES = ['Ropa', 'Calzado', 'Accesorios', 'Electrónica', 'Hogar'];
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'];
const DEFAULT_COLORS = [
  { name: 'Rojo', hex: '#ff0000' },
  { name: 'Azul', hex: '#0000ff' },
  { name: 'Verde', hex: '#00ff00' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Amarillo', hex: '#ffff00' },
  { name: 'Morado', hex: '#800080' },
  { name: 'Rosa', hex: '#ffc0cb' },
  { name: 'Naranja', hex: '#ffa500' },
  { name: 'Marrón', hex: '#8b4513' },
  { name: 'Beige', hex: '#f5f5dc' }
];

let appState = {
  products: [],
  sales: [],
  categories: [],
  sizes: [],
  colors: [],
  settings: {},
  activity: []
};

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
  appState.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
    darkMode: true,
    accentColor: '#4e73df',
    fontSize: 'medium'
  });
  appState.activity = loadFromStorage(STORAGE_KEYS.ACTIVITY, [
    { type: 'system', message: 'Sistema inicializado', time: new Date().toISOString() }
  ]);
  
  applySettings();
}

function saveAppState() {
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  saveToStorage(STORAGE_KEYS.SALES, appState.sales);
  saveToStorage(STORAGE_KEYS.CATEGORIES, appState.categories);
  saveToStorage(STORAGE_KEYS.SIZES, appState.sizes);
  saveToStorage(STORAGE_KEYS.COLORS, appState.colors);
  saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
  saveToStorage(STORAGE_KEYS.ACTIVITY, appState.activity);
}

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
  
  notification.innerHTML = `
    <div class="notification-content">
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

function showModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmationModal');
  if (!modal) return;
  
  const titleElement = document.getElementById('modalTitle');
  const messageElement = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  const closeBtn = document.getElementById('modalClose');
  
  titleElement.textContent = title;
  messageElement.textContent = message;
  
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

function applySettings() {
  if (appState.settings.darkMode) {
    document.body.setAttribute('data-theme', 'dark');
    if (document.getElementById('themeToggle')) {
      document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> Tema Claro';
    }
  } else {
    document.body.removeAttribute('data-theme');
    if (document.getElementById('themeToggle')) {
      document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> Tema Oscuro';
    }
  }
  
  if (appState.settings.accentColor) {
    document.documentElement.style.setProperty('--primary', appState.settings.accentColor);
  }
  
  if (appState.settings.fontSize) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${appState.settings.fontSize}`);
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initializeStorage();
  
  if (typeof setupNavigation === 'function') setupNavigation();
  if (typeof setupThemeToggle === 'function') setupThemeToggle();
  
  showNotification('Sistema de inventario cargado correctamente', 'success');
});