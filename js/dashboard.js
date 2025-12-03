// Dashboard - Jessica Boutique

let weeklySalesChart = null;
let topProductsChart = null;

function loadDashboard() {
  updateDashboardStats();
  loadWeeklySalesChart();
  loadTopProducts();
  loadRecentActivity();
  loadSeasonalHighlights();
}

function updateDashboardStats() {
  const totalProducts = appState.products.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = appState.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStock = appState.products.filter(p => p.quantity <= (p.minStock || 5)).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaySales = appState.sales
    .filter(sale => sale.date.startsWith(today))
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthSales = appState.sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    })
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Actualizar elementos del DOM
  const totalProductsEl = document.getElementById('totalProducts');
  const salesTodayEl = document.getElementById('salesToday');
  const salesMonthEl = document.getElementById('salesMonth');
  const lowStockEl = document.getElementById('lowStock');
  
  if (totalProductsEl) totalProductsEl.textContent = totalProducts.toLocaleString();
  if (salesTodayEl) salesTodayEl.textContent = formatCurrency(todaySales);
  if (salesMonthEl) salesMonthEl.textContent = formatCurrency(monthSales);
  if (lowStockEl) lowStockEl.textContent = lowStock;
  
  // Actualizar quick stats
  updateQuickStats();
}

function updateQuickStats() {
  // Estadísticas rápidas adicionales
  const uniqueProducts = appState.products.length;
  const averagePrice = appState.products.length > 0 
    ? appState.products.reduce((sum, p) => sum + p.price, 0) / appState.products.length 
    : 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todaySalesCount = appState.sales.filter(s => s.date.startsWith(today)).length;
  
  const uniqueClients = [...new Set(appState.sales.map(s => s.clientName))].length;
  
  // Actualizar elementos si existen
  const elements = {
    'uniqueProducts': uniqueProducts,
    'avgPrice': formatCurrency(averagePrice),
    'todaySalesCount': todaySalesCount,
    'uniqueClients': uniqueClients
  };
  
  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }
}

function loadWeeklySalesChart() {
  const ctx = document.getElementById('weeklySalesChart');
  if (!ctx) return;
  
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const salesByDay = last7Days.map(date => {
    const daySales = appState.sales
      .filter(sale => sale.date.startsWith(date))
      .reduce((sum, sale) => sum + sale.total, 0);
    return daySales;
  });
  
  const daysOfWeek = last7Days.map(date => {
    const d = new Date(date);
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
  });
  
  if (weeklySalesChart instanceof Chart) {
    weeklySalesChart.destroy();
  }
  
  weeklySalesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: daysOfWeek,
      datasets: [{
        label: 'Ventas (S/)',
        data: salesByDay,
        borderColor: '#e75480',
        backgroundColor: 'rgba(231, 84, 128, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e75480',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#e75480',
          bodyColor: '#4a4a4a',
          borderColor: '#e75480',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Ventas: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: value => 'S/ ' + value.toLocaleString(),
            font: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Montserrat, sans-serif'
            }
          }
        }
      }
    }
  });
}

function loadTopProducts() {
  const container = document.getElementById('topProductsList');
  if (!container) return;
  
  const productSales = {};
  
  appState.sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.name].quantity += item.quantity;
      productSales[item.name].revenue += item.subtotal;
    });
  });
  
  const sortedProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  if (sortedProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>No hay ventas registradas aún</p>
        <small>Realiza tu primera venta para ver estadísticas</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedProducts.map((product, index) => `
    <div class="top-product-item fade-in-up" style="animation-delay: ${index * 0.1}s">
      <div class="product-image">
        <i class="fas fa-tshirt"></i>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-stats">
          <span class="stat"><i class="fas fa-shopping-cart"></i> ${product.quantity} unidades</span>
          <span class="stat"><i class="fas fa-dollar-sign"></i> ${formatCurrency(product.revenue)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  const recentActivities = appState.activity.slice(0, 5);
  
  if (recentActivities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-history"></i>
        <p>No hay actividad reciente</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recentActivities.map((activity, index) => {
    let icon = 'fas fa-info-circle';
    let iconClass = 'activity-icon info';
    
    if (activity.type === 'product') {
      icon = 'fas fa-box';
      iconClass = 'activity-icon product';
    } else if (activity.type === 'sale') {
      icon = 'fas fa-cash-register';
      iconClass = 'activity-icon sale';
    } else if (activity.type === 'warning') {
      icon = 'fas fa-exclamation-triangle';
      iconClass = 'activity-icon alert';
    }
    
    return `
      <div class="activity-item fade-in-up" style="animation-delay: ${index * 0.1}s">
        <div class="${iconClass}">
          <i class="${icon}"></i>
        </div>
        <div class="activity-details">
          <p>${activity.message}</p>
          <span class="activity-time">
            <i class="far fa-clock"></i> ${getRelativeTime(activity.time)}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function loadSeasonalHighlights() {
  const container = document.getElementById('seasonalHighlights');
  if (!container) return;
  
  const currentMonth = new Date().getMonth();
  let season = '';
  
  // Determinar temporada actual
  if (currentMonth >= 2 && currentMonth <= 4) season = 'Primavera';
  else if (currentMonth >= 5 && currentMonth <= 7) season = 'Verano';
  else if (currentMonth >= 8 && currentMonth <= 10) season = 'Otoño';
  else season = 'Invierno';
  
  // Productos de la temporada actual
  const seasonalProducts = appState.products.filter(p => 
    p.season && p.season.includes(season)
  ).slice(0, 3);
  
  // Productos con stock bajo
  const lowStockProducts = appState.products.filter(p => 
    p.quantity <= (p.minStock || 5)
  ).slice(0, 3);
  
  container.innerHTML = `
    <div class="seasonal-card">
      <h4><i class="fas fa-leaf"></i> Temporada ${season}</h4>
      <p>${seasonalProducts.length} productos destacados para esta temporada</p>
      <button class="btn btn-outline">Ver Colección</button>
      <div class="icon">
        <i class="fas fa-${getSeasonIcon(season)}"></i>
      </div>
    </div>
    <div class="seasonal-card gold">
      <h4><i class="fas fa-exclamation-triangle"></i> Stock por Reponer</h4>
      <p>${lowStockProducts.length} productos necesitan atención</p>
      <button class="btn btn-outline">Ver Productos</button>
      <div class="icon">
        <i class="fas fa-box"></i>
      </div>
    </div>
  `;
}

function getSeasonIcon(season) {
  switch(season) {
    case 'Primavera': return 'seedling';
    case 'Verano': return 'sun';
    case 'Otoño': return 'leaf';
    case 'Invierno': return 'snowflake';
    default: return 'calendar-alt';
  }
}

// Función para cargar gráfico de productos más vendidos (doughnut)
function loadTopProductsChart() {
  const ctx = document.getElementById('topProductsChart');
  if (!ctx) return;
  
  const productSales = {};
  
  appState.sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = 0;
      }
      productSales[item.name] += item.quantity;
    });
  });
  
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const productNames = sortedProducts.map(([name]) => name);
  const productQuantities = sortedProducts.map(([, quantity]) => quantity);
  
  if (topProductsChart instanceof Chart) {
    topProductsChart.destroy();
  }
  
  if (sortedProducts.length === 0) {
    ctx.parentNode.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-pie"></i>
        <p>No hay datos de ventas</p>
      </div>
    `;
    return;
  }
  
  topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: productNames,
      datasets: [{
        data: productQuantities,
        backgroundColor: [
          '#e75480', '#d4af37', '#9c27b0', '#5d9cec', '#ffc107'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: 'Montserrat, sans-serif',
              size: 12
            },
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${context.parsed} unidades (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}