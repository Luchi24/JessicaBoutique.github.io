// Reportes - Jessica Boutique

let currentPeriod = 'today';
let salesProfitChart = null;
let topProductsChart = null;
let weekdaySalesChart = null;
let paymentMethodsChart = null;

function setupReportsSection() {
  setupTimeFilters();
  loadReports();
  setupExport();
  setupReportTabs();
}

function setupTimeFilters() {
  const timeFilters = document.querySelectorAll('.time-filter');
  const customDateRange = document.getElementById('customDateRange');
  const applyDateRangeBtn = document.getElementById('applyDateRange');
  
  timeFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      timeFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      
      currentPeriod = filter.dataset.period;
      
      if (currentPeriod === 'custom') {
        if (customDateRange) customDateRange.style.display = 'grid';
      } else {
        if (customDateRange) customDateRange.style.display = 'none';
        loadReports();
      }
    });
  });
  
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', () => {
      loadReports();
    });
  }
  
  // Set default dates for custom range
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput) {
    startDateInput.value = oneWeekAgo.toISOString().split('T')[0];
    startDateInput.max = today.toISOString().split('T')[0];
  }
  
  if (endDateInput) {
    endDateInput.value = today.toISOString().split('T')[0];
    endDateInput.max = today.toISOString().split('T')[0];
  }
}

function getFilteredSales() {
  const now = new Date();
  let filteredSales = [];
  
  switch(currentPeriod) {
    case 'today':
      const today = now.toISOString().split('T')[0];
      filteredSales = appState.sales.filter(sale => sale.date.startsWith(today));
      break;
      
    case 'yesterday':
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      filteredSales = appState.sales.filter(sale => sale.date.startsWith(yesterdayStr));
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
  
  return filteredSales;
}

function loadReports() {
  const filteredSales = getFilteredSales();
  
  updateReportsSummary(filteredSales);
  
  // Load charts based on active tab
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  
  switch(activeTab) {
    case 'general':
      loadSalesProfitChart(filteredSales);
      loadWeekdaySalesChart(filteredSales);
      loadPaymentMethodsChart(filteredSales);
      loadSalesTrendChart(filteredSales);
      loadHourlySalesChart(filteredSales);
      break;
      
    case 'products':
      loadTopProductsChart(filteredSales);
      loadTopProfitableChart(filteredSales);
      loadCategorySalesChart(filteredSales);
      loadLowStockList();
      loadProductsReportTable(filteredSales);
      break;
      
    case 'clients':
      loadTopCustomers(filteredSales);
      loadTopSpendingChart(filteredSales);
      setupClientSelector();
      break;
      
    case 'inventory':
      loadInventoryValue();
      loadDepletingProducts();
      loadInventoryTurnoverChart(filteredSales);
      loadABCAnalysis();
      break;
  }
  
  loadRecommendations(filteredSales);
}

function updateReportsSummary(sales) {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate profit (simplified: profit = total - cost)
  const profit = sales.reduce((sum, sale) => {
    const saleCost = sale.items.reduce((itemSum, item) => {
      const product = appState.products.find(p => p.id === item.productId);
      const cost = product ? (product.cost || product.price * 0.6) * item.quantity : 0;
      return itemSum + cost;
    }, 0);
    return sum + (sale.total - saleCost);
  }, 0);
  
  const avgSale = sales.length > 0 ? totalSales / sales.length : 0;
  const productsSold = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  // Calculate changes vs previous period
  const previousPeriodSales = getPreviousPeriodSales();
  const previousTotal = previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0);
  const salesChange = previousTotal > 0 ? ((totalSales - previousTotal) / previousTotal) * 100 : 0;
  
  // Update DOM elements
  const elements = {
    'reportTotalSales': formatCurrency(totalSales),
    'reportProfit': formatCurrency(profit),
    'reportAvgSale': formatCurrency(avgSale),
    'reportProductsSold': productsSold.toLocaleString(),
    'salesChange': `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% vs período anterior`,
    'profitChange': `Margen: ${totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0}%`,
    'avgSaleChange': sales.length > 0 ? `por venta (${sales.length} ventas)` : 'Sin ventas',
    'productsChange': `unidades vendidas`
  };
  
  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      
      // Add color for changes
      if (id.includes('Change') && !id.includes('avgSale') && !id.includes('products')) {
        if (salesChange > 0) {
          element.style.color = '#4CAF50';
        } else if (salesChange < 0) {
          element.style.color = '#f44336';
        }
      }
    }
  }
}

function getPreviousPeriodSales() {
  const now = new Date();
  let startDate, endDate;
  
  switch(currentPeriod) {
    case 'today':
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return appState.sales.filter(sale => sale.date.startsWith(yesterdayStr));
      
    case 'week':
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return appState.sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
      });
      
    case 'month':
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return appState.sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= twoMonthsAgo && saleDate < oneMonthAgo;
      });
      
    default:
      return [];
  }
}

function loadSalesProfitChart(sales) {
  const ctx = document.getElementById('salesProfitChart');
  if (!ctx) return;
  
  // Group by period (daily, weekly, monthly)
  const period = document.getElementById('salesProfitPeriod')?.value || 'daily';
  
  let labels = [];
  let salesData = [];
  let profitData = [];
  
  if (period === 'daily') {
    // Last 14 days
    labels = Array.from({length: 14}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
    });
    
    const last14Days = Array.from({length: 14}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });
    
    salesData = last14Days.map(date => {
      return sales
        .filter(sale => sale.date.startsWith(date))
        .reduce((sum, sale) => sum + sale.total, 0);
    });
    
    profitData = last14Days.map(date => {
      return sales
        .filter(sale => sale.date.startsWith(date))
        .reduce((sum, sale) => {
          const saleProfit = sale.items.reduce((itemSum, item) => {
            const product = appState.products.find(p => p.id === item.productId);
            const cost = product ? (product.cost || product.price * 0.6) * item.quantity : 0;
            return itemSum + (item.subtotal - cost);
          }, 0);
          return sum + saleProfit;
        }, 0);
    });
    
  } else if (period === 'weekly') {
    // Last 8 weeks
    labels = Array.from({length: 8}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 * (7 - i)));
      return `Sem ${date.getWeek()}`;
    });
    
    salesData = Array.from({length: 8}, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return sales
        .filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= weekStart && saleDate < weekEnd;
        })
        .reduce((sum, sale) => sum + sale.total, 0);
    });
    
  } else if (period === 'monthly') {
    // Last 6 months
    labels = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('es-PE', { month: 'short' });
    });
    
    salesData = Array.from({length: 6}, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      const monthStr = month.toISOString().substring(0, 7);
      
      return sales
        .filter(sale => sale.date.startsWith(monthStr))
        .reduce((sum, sale) => sum + sale.total, 0);
    });
  }
  
  if (salesProfitChart instanceof Chart) {
    salesProfitChart.destroy();
  }
  
  salesProfitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ventas',
          data: salesData,
          backgroundColor: 'rgba(231, 84, 128, 0.7)',
          borderColor: '#e75480',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Ganancias',
          data: profitData,
          backgroundColor: 'rgba(212, 175, 55, 0.7)',
          borderColor: '#d4af37',
          borderWidth: 1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            callback: value => 'S/ ' + value.toLocaleString()
          },
          grid: {
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += formatCurrency(context.parsed.y);
              return label;
            }
          }
        }
      }
    }
  });
  
  // Add event listener for period change
  const periodSelect = document.getElementById('salesProfitPeriod');
  if (periodSelect) {
    periodSelect.addEventListener('change', () => {
      loadSalesProfitChart(sales);
    });
  }
}

// Helper function to get week number
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

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
  
  if (weekdaySalesChart instanceof Chart) {
    weekdaySalesChart.destroy();
  }
  
  weekdaySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weekdays,
      datasets: [{
        label: 'Ventas por día',
        data: salesByWeekday,
        backgroundColor: [
          '#e75480', '#d4af37', '#9c27b0', '#5d9cec', 
          '#ffc107', '#4CAF50', '#FF9800'
        ].map(color => color + 'CC'),
        borderColor: [
          '#e75480', '#d4af37', '#9c27b0', '#5d9cec', 
          '#ffc107', '#4CAF50', '#FF9800'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => 'S/ ' + value.toLocaleString()
          },
          grid: {
            drawBorder: false
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
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Ventas: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}

function loadPaymentMethodsChart(sales) {
  const ctx = document.getElementById('paymentMethodsChart');
  if (!ctx) return;
  
  const paymentMethods = {
    'cash': 0,
    'transfer': 0,
    'card': 0,
    'mixed': 0
  };
  
  sales.forEach(sale => {
    paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.total;
  });
  
  const labels = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto'];
  const data = [paymentMethods.cash, paymentMethods.transfer, paymentMethods.card, paymentMethods.mixed];
  const total = data.reduce((a, b) => a + b, 0);
  
  if (paymentMethodsChart instanceof Chart) {
    paymentMethodsChart.destroy();
  }
  
  if (total === 0) {
    ctx.parentNode.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-credit-card"></i>
        <p>No hay datos de métodos de pago</p>
      </div>
    `;
    return;
  }
  
  paymentMethodsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'
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
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
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
    .slice(0, 8);
  
  const productNames = sortedProducts.map(p => p.name);
  const productQuantities = sortedProducts.map(p => p.quantity);
  
  if (topProductsChart instanceof Chart) {
    topProductsChart.destroy();
  }
  
  if (sortedProducts.length === 0) {
    ctx.parentNode.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-bar"></i>
        <p>No hay datos de productos vendidos</p>
      </div>
    `;
    return;
  }
  
  topProductsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: productNames,
      datasets: [{
        label: 'Unidades Vendidas',
        data: productQuantities,
        backgroundColor: 'rgba(231, 84, 128, 0.7)',
        borderColor: '#e75480',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const product = sortedProducts[context.dataIndex];
              return [
                `Unidades: ${context.parsed.x}`,
                `Ingresos: ${formatCurrency(product.revenue)}`
              ];
            }
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
        phone: sale.clientPhone || 'No registrado',
        total: 0,
        count: 0,
        lastPurchase: sale.date
      };
    }
    customerSales[customerKey].total += sale.total;
    customerSales[customerKey].count += 1;
    if (new Date(sale.date) > new Date(customerSales[customerKey].lastPurchase)) {
      customerSales[customerKey].lastPurchase = sale.date;
    }
  });
  
  const sortedCustomers = Object.values(customerSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  if (sortedCustomers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>No hay datos de clientes</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedCustomers.map((customer, index) => `
    <div class="customer-item fade-in-up" style="animation-delay: ${index * 0.1}s">
      <div class="customer-info">
        <h4>${customer.name}</h4>
        <p>${customer.phone}</p>
        <div class="customer-stats">
          <span class="stat"><i class="fas fa-shopping-cart"></i> ${customer.count} compra${customer.count !== 1 ? 's' : ''}</span>
          <span class="stat"><i class="far fa-clock"></i> ${getRelativeTime(customer.lastPurchase)}</span>
        </div>
      </div>
      <div class="customer-sales">
        ${formatCurrency(customer.total)}
      </div>
    </div>
  `).join('');
}

function loadLowStockList() {
  const container = document.getElementById('lowStockList');
  if (!container) return;
  
  const lowStockProducts = appState.products.filter(p => 
    p.quantity <= (p.minStock || 5)
  ).sort((a, b) => a.quantity - b.quantity)
   .slice(0, 5);
  
  if (lowStockProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>No hay productos con stock bajo</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = lowStockProducts.map((product, index) => {
    const stockLevel = getStockLevel(product.quantity, product.minStock || 5);
    const stockClass = stockLevel === 'critical' ? 'critical' : 'low';
    
    return `
      <div class="low-stock-item fade-in-up" style="animation-delay: ${index * 0.1}s">
        <div class="product-name">${product.name}</div>
        <div class="stock-level">
          <span class="stock-badge ${stockClass}">${product.quantity} unidades</span>
          <span class="stock-min">Mínimo: ${product.minStock || 5}</span>
        </div>
      </div>
    `;
  }).join('');
}

function loadProductsReportTable(sales) {
  const container = document.getElementById('productsReportBody');
  if (!container) return;
  
  const productStats = {};
  
  // Initialize with all products
  appState.products.forEach(product => {
    productStats[product.id] = {
      name: product.name,
      category: product.category,
      sold: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      currentStock: product.quantity
    };
  });
  
  // Add sales data
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (productStats[item.productId]) {
        productStats[item.productId].sold += item.quantity;
        productStats[item.productId].revenue += item.subtotal;
        
        const product = appState.products.find(p => p.id === item.productId);
        if (product) {
          const cost = product.cost || product.price * 0.6;
          productStats[item.productId].cost += cost * item.quantity;
          productStats[item.productId].profit += item.subtotal - (cost * item.quantity);
        }
      }
    });
  });
  
  const sortedProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  if (sortedProducts.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No hay datos de productos</p>
        </td>
      </tr>
    `;
    return;
  }
  
  container.innerHTML = sortedProducts.map((product, index) => {
    const margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
    const marginClass = margin >= 40 ? 'high-margin' : margin >= 20 ? 'medium-margin' : 'low-margin';
    
    return `
      <tr class="fade-in-up" style="animation-delay: ${index * 0.05}s">
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.sold}</td>
        <td>${formatCurrency(product.revenue)}</td>
        <td>${formatCurrency(product.profit)}</td>
        <td class="${marginClass}">${margin.toFixed(1)}%</td>
        <td>
          <div class="stock-indicator ${getStockLevel(product.currentStock, 5)}"></div>
          ${product.currentStock}
        </td>
      </tr>
    `;
  }).join('');
}

function loadInventoryValue() {
  const container = document.getElementById('inventoryValue');
  if (!container) return;
  
  const totalValue = appState.products.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0);
  
  const totalCost = appState.products.reduce((sum, product) => 
    sum + ((product.cost || product.price * 0.6) * product.quantity), 0);
  
  const potentialProfit = totalValue - totalCost;
  
  container.innerHTML = `
    <p class="value-number">${formatCurrency(totalValue)}</p>
    <p class="value-label">Valor total del inventario</p>
    <div class="value-breakdown">
      <p><small>Costo: ${formatCurrency(totalCost)}</small></p>
      <p><small>Ganancia potencial: ${formatCurrency(potentialProfit)}</small></p>
    </div>
  `;
}

function loadDepletingProducts() {
  const container = document.getElementById('depletingList');
  if (!container) return;
  
  const depletingProducts = appState.products
    .filter(p => p.quantity > 0 && p.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);
  
  if (depletingProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>No hay productos por agotarse</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = depletingProducts.map((product, index) => {
    const daysLeft = Math.floor((product.quantity / getAverageDailySales(product.id)) * 30) || 30;
    const urgency = daysLeft <= 7 ? 'urgent' : daysLeft <= 14 ? 'warning' : 'normal';
    
    return `
      <div class="depleting-item fade-in-up" style="animation-delay: ${index * 0.1}s">
        <div class="product-name">${product.name}</div>
        <div class="depletion-info">
          <span class="stock-amount">${product.quantity} unidades</span>
          <span class="days-left ${urgency}">~${daysLeft} días</span>
        </div>
      </div>
    `;
  }).join('');
}

function getAverageDailySales(productId) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentSales = appState.sales.filter(sale => 
    new Date(sale.date) >= last30Days
  );
  
  const totalSold = recentSales.reduce((sum, sale) => {
    const item = sale.items.find(i => i.productId === productId);
    return sum + (item ? item.quantity : 0);
  }, 0);
  
  return totalSold / 30;
}

function loadABCAnalysis() {
  // ABC Analysis: 80/20 rule for inventory
  const productsByValue = appState.products
    .map(product => ({
      ...product,
      totalValue: product.price * product.quantity
    }))
    .sort((a, b) => b.totalValue - a.totalValue);
  
  const totalValue = productsByValue.reduce((sum, p) => sum + p.totalValue, 0);
  
  let cumulativeValue = 0;
  const abcProducts = {
    A: [], // Top 80% of value
    B: [], // Next 15% of value
    C: []  // Last 5% of value
  };
  
  productsByValue.forEach(product => {
    cumulativeValue += product.totalValue;
    const percentage = (cumulativeValue / totalValue) * 100;
    
    if (percentage <= 80) {
      abcProducts.A.push(product);
    } else if (percentage <= 95) {
      abcProducts.B.push(product);
    } else {
      abcProducts.C.push(product);
    }
  });
  
  // Update UI
  updateABCCategory('abcCategoryA', abcProducts.A);
  updateABCCategory('abcCategoryB', abcProducts.B);
  updateABCCategory('abcCategoryC', abcProducts.C);
}

function updateABCCategory(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (products.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay productos</p>';
    return;
  }
  
  container.innerHTML = products.slice(0, 5).map(product => `
    <div class="abc-product">
      <div class="product-name">${product.name}</div>
      <div class="product-value">${formatCurrency(product.totalValue)}</div>
    </div>
  `).join('');
}

function loadRecommendations(sales) {
  const container = document.getElementById('recommendations');
  if (!container) return;
  
  const recommendations = [];
  
  // Stock recommendations
  const lowStockCount = appState.products.filter(p => 
    p.quantity <= (p.minStock || 5)
  ).length;
  
  if (lowStockCount > 0) {
    recommendations.push({
      icon: 'fas fa-exclamation-triangle',
      title: 'Stock Bajo',
      message: `${lowStockCount} productos necesitan reposición. Revisa el inventario pronto.`
    });
  }
  
  // Sales recommendations
  if (sales.length === 0) {
    recommendations.push({
      icon: 'fas fa-chart-line',
      title: 'Sin Ventas',
      message: 'No hay ventas registradas en este período. Considera promociones o marketing.'
    });
  }
  
  // Best selling category
  const categorySales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = appState.products.find(p => p.id === item.productId);
      if (product) {
        categorySales[product.category] = (categorySales[product.category] || 0) + item.quantity;
      }
    });
  });
  
  const bestCategory = Object.entries(categorySales)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (bestCategory) {
    recommendations.push({
      icon: 'fas fa-star',
      title: 'Categoría Destacada',
      message: `${bestCategory[0]} es la categoría más vendida. Considera aumentar el stock.`
    });
  }
  
  // Default recommendation if none
  if (recommendations.length === 0) {
    recommendations.push({
      icon: 'fas fa-lightbulb',
      title: 'Negocio Saludable',
      message: 'Tu negocio va bien. Continúa monitoreando las métricas para mantener el crecimiento.'
    });
  }
  
  container.innerHTML = recommendations.map((rec, index) => `
    <div class="recommendation-item fade-in-up" style="animation-delay: ${index * 0.1}s">
      <i class="${rec.icon} recommendation-icon"></i>
      <div class="recommendation-content">
        <h4>${rec.title}</h4>
        <p>${rec.message}</p>
      </div>
    </div>
  `).join('');
}

function setupExport() {
  const exportBtn = document.getElementById('exportReport');
  if (!exportBtn) return;
  
  exportBtn.addEventListener('click', () => {
    const filteredSales = getFilteredSales();
    const data = {
      period: currentPeriod,
      sales: filteredSales,
      summary: {
        totalSales: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
        totalProducts: filteredSales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
        averageSale: filteredSales.length > 0 ? 
          filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length : 0
      },
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reporte_jessica_boutique_${currentPeriod}_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Reporte exportado correctamente', 'success');
  });
}

function setupReportTabs() {
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
      
      loadReports();
    });
  });
}

function setupClientSelector() {
  const selectClient = document.getElementById('selectClient');
  if (!selectClient) return;
  
  // Get unique clients from sales
  const clients = [...new Set(appState.sales.map(s => s.clientName))].filter(name => name !== 'Cliente general');
  
  selectClient.innerHTML = '<option value="">Seleccionar cliente...</option>' +
    clients.map(client => `<option value="${client}">${client}</option>`).join('');
  
  selectClient.addEventListener('change', (e) => {
    const clientName = e.target.value;
    if (clientName) {
      loadClientDetails(clientName);
    } else {
      document.getElementById('clientDetails').innerHTML = `
        <p class="empty-state">Seleccione un cliente para ver su historial</p>
      `;
    }
  });
}

function loadClientDetails(clientName) {
  const container = document.getElementById('clientDetails');
  if (!container) return;
  
  const clientSales = appState.sales.filter(sale => sale.clientName === clientName);
  const clientFromDB = appState.clients.find(c => c.name === clientName);
  
  if (clientSales.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-slash"></i>
        <p>No se encontró historial para este cliente</p>
      </div>
    `;
    return;
  }
  
  const totalSpent = clientSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = clientSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  const firstPurchase = new Date(clientSales[clientSales.length - 1].date);
  const lastPurchase = new Date(clientSales[0].date);
  
  container.innerHTML = `
    <div class="client-summary">
      <h4>Resumen del Cliente</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">${clientSales.length}</div>
          <div class="summary-label">Compras</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(totalSpent)}</div>
          <div class="summary-label">Total Gastado</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${totalProducts}</div>
          <div class="summary-label">Productos</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(totalSpent / clientSales.length)}</div>
          <div class="summary-label">Promedio por Compra</div>
        </div>
      </div>
      
      <div class="client-dates">
        <p><strong>Primera compra:</strong> ${firstPurchase.toLocaleDateString('es-PE')}</p>
        <p><strong>Última compra:</strong> ${lastPurchase.toLocaleDateString('es-PE')}</p>
        ${clientFromDB?.phone ? `<p><strong>Teléfono:</strong> ${clientFromDB.phone}</p>` : ''}
      </div>
    </div>
    
    <div class="client-purchase-history">
      <h5>Historial de Compras</h5>
      ${clientSales.slice(0, 10).map(sale => `
        <div class="purchase-item">
          <div class="purchase-info">
            <span class="purchase-date">${formatDate(sale.date)}</span>
            <span class="purchase-items">${sale.items.length} producto${sale.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="purchase-details">
            ${sale.items.slice(0, 2).map(item => `
              <span class="purchase-product">${item.name} (x${item.quantity})</span>
            `).join('')}
            ${sale.items.length > 2 ? `<span class="purchase-more">+${sale.items.length - 2} más</span>` : ''}
          </div>
          <div class="purchase-amount">${formatCurrency(sale.total)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Función auxiliar para nivel de stock
function getStockLevel(quantity, minStock) {
  if (quantity === 0) return 'critical';
  if (quantity <= minStock) return 'low';
  if (quantity <= minStock * 3) return 'medium';
  return 'high';
}