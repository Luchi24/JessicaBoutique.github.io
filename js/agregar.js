// Agregar Producto Functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('addProductForm')) {
    setupAddProductForm();
  }
});

function setupAddProductForm() {
  populateAddProductForm();
  setupCombinationToggle();
  setupFormSubmission();
  
  // Verificar si estamos editando un producto
  const urlParams = new URLSearchParams(window.location.search);
  const editProductId = urlParams.get('edit');
  if (editProductId) {
    loadProductForEditing(editProductId);
  }
}

function populateAddProductForm() {
  const categorySelect = document.getElementById('productCategory');
  const sizeSelect = document.getElementById('productSize');
  const colorSelect = document.getElementById('productColor');
  const colorPreview = document.getElementById('colorPreview');
  
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
      appState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  
  if (sizeSelect) {
    sizeSelect.innerHTML = '<option value="">Sin talla específica</option>' +
      appState.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
  }
  
  if (colorSelect) {
    colorSelect.innerHTML = '<option value="">Sin color específico</option>' +
      appState.colors.map(color => `<option value="${color.hex}">${color.name}</option>`).join('');
    
    colorSelect.addEventListener('change', () => {
      const selectedColor = colorSelect.value;
      if (colorPreview) {
        colorPreview.style.backgroundColor = selectedColor || 'transparent';
      }
    });
  }
  
  if (colorPreview) {
    colorPreview.style.backgroundColor = 'transparent';
  }
}

function setupCombinationToggle() {
  const addCombinationCheckbox = document.getElementById('addCombination');
  const combinationsContainer = document.getElementById('combinationsContainer');
  const addCombinationBtn = document.getElementById('addCombinationBtn');
  
  if (!addCombinationCheckbox || !combinationsContainer || !addCombinationBtn) return;
  
  addCombinationCheckbox.addEventListener('change', () => {
    if (addCombinationCheckbox.checked) {
      combinationsContainer.style.display = 'block';
      addCombinationBtn.style.display = 'block';
    } else {
      combinationsContainer.style.display = 'none';
      addCombinationBtn.style.display = 'none';
      combinationsContainer.innerHTML = '';
    }
  });
  
  addCombinationBtn.addEventListener('click', () => {
    addCombinationRow();
  });
}

function addCombinationRow() {
  const container = document.getElementById('combinationsContainer');
  if (!container) return;
  
  const combinationId = generateId('comb_');
  
  const combinationRow = document.createElement('div');
  combinationRow.className = 'combination-item';
  combinationRow.id = combinationId;
  
  combinationRow.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Talla</label>
        <select class="combination-size">
          <option value="">Sin talla</option>
          ${appState.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Color</label>
        <select class="combination-color">
          <option value="">Sin color</option>
          ${appState.colors.map(color => `<option value="${color.hex}">${color.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Cantidad</label>
        <input type="number" class="combination-quantity" min="0" value="1">
      </div>
      <div class="form-group">
        <label>Precio (S/)</label>
        <input type="number" class="combination-price" step="0.01" min="0" placeholder="Precio">
      </div>
    </div>
    <button type="button" class="remove-combination" data-id="${combinationId}">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(combinationRow);
  
  combinationRow.querySelector('.remove-combination').addEventListener('click', () => {
    combinationRow.remove();
  });
}

function setupFormSubmission() {
  const form = document.getElementById('addProductForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productName = document.getElementById('productName')?.value.trim() || '';
    const productCategory = document.getElementById('productCategory')?.value || '';
    const productPrice = parseFloat(document.getElementById('productPrice')?.value || 0);
    const productCost = parseFloat(document.getElementById('productCost')?.value || 0);
    const productQuantity = parseInt(document.getElementById('productQuantity')?.value || 0);
    const productMinStock = parseInt(document.getElementById('productMinStock')?.value || 5);
    const productSize = document.getElementById('productSize')?.value || null;
    const productColor = document.getElementById('productColor')?.value || null;
    const addCombination = document.getElementById('addCombination')?.checked || false;
    
    if (!productName || !productCategory || isNaN(productPrice) || isNaN(productCost) || isNaN(productQuantity)) {
      showNotification('Por favor complete todos los campos requeridos', 'error');
      return;
    }
    
    // Verificar si estamos editando
    const urlParams = new URLSearchParams(window.location.search);
    const editProductId = urlParams.get('edit');
    
    if (addCombination) {
      const combinationElements = document.querySelectorAll('.combination-item');
      if (combinationElements.length === 0) {
        showNotification('Debe agregar al menos una combinación', 'error');
        return;
      }
      
      let hasError = false;
      combinationElements.forEach((element, index) => {
        const size = element.querySelector('.combination-size')?.value || null;
        const color = element.querySelector('.combination-color')?.value || null;
        const quantity = parseInt(element.querySelector('.combination-quantity')?.value || 0);
        const price = element.querySelector('.combination-price')?.value ? 
          parseFloat(element.querySelector('.combination-price').value) : productPrice;
        
        if (isNaN(quantity)) {
          hasError = true;
          return;
        }
        
        const combinationProduct = {
          id: generateId('prod_'),
          name: productName,
          category: productCategory,
          price: price,
          cost: productCost,
          quantity: quantity,
          minStock: productMinStock,
          size: size,
          color: color,
          description: `Combinación ${index + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        appState.products.push(combinationProduct);
      });
      
      if (hasError) {
        showNotification('Error en las combinaciones. Verifique los datos.', 'error');
        return;
      }
    } else {
      const newProduct = {
        id: editProductId || generateId('prod_'),
        name: productName,
        category: productCategory,
        price: productPrice,
        cost: productCost,
        quantity: productQuantity,
        minStock: productMinStock,
        size: productSize,
        color: productColor,
        createdAt: editProductId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (editProductId) {
        // Actualizar producto existente
        const index = appState.products.findIndex(p => p.id === editProductId);
        if (index !== -1) {
          newProduct.createdAt = appState.products[index].createdAt;
          appState.products[index] = newProduct;
        }
      } else {
        appState.products.push(newProduct);
      }
    }
    
    saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
    
    if (editProductId) {
      showNotification('Producto actualizado correctamente', 'success');
      addActivity('product', `Producto "${productName}" actualizado en el inventario`);
    } else {
      showNotification('Producto(s) agregado(s) correctamente', 'success');
      addActivity('product', `Producto "${productName}" agregado al inventario`);
    }
    
    form.reset();
    if (document.getElementById('colorPreview')) {
      document.getElementById('colorPreview').style.backgroundColor = 'transparent';
    }
    if (document.getElementById('addCombination')) {
      document.getElementById('addCombination').checked = false;
    }
    const combinationsContainer = document.getElementById('combinationsContainer');
    if (combinationsContainer) {
      combinationsContainer.style.display = 'none';
      combinationsContainer.innerHTML = '';
    }
    
    updateDashboardStats();
    
    // Redirigir al inventario después de 2 segundos
    setTimeout(() => {
      window.location.href = 'inventario.html';
    }, 2000);
  });
}

function loadProductForEditing(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    setTimeout(() => {
      window.location.href = 'agregar-producto.html';
    }, 2000);
    return;
  }
  
  // Llenar el formulario con los datos del producto
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCost').value = product.cost;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productMinStock').value = product.minStock || 5;
  
  if (product.size) {
    document.getElementById('productSize').value = product.size;
  }
  
  if (product.color) {
    document.getElementById('productColor').value = product.color;
    document.getElementById('colorPreview').style.backgroundColor = product.color;
  }
  
  // Cambiar el título y texto del botón
  document.querySelector('.section-header h2').innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
  document.querySelector('.section-header p').textContent = 'Modifica los datos del producto seleccionado';
  document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
}