// Product Manager
// Handles CRUD operations for 3D printed products using Firestore

// Real-time subscription to products
let productsUnsubscribe = null;

// Initialize real-time listener when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (typeof subscribeToProducts === 'function') {
    productsUnsubscribe = subscribeToProducts((products) => {
      // Store in memory for quick access
      window.cachedProducts = products;
      // Update UI if on products page
      if (document.getElementById('products').classList.contains('active')) {
        renderProductsList();
      }
      // Update dashboard if on dashboard page
      if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
      }
    });
  }
});

// Show add product form
function showAddProductForm() {
  document.getElementById('add-product-form').classList.remove('hidden');
  document.getElementById('product-form').reset();
  updateProductFilamentDropdown();
}

// Hide add product form
function hideAddProductForm() {
  document.getElementById('add-product-form').classList.add('hidden');
}

// Save product (from form submission)
async function saveProduct(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const saveButton = form.querySelector('button[type="submit"]');

  // Disable button and show loading state
  saveButton.disabled = true;
  saveButton.innerHTML = '<i data-lucide="loader"></i> Saving...';

  const product = {
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
    dateAdded: new Date().toISOString()
  };

  try {
    await addProduct(product);

    // Show success toast
    showToast('success', 'Product Added!', `${product.name} has been saved`);

    form.reset();
    hideAddProductForm();
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('error', 'Save Failed', 'Could not save product. Please try again.');
  } finally {
    // Re-enable button
    saveButton.disabled = false;
    saveButton.innerHTML = '<i data-lucide="save"></i> Save Product';
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// Delete product
async function deleteProductHandler(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  const products = getProducts();
  const deletedProduct = products.find(p => p.id === id);

  try {
    // Call Firestore service to delete
    await deleteProductFromFirestore(id);

    // Show success toast
    if (deletedProduct) {
      showToast('success', 'Product Deleted', `${deletedProduct.name} removed`);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('error', 'Delete Failed', 'Could not delete product. Please try again.');
  }
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
    <div class="grid grid-3">
      ${products.map(p => renderProductCard(p)).join('')}
    </div>
  `;

  // Re-initialize Lucide icons for dynamically added content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Render single product card
function renderProductCard(product) {
  const filaments = getFilaments();
  const filament = filaments.find(f => f.id === product.filamentType);
  const filamentName = filament ? `${filament.material} - ${filament.color}` : 'Unknown';

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
        <button class="btn btn-danger" onclick="deleteProductHandler('${product.id}')"><i data-lucide="trash-2"></i></button>
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
            <td style="text-align: right;">R${calculations.materialCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Total Cost:</td>
            <td style="text-align: right;"><strong>R${calculations.totalCost.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Target Price:</td>
            <td style="text-align: right;"><strong style="color: var(--accent-primary);">R${product.targetPrice.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Net Profit:</td>
            <td style="text-align: right;"><strong style="color: var(--success);">R${calculations.netProfit.toFixed(2)}</strong></td>
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

// Helper function to get products from cache or localStorage fallback
function getProducts() {
  // Try to get from real-time cache first
  if (window.cachedProducts) {
    return window.cachedProducts;
  }

  // Fallback to localStorage during migration
  return JSON.parse(localStorage.getItem('products') || '[]');
}
