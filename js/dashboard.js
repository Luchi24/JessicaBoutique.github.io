// Dashboard Functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard')) {
    loadDashboard();
  }
});

function loadDashboard() {
  updateDashboardStats();
  loadWeeklySalesChart();
  loadTopProducts();
  loadRecentActivity();
  
  // Actualizar cada 30 segundos
  setInterval(updateDashboardStats, 30000);
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
  
  if (document.getElementById('totalProducts')) {
    document.getElementById('totalProducts').textContent = totalProducts;
  }
  
  if (document.getElementById('salesToday')) {
    document.getElementById('salesToday').textContent = formatCurrency(todaySales);
  }
  
  if (document.getElementById('salesMonth')) {
    document.getElementById('salesMonth').textContent = formatCurrency(monthSales);
  }
  
  if (document.getElementById('lowStock')) {
    document.getElementById('lowStock').textContent = lowStock;
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
  
  if (window.weeklySalesChart instanceof Chart) {
    window.weeklySalesChart.destroy();
  }
  
  window.weeklySalesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: daysOfWeek,
      datasets: [{
        label: 'Ventas (S/)',
        data: salesByDay,
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          },
          ticks: {
            callback: value => 'S/ ' + value
          }
        },
        x: {
          grid: {
            display: false
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
        productSales[item.name] = 0;
      }
      productSales[item.name] += item.quantity;
    });
  });
  
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (sortedProducts.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay datos de ventas aún</p>';
    return;
  }
  
  container.innerHTML = sortedProducts.map(([name, sales]) => `
    <div class="top-product-item">
      <span class="product-name">${name}</span>
      <span class="product-sales">${sales} unidades</span>
    </div>
  `).join('');
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  const recentActivities = appState.activity.slice(0, 10);
  
  if (recentActivities.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay actividad reciente</p>';
    return;
  }
  
  container.innerHTML = recentActivities.map(activity => {
    let icon = 'fas fa-info-circle';
    let color = '#36b9cc';
    
    if (activity.type === 'product') {
      icon = 'fas fa-plus-circle';
      color = '#1cc88a';
    } else if (activity.type === 'sale') {
      icon = 'fas fa-cash-register';
      color = '#4e73df';
    } else if (activity.type === 'warning') {
      icon = 'fas fa-exclamation-triangle';
      color = '#f6c23e';
    }
    
    return `
      <div class="activity-item">
        <i class="${icon} activity-icon" style="color: ${color};"></i>
        <div class="activity-details">
          <p>${activity.message}</p>
          <span class="activity-time">${getRelativeTime(activity.time)}</span>
        </div>
      </div>
    `;
  }).join('');
}