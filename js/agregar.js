// Agregar Producto - Jessica Boutique

let combinations = [];
let productImage = null;

function setupAddProductForm() {
  populateFormSelects();
  setupCombinationToggle();
  setupImageUpload();
  setupFormValidation();
  setupFormSubmission();
  loadEditProduct();
}

function populateFormSelects() {
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
        colorPreview.style.borderColor = selectedColor ? '#ccc' : '#ddd';
      }
    });
    
    if (colorPreview) {
      colorPreview.style.backgroundColor = 'transparent';
    }
  }
  
  // Material selector
  const materialContainer = document.getElementById('materialSelector');
  if (materialContainer) {
    materialContainer.innerHTML = `
      <div class="material-selector">
        ${CLOTHING_MATERIALS.map(material => `
          <div class="material-option" data-material="${material}">
            ${material}
          </div>
        `).join('')}
      </div>
    `;
    
    materialContainer.querySelectorAll('.material-option').forEach(option => {
      option.addEventListener('click', () => {
        materialContainer.querySelectorAll('.material-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');
        document.getElementById('productMaterial').value = option.dataset.material;
      });
    });
  }
  
  // Season selector
  const seasonContainer = document.getElementById('seasonSelector');
  if (seasonContainer) {
    seasonContainer.innerHTML = `
      <div class="season-tags">
        ${SEASONS.map(season => `
          <span class="season-tag" data-season="${season}">
            ${season}
          </span>
        `).join('')}
      </div>
    `;
    
    seasonContainer.querySelectorAll('.season-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
        updateSelectedSeasons();
      });
    });
  }
}

function setupCombinationToggle() {
  const addCombinationCheckbox = document.getElementById('addCombination');
  const combinationsContainer = document.getElementById('combinationsContainer');
  const addCombinationBtn = document.getElementById('addCombinationBtn');
  
  if (addCombinationCheckbox && combinationsContainer && addCombinationBtn) {
    addCombinationCheckbox.addEventListener('change', () => {
      if (addCombinationCheckbox.checked) {
        combinationsContainer.style.display = 'block';
        addCombinationBtn.style.display = 'block';
      } else {
        combinationsContainer.style.display = 'none';
        addCombinationBtn.style.display = 'none';
        combinations = [];
        updateCombinationsList();
      }
    });
    
    addCombinationBtn.addEventListener('click', () => {
      addCombinationRow();
    });
  }
}

function addCombinationRow() {
  const combination = {
    id: generateId('comb_'),
    size: '',
    color: '',
    quantity: 1,
    price: 0
  };
  
  combinations.push(combination);
  updateCombinationsList();
}

function updateCombinationsList() {
  const combinationsList = document.getElementById('combinationsList');
  if (!combinationsList) return;
  
  if (combinations.length === 0) {
    combinationsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-layer-group"></i>
        <p>No hay combinaciones agregadas</p>
        <small>Agrega combinaciones para productos con múltiples tallas/colores</small>
      </div>
    `;
    return;
  }
  
  combinationsList.innerHTML = combinations.map((comb, index) => `
    <div class="combination-row" data-id="${comb.id}">
      <div class="combination-row-header">
        <div class="combination-number">
          <i class="fas fa-layer-group"></i> Combinación ${index + 1}
        </div>
        <button type="button" class="remove-combination" data-id="${comb.id}">
          <i class="fas fa-times"></i> Eliminar
        </button>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Talla</label>
          <select class="combination-size" data-id="${comb.id}">
            <option value="">Sin talla</option>
            ${appState.sizes.map(size => 
              `<option value="${size}" ${comb.size === size ? 'selected' : ''}>${size}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Color</label>
          <select class="combination-color" data-id="${comb.id}">
            <option value="">Sin color</option>
            ${appState.colors.map(color => 
              `<option value="${color.hex}" ${comb.color === color.hex ? 'selected' : ''}>${color.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Cantidad</label>
          <input type="number" class="combination-quantity" data-id="${comb.id}" 
                 min="0" value="${comb.quantity}">
        </div>
        
        <div class="form-group">
          <label>Precio (S/)</label>
          <input type="number" class="combination-price" data-id="${comb.id}" 
                 step="0.01" min="0" placeholder="Precio" 
                 value="${comb.price > 0 ? comb.price : ''}">
        </div>
      </div>
    </div>
  `).join('');
  
  attachCombinationListeners();
}

function attachCombinationListeners() {
  // Size changes
  document.querySelectorAll('.combination-size').forEach(select => {
    select.addEventListener('change', (e) => {
      const combId = e.target.dataset.id;
      const combination = combinations.find(c => c.id === combId);
      if (combination) {
        combination.size = e.target.value;
      }
    });
  });
  
  // Color changes
  document.querySelectorAll('.combination-color').forEach(select => {
    select.addEventListener('change', (e) => {
      const combId = e.target.dataset.id;
      const combination = combinations.find(c => c.id === combId);
      if (combination) {
        combination.color = e.target.value;
      }
    });
  });
  
  // Quantity changes
  document.querySelectorAll('.combination-quantity').forEach(input => {
    input.addEventListener('change', (e) => {
      const combId = e.target.dataset.id;
      const combination = combinations.find(c => c.id === combId);
      if (combination) {
        combination.quantity = parseInt(e.target.value) || 0;
      }
    });
  });
  
  // Price changes
  document.querySelectorAll('.combination-price').forEach(input => {
    input.addEventListener('change', (e) => {
      const combId = e.target.dataset.id;
      const combination = combinations.find(c => c.id === combId);
      if (combination) {
        combination.price = parseFloat(e.target.value) || 0;
      }
    });
  });
  
  // Remove combination
  document.querySelectorAll('.remove-combination').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const combId = e.currentTarget.dataset.id;
      combinations = combinations.filter(c => c.id !== combId);
      updateCombinationsList();
    });
  });
}

function setupImageUpload() {
  const selectImageBtn = document.getElementById('selectImageBtn');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const productImageInput = document.getElementById('productImage');
  const imagePreview = document.getElementById('imagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  
  if (!selectImageBtn || !productImageInput) return;
  
  selectImageBtn.addEventListener('click', () => {
    productImageInput.click();
  });
  
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      productImage = null;
      productImageInput.value = '';
      updateImagePreview(null);
    });
  }
  
  productImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona una imagen válida', 'error');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showNotification('La imagen no debe superar los 2MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        productImage = event.target.result;
        updateImagePreview(productImage);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Drag and drop
  if (imagePreview) {
    imagePreview.addEventListener('dragover', (e) => {
      e.preventDefault();
      imagePreview.classList.add('dragover');
    });
    
    imagePreview.addEventListener('dragleave', () => {
      imagePreview.classList.remove('dragover');
    });
    
    imagePreview.addEventListener('drop', (e) => {
      e.preventDefault();
      imagePreview.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) {
          showNotification('La imagen no debe superar los 2MB', 'error');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          productImage = event.target.result;
          updateImagePreview(productImage);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function updateImagePreview(imageData) {
  const imagePreview = document.getElementById('imagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const selectImageBtn = document.getElementById('selectImageBtn');
  
  if (!imagePreview) return;
  
  if (imageData) {
    imagePreview.innerHTML = `
      <img src="${imageData}" alt="Vista previa del producto">
      <button type="button" class="remove-image-btn" id="removeImageBtn2">
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    document.getElementById('removeImageBtn2')?.addEventListener('click', () => {
      productImage = null;
      document.getElementById('productImage').value = '';
      updateImagePreview(null);
    });
    
    if (removeImageBtn) removeImageBtn.style.display = 'block';
    if (selectImageBtn) selectImageBtn.textContent = 'Cambiar Imagen';
  } else {
    imagePreview.innerHTML = `
      <i class="fas fa-image"></i>
      <p>Arrastra una imagen o haz clic para seleccionar</p>
      <small>Recomendado: 800x600px, máximo 2MB</small>
    `;
    
    if (removeImageBtn) removeImageBtn.style.display = 'none';
    if (selectImageBtn) selectImageBtn.textContent = 'Seleccionar Imagen';
  }
}

function setupFormValidation() {
  const form = document.getElementById('addProductForm');
  if (!form) return;
  
  // Real-time validation
  const validateField = (field, validationFn) => {
    field.addEventListener('blur', () => {
      validationFn(field);
    });
    
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errorElement = field.parentElement.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    });
  };
  
  // Required fields
  const requiredFields = ['productName', 'productCategory', 'productPrice', 'productCost', 'productQuantity'];
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      validateField(field, (f) => {
        if (!f.value.trim()) {
          showFieldError(f, 'Este campo es obligatorio');
        }
      });
    }
  });
  
  // Numeric validation
  const numericFields = ['productPrice', 'productCost', 'productQuantity', 'productMinStock'];
  numericFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      validateField(field, (f) => {
        if (f.value && (parseFloat(f.value) < 0 || isNaN(parseFloat(f.value)))) {
          showFieldError(f, 'Ingrese un valor válido');
        }
      });
    }
  });
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  field.parentElement.appendChild(errorElement);
}

function updateSelectedSeasons() {
  const selectedSeasons = Array.from(document.querySelectorAll('.season-tag.selected'))
    .map(tag => tag.dataset.season);
  
  document.getElementById('productSeasons').value = JSON.stringify(selectedSeasons);
}

function setupFormSubmission() {
  const form = document.getElementById('addProductForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    const isEditMode = document.getElementById('editProductId')?.value;
    const productData = collectProductData();
    
    try {
      if (isEditMode) {
        await updateProduct(productData);
      } else {
        await saveProduct(productData);
      }
      
      showNotification(
        isEditMode ? 'Producto actualizado correctamente' : 'Producto agregado correctamente',
        'success'
      );
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        form.reset();
        combinations = [];
        productImage = null;
        updateCombinationsList();
        updateImagePreview(null);
        document.getElementById('colorPreview').style.backgroundColor = 'transparent';
        document.getElementById('addCombination').checked = false;
        document.getElementById('combinationsContainer').style.display = 'none';
        
        // Reset material and season selections
        document.querySelectorAll('.material-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        document.querySelectorAll('.season-tag').forEach(tag => {
          tag.classList.remove('selected');
        });
      }
      
      // Redirect to inventory after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'inventario.html';
      }, 1500);
      
    } catch (error) {
      showNotification('Error al guardar el producto: ' + error.message, 'error');
    }
  });
}

function validateForm() {
  let isValid = true;
  
  // Check required fields
  const requiredFields = ['productName', 'productCategory', 'productPrice', 'productCost', 'productQuantity'];
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && !field.value.trim()) {
      showFieldError(field, 'Este campo es obligatorio');
      isValid = false;
    }
  });
  
  // Check numeric fields
  const numericFields = ['productPrice', 'productCost', 'productQuantity'];
  numericFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && field.value) {
      const value = parseFloat(field.value);
      if (isNaN(value) || value < 0) {
        showFieldError(field, 'Ingrese un valor válido');
        isValid = false;
      }
    }
  });
  
  // Check combinations if enabled
  const addCombination = document.getElementById('addCombination')?.checked;
  if (addCombination && combinations.length === 0) {
    showNotification('Debe agregar al menos una combinación', 'error');
    isValid = false;
  }
  
  return isValid;
}

function collectProductData() {
  const addCombination = document.getElementById('addCombination')?.checked;
  
  const baseProduct = {
    id: document.getElementById('editProductId')?.value || generateId('prod_'),
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    description: document.getElementById('productDescription')?.value.trim() || '',
    price: parseFloat(document.getElementById('productPrice').value),
    cost: parseFloat(document.getElementById('productCost').value),
    quantity: parseInt(document.getElementById('productQuantity').value),
    minStock: parseInt(document.getElementById('productMinStock')?.value || 5),
    size: document.getElementById('productSize')?.value || null,
    color: document.getElementById('productColor')?.value || null,
    material: document.getElementById('productMaterial')?.value || null,
    seasons: JSON.parse(document.getElementById('productSeasons')?.value || '[]'),
    image: productImage,
    createdAt: document.getElementById('editProductId')?.value ? 
      appState.products.find(p => p.id === document.getElementById('editProductId').value)?.createdAt || new Date().toISOString() : 
      new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (addCombination) {
    return combinations.map((comb, index) => ({
      ...baseProduct,
      id: generateId('prod_'),
      size: comb.size || null,
      color: comb.color || null,
      quantity: comb.quantity,
      price: comb.price > 0 ? comb.price : baseProduct.price,
      description: baseProduct.description + (comb.size || comb.color ? 
        ` (Combinación ${index + 1}${comb.size ? ` - Talla: ${comb.size}` : ''}${comb.color ? ` - Color: ${appState.colors.find(c => c.hex === comb.color)?.name || comb.color}` : ''})` : ''),
      isCombination: true,
      parentId: baseProduct.id
    }));
  } else {
    return [baseProduct];
  }
}

async function saveProduct(productDataArray) {
  productDataArray.forEach(product => {
    appState.products.push(product);
  });
  
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  
  const mainProduct = productDataArray[0];
  addActivity('product', `Producto "${mainProduct.name}" agregado al inventario`);
  
  if (productDataArray.length > 1) {
    addActivity('product', `${productDataArray.length} variaciones de producto agregadas`);
  }
}

async function updateProduct(productDataArray) {
  const productId = document.getElementById('editProductId').value;
  
  // Remove old product(s)
  appState.products = appState.products.filter(p => 
    p.id !== productId && p.parentId !== productId
  );
  
  // Add updated product(s)
  productDataArray.forEach(product => {
    appState.products.push(product);
  });
  
  saveToStorage(STORAGE_KEYS.PRODUCTS, appState.products);
  
  const mainProduct = productDataArray[0];
  addActivity('product', `Producto "${mainProduct.name}" actualizado`);
}

function loadEditProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('edit');
  
  if (!productId) return;
  
  const product = appState.products.find(p => p.id === productId);
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    window.location.href = 'agregar-producto.html';
    return;
  }
  
  // Fill form with product data
  document.getElementById('editProductId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCost').value = product.cost || 0;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productMinStock').value = product.minStock || 5;
  
  if (product.size) {
    document.getElementById('productSize').value = product.size;
  }
  
  if (product.color) {
    document.getElementById('productColor').value = product.color;
    const colorPreview = document.getElementById('colorPreview');
    if (colorPreview) {
      colorPreview.style.backgroundColor = product.color;
      colorPreview.style.borderColor = '#ccc';
    }
  }
  
  if (product.material) {
    document.getElementById('productMaterial').value = product.material;
    const materialOption = document.querySelector(`.material-option[data-material="${product.material}"]`);
    if (materialOption) {
      materialOption.classList.add('selected');
    }
  }
  
  if (product.seasons && product.seasons.length > 0) {
    product.seasons.forEach(season => {
      const seasonTag = document.querySelector(`.season-tag[data-season="${season}"]`);
      if (seasonTag) {
        seasonTag.classList.add('selected');
      }
    });
    updateSelectedSeasons();
  }
  
  if (product.image) {
    productImage = product.image;
    updateImagePreview(productImage);
  }
  
  // Update form title
  const formTitle = document.querySelector('.section-header h2');
  if (formTitle) {
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
  }
  
  const formSubtitle = document.querySelector('.section-header p');
  if (formSubtitle) {
    formSubtitle.textContent = 'Actualiza la información del producto';
  }
  
  // Load combinations if this product has variations
  const productVariations = appState.products.filter(p => p.parentId === productId);
  if (productVariations.length > 0) {
    document.getElementById('addCombination').checked = true;
    document.getElementById('combinationsContainer').style.display = 'block';
    
    combinations = productVariations.map(variation => ({
      id: generateId('comb_'),
      size: variation.size || '',
      color: variation.color || '',
      quantity: variation.quantity,
      price: variation.price
    }));
    
    updateCombinationsList();
  }
}