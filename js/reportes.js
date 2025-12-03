// Reportes Functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reports')) {
    setupReportsSection();
  }
});

function setupReportsSection() {
  setupTimeFilters();
  loadReports();
}

function setupTimeFilters() {
  const timeFilters = document.querySelectorAll('.time-filter');
  const customDateRange = document.getElementById('customDateRange');
  const applyDateRangeBtn = document.getElementById('applyDateRange');
  
  timeFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      timeFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      
      if (filter.getAttribute('data-period') === 'custom') {
        if (customDateRange) customDateRange.style.display = 'grid';
      } else {
        if (customDateRange) customDateRange.style.display = 'none';
        loadReports();
      }
    });
  });
  
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', loadReports);
  }
}

function loadReports() {
  const activeFilter = document.querySelector('.time-filter.active');
  const period = activeFilter ? activeFilter.getAttribute('data-period') : 'month';
  
  let filteredSales = [];
  const now = new Date();
  
  switch (period) {
    case 'day':
      const today = now.toISOString().split('T')[0];
      filteredSales = appState.sales.filter(sale => sale.date.startsWith(today));
      break;
    case 'week':
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredSales = appState.sales.filter(sale => new Date(sale.date) >= oneWeekAgo);
      break;
    case 'month':
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredSales = appState.sales.filter(sale => new Date(sale.date) >= oneMonthAgo);
      break;
    case 'year':
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filteredSales = appState.sales.filter(sale => new Date(sale.date) >= oneYearAgo);
      break;
    case 'custom':
      const startDate = document.getElementById('startDate')?.value;
      const endDate = document.getElementById('endDate')?.value;
      
      if (startDate && endDate) {
        filteredSales = appState.sales.filter(sale => {
          const saleDate = sale.date.split('T')[0];
          return saleDate >= startDate && saleDate <= endDate;
        });
      } else {
        filteredSales = appState.sales;
      }
      break;
    default:
      filteredSales = appState.sales;
  }
  
  updateReportsSummary(filteredSales);
  loadSalesProfitChart(filteredSales);
  loadTopProductsChart(filteredSales);
  loadWeekdaySalesChart(filteredSales);
  loadTopCustomers(filteredSales);
}

function updateReportsSummary(sales) {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = sales.reduce((sum, sale) => {
    const saleProfit = sale.items.reduce((itemSum, item) => {
      const product = appState.products.find(p => p.id === item.productId);
      const cost = product ? product.cost * item.quantity : 0;
      return itemSum + (item.subtotal - cost);
    }, 0);
    return sum + saleProfit;
  }, 0);
  
  const avgSale = sales.length > 0 ? totalSales / sales.length : 0;
  const uniqueCustomers = [...new Set(sales.map(sale => sale.clientName))].length;
  
  if (document.getElementById('reportTotalSales')) {
    document.getElementById('reportTotalSales').textContent = formatCurrency(totalSales);
  }
  
  if (document.getElementById('reportProfit')) {
    document.getElementById('reportProfit').textContent = formatCurrency(profit);
  }
  
  if (document.getElementById('reportAvgSale')) {
    document.getElementById('reportAvgSale').textContent = formatCurrency(avgSale);
  }
  
  if (document.getElementById('reportCustomers')) {
    document.getElementById('reportCustomers').textContent = uniqueCustomers;
  }
}

function loadSalesProfitChart(sales) {
  const ctx = document.getElementById('salesProfitChart');
  if (!ctx) return;
  
  const last12Months = Array.from({length: 12}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().substring(0, 7);
  }).reverse();
  
  const salesByMonth = last12Months.map(month => {
    const monthSales = sales
      .filter(sale => sale.date.startsWith(month))
      .reduce((sum, sale) => sum + sale.total, 0);
    return monthSales;
  });
  
  const profitByMonth = last12Months.map(month => {
    const monthSales = sales.filter(sale => sale.date.startsWith(month));
    const profit = monthSales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        const product = appState.products.find(p => p.id === item.productId);
        const cost = product ? product.cost * item.quantity : 0;
        return itemSum + (item.subtotal - cost);
      }, 0);
      return sum + saleProfit;
    }, 0);
    return profit;
  });
  
  const monthLabels = last12Months.map(month => {
    const [year, monthNum] = month.split('-');
    return `${monthNum}/${year.slice(2)}`;
  });
  
  if (window.salesProfitChart instanceof Chart) {
    window.salesProfitChart.destroy();
  }
  
  window.salesProfitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Ventas',
          data: salesByMonth,
          backgroundColor: 'rgba(78, 115, 223, 0.7)',
          borderColor: '#4e73df',
          borderWidth: 1
        },
        {
          label: 'Ganancias',
          data: profitByMonth,
          backgroundColor: 'rgba(28, 200, 138, 0.7)',
          borderColor: '#1cc88a',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
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
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function loadTopProductsChart(sales) {
  const ctx = document.getElementById('topProductsChart');
  if (!ctx) return;
  
  const productSales = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = 0;
      }
      productSales[item.name] += item.quantity;
    });
  });
  
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  const productNames = sortedProducts.map(([name]) => name);
  const productQuantities = sortedProducts.map(([, quantity]) => quantity);
  
  if (window.topProductsChart instanceof Chart) {
    window.topProductsChart.destroy();
  }
  
  if (sortedProducts.length === 0) {
    ctx.canvas.parentNode.innerHTML = '<p class="empty-state">No hay datos de ventas</p>';
    return;
  }
  
  window.topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: productNames,
      datasets: [{
        data: productQuantities,
        backgroundColor: [
          '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e',
          '#e74a3b', '#6f42c1', '#fd7e14', '#20c9a6'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

function loadWeekdaySalesChart(sales) {
  const ctx = document.getElementById('weekdaySalesChart');
  if (!ctx) return;
  
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const salesByWeekday = Array(7).fill(0);
  
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const weekday = saleDate.getDay();
    salesByWeekday[weekday] += sale.total;
  });
  
  if (window.weekdaySalesChart instanceof Chart) {
    window.weekdaySalesChart.destroy();
  }
  
  window.weekdaySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weekdays,
      datasets: [{
        label: 'Ventas por día',
        data: salesByWeekday,
        backgroundColor: 'rgba(54, 185, 204, 0.7)',
        borderColor: '#36b9cc',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
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

function loadTopCustomers(sales) {
  const container = document.getElementById('topCustomersList');
  if (!container) return;
  
  const customerSales = {};
  
  sales.forEach(sale => {
    const customerKey = sale.clientName;
    if (!customerSales[customerKey]) {
      customerSales[customerKey] = {
        name: sale.clientName,
        phone: sale.clientPhone,
        total: 0,
        count: 0
      };
    }
    customerSales[customerKey].total += sale.total;
    customerSales[customerKey].count += 1;
  });
  
  const sortedCustomers = Object.values(customerSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  if (sortedCustomers.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay datos de clientes</p>';
    return;
  }
  
  container.innerHTML = sortedCustomers.map(customer => `
    <div class="customer-item">
      <div class="customer-info">
        <h4>${customer.name}</h4>
        ${customer.phone ? `<p>${customer.phone}</p>` : ''}
        <p>${customer.count} compra${customer.count !== 1 ? 's' : ''}</p>
      </div>
      <div class="customer-sales">${formatCurrency(customer.total)}</div>
    </div>
  `).join('');
}