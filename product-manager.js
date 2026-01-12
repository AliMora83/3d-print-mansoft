// Product Manager
// Handles CRUD operations for 3D printed products

// Show add product form
function showAddProductForm() {
  document.getElementById('add-product-form').classList.remove('hidden');
  document.getElementById('product-form').reset();
  document.querySelector('#add-product-form .card-title').textContent = 'Add New Product';
  updateProductFilamentDropdown();

  // Remove any hidden ID input
  const existingIdInput = document.getElementById('edit-product-id');
  if (existingIdInput) existingIdInput.remove();
}

// Edit product
function editProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  showAddProductForm();
  document.querySelector('#add-product-form .card-title').textContent = 'Edit Product';
  updateProductFilamentDropdown();

  const form = document.getElementById('product-form');

  // Add hidden ID input
  let idInput = document.getElementById('edit-product-id');
  if (!idInput) {
    idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'edit-product-id';
    idInput.name = 'id';
    form.appendChild(idInput);
  }
  idInput.value = product.id;

  // Populate form
  form.elements['name'].value = product.name;
  form.elements['category'].value = product.category;
  form.elements['length'].value = product.length || '';
  form.elements['width'].value = product.width || '';
  form.elements['height'].value = product.height || '';
  form.elements['filamentUsed'].value = product.filamentUsed;
  form.elements['printTime'].value = product.printTime;
  form.elements['filamentType'].value = product.filamentType;
  form.elements['infill'].value = product.infill || 15;
  form.elements['layerHeight'].value = product.layerHeight || 0.2;
  form.elements['supportRequired'].value = product.supportRequired;
  form.elements['energyCost'].value = product.energyCost || 0;
  form.elements['laborCost'].value = product.laborCost || 0;
  form.elements['packagingCost'].value = product.packagingCost || 0;
  form.elements['shippingCost'].value = product.shippingCost || 0;
  form.elements['targetPrice'].value = product.targetPrice;
  form.elements['competitorRange'].value = product.competitorRange || '';
  form.elements['notes'].value = product.notes || '';

  // Scroll to form
  document.getElementById('add-product-form').scrollIntoView({ behavior: 'smooth' });
}

// Hide add product form
function hideAddProductForm() {
  document.getElementById('add-product-form').classList.add('hidden');
  const existingIdInput = document.getElementById('edit-product-id');
  if (existingIdInput) existingIdInput.remove();
}

// Calculate Energy Cost
function calculateEnergyCost() {
  const printTime = parseFloat(document.querySelector('input[name="printTime"]').value) || 0;

  if (printTime <= 0) {
    alert('Please enter a valid Print Time first.');
    return;
  }

  // Get settings
  const settings = typeof getSettings === 'function' ? getSettings() : { electricityCost: 2.50, printerPower: 350 };
  const costPerKWh = settings.electricityCost;
  const powerWatts = settings.printerPower;

  // Calculate: Hours * (Watts / 1000) * Cost/kWh
  const energyCost = printTime * (powerWatts / 1000) * costPerKWh;

  // Update input
  const input = document.getElementById('energy-cost-input');
  input.value = energyCost.toFixed(2);

  // Visual feedback
  input.style.borderColor = 'var(--accent-primary)';
  setTimeout(() => {
    input.style.borderColor = '';
  }, 1000);
}

// Save product (from form submission)
function saveProduct(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const id = formData.get('id');

  const product = {
    id: id || generateId(),
    name: formData.get('name'),
    category: formData.get('category'),
    length: parseFloat(formData.get('length') || 0),
    width: parseFloat(formData.get('width') || 0),
    height: parseFloat(formData.get('height') || 0),
    filamentUsed: parseFloat(formData.get('filamentUsed')),
    printTime: parseFloat(formData.get('printTime')),
    filamentType: formData.get('filamentType'),
    infill: parseFloat(formData.get('infill') || 15),
    layerHeight: parseFloat(formData.get('layerHeight') || 0.2),
    supportRequired: formData.get('supportRequired'),
    energyCost: parseFloat(formData.get('energyCost') || 0),
    laborCost: parseFloat(formData.get('laborCost') || 0),
    packagingCost: parseFloat(formData.get('packagingCost') || 0),
    shippingCost: parseFloat(formData.get('shippingCost') || 0),
    targetPrice: parseFloat(formData.get('targetPrice')),
    competitorRange: formData.get('competitorRange') || '',
    notes: formData.get('notes') || '',
    dateAdded: id ? (getProducts().find(p => p.id === id)?.dateAdded || new Date().toISOString()) : new Date().toISOString()
  };

  saveProductData(product);

  // Sync to Google Sheets if configured
  if (typeof syncProductsToSheets === 'function') {
    syncProductsToSheets();
  }

  form.reset();
  hideAddProductForm();
  renderProductsList();
  updateDashboard();
}

// Save product data to localStorage
function saveProductData(product) {
  let products = getProducts();
  const index = products.findIndex(p => p.id === product.id);

  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product); // Add to beginning
  }

  localStorage.setItem('products', JSON.stringify(products));
}

// Delete product
function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(filtered));

  // Sync to Google Sheets if configured
  if (typeof syncProductsToSheets === 'function') {
    syncProductsToSheets();
  }

  renderProductsList();
  updateDashboard();
}

// Render products list
function renderProductsList() {
  const products = getProducts();
  const container = document.getElementById('products-list');

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎨</div>
        <p>No products added yet</p>
        <button class="btn btn-primary" onclick="showAddProductForm()">Add Your First Product</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-2">
      ${products.map(p => renderProductCard(p)).join('')}
    </div>
  `;
}

// Render single product card
function renderProductCard(product) {
  const filaments = getFilaments();
  const filament = filaments.find(f => f.id === product.filamentType);
  const filamentName = filament ? `${filament.material} - ${filament.color}` : 'Unknown';
  const currencySymbol = typeof getSetting === 'function' ? getSetting('currencySymbol') || 'R' : 'R';

  // Calculate costs if filament exists
  let calculations = null;
  if (filament) {
    calculations = calculateCosts(product, filament);
  }

  return `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${product.name}</h3>
          <span class="badge badge-success">${product.category}</span>
        </div>
        <div class="flex gap-1">
            <button class="btn btn-secondary" onclick="editProduct('${product.id}')">✏️</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑️</button>
        </div>
      </div>
      <div>
        <h4 style="font-size: 0.9rem; margin-top: 1rem; color: var(--text-secondary);">Production</h4>
        <table style="width: 100%; font-size: 0.9rem;">
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Filament:</td>
            <td style="text-align: right;">${filamentName}</td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Material Used:</td>
            <td style="text-align: right;"><strong>${product.filamentUsed}g</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Print Time:</td>
            <td style="text-align: right;"><strong>${product.printTime}h</strong></td>
          </tr>
          ${product.length && product.width && product.height ? `
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Dimensions:</td>
            <td style="text-align: right;">${product.length}×${product.width}×${product.height}mm</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Infill:</td>
            <td style="text-align: right;">${product.infill}%</td>
          </tr>
        </table>
        
        ${calculations ? `
        <h4 style="font-size: 0.9rem; margin-top: 1rem; color: var(--text-secondary);">Financials</h4>
        <table style="width: 100%; font-size: 0.9rem;">
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Material Cost:</td>
            <td style="text-align: right;">${currencySymbol}${calculations.materialCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Total Cost:</td>
            <td style="text-align: right;"><strong>${currencySymbol}${calculations.totalCost.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Target Price:</td>
            <td style="text-align: right;"><strong style="color: var(--accent-primary);">${currencySymbol}${product.targetPrice.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Net Profit:</td>
            <td style="text-align: right;"><strong style="color: var(--success);">${currencySymbol}${calculations.netProfit.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Margin:</td>
            <td style="text-align: right;"><strong style="color: var(--success);">${calculations.netMarginPercent.toFixed(1)}%</strong></td>
          </tr>
        </table>
        ` : ''}
        
        ${product.notes ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
            <small style="color: var(--text-tertiary);">${product.notes}</small>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
