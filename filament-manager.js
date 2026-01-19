// Filament Manager
// Handles CRUD operations for filament spools

// Show add filament form
function showAddFilamentForm() {
  document.getElementById('add-filament-form').classList.remove('hidden');
  document.getElementById('filament-form').reset();
}

// Hide add filament form
function hideAddFilamentForm() {
  document.getElementById('add-filament-form').classList.add('hidden');
}

// Save filament (from form submission)
function saveFilament(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const filament = {
    id: generateId(),
    material: formData.get('material'),
    color: formData.get('color'),
    spoolSize: parseFloat(formData.get('spoolSize')),
    price: parseFloat(formData.get('price')),
    diameter: formData.get('diameter'),
    supplier: formData.get('supplier') || '',
    tempRange: formData.get('tempRange') || '',
    waste: parseFloat(formData.get('waste') || 5),
    notes: formData.get('notes') || '',
    dateAdded: new Date().toISOString()
  };

  // Calculate cost per gram
  filament.costPerGram = filament.price / filament.spoolSize;

  saveFilamentData(filament);

  // Show success toast
  showToast('success', 'Filament Added!', `${filament.material} - ${filament.color} has been saved`);

  // Sync to Google Sheets if configured
  if (typeof syncFilamentsToSheets === 'function') {
    syncFilamentsToSheets();
  }

  form.reset();
  hideAddFilamentForm();
  renderFilamentsList();
  updateDashboard();
}

// Save filament data to localStorage
function saveFilamentData(filament) {
  const filaments = getFilaments();
  filaments.unshift(filament); // Add to beginning
  localStorage.setItem('filaments', JSON.stringify(filaments));
}

// Delete filament
function deleteFilament(id) {
  if (!confirm('Are you sure you want to delete this filament?')) {
    return;
  }

  const filaments = getFilaments();
  const deletedFilament = filaments.find(f => f.id === id);
  const filtered = filaments.filter(f => f.id !== id);
  localStorage.setItem('filaments', JSON.stringify(filtered));

  // Show success toast
  if (deletedFilament) {
    showToast('success', 'Filament Deleted', `${deletedFilament.material} - ${deletedFilament.color} removed`);
  }

  // Sync to Google Sheets if configured
  if (typeof syncFilamentsToSheets === 'function') {
    syncFilamentsToSheets();
  }

  renderFilamentsList();
  updateDashboard();
}

// Render filaments list
function renderFilamentsList() {
  const filaments = getFilaments();
  const container = document.getElementById('filaments-list');

  if (filaments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>No filament spools added yet</p>
        <button class="btn btn-primary" onclick="showAddFilamentForm()">Add Your First Filament</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-3">
      ${filaments.map(f => renderFilamentCard(f)).join('')}
    </div>
  `;

  // Re-initialize Lucide icons for dynamically added content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Render single filament card
function renderFilamentCard(filament) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${filament.material} - ${filament.color}</h3>
        <button class="btn btn-danger" onclick="deleteFilament('${filament.id}')"><i data-lucide="trash-2"></i></button>
      </div>
      <div>
        <table style="width: 100%; font-size: 0.9rem;">
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Spool Size:</td>
            <td style="text-align: right;"><strong>${filament.spoolSize}g</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Purchase Price:</td>
            <td style="text-align: right;"><strong>R${filament.price.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Cost per Gram:</td>
            <td style="text-align: right;"><strong>R${filament.costPerGram.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Diameter:</td>
            <td style="text-align: right;">${filament.diameter}mm</td>
          </tr>
          ${filament.supplier ? `
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Supplier:</td>
            <td style="text-align: right;">${filament.supplier}</td>
          </tr>
          ` : ''}
          ${filament.tempRange ? `
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Temp Range:</td>
            <td style="text-align: right;">${filament.tempRange}°C</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Waste:</td>
            <td style="text-align: right;">${filament.waste}%</td>
          </tr>
        </table>
        ${filament.notes ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
            <small style="color: var(--text-tertiary);">${filament.notes}</small>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Update product filament dropdown
function updateProductFilamentDropdown() {
  const filaments = getFilaments();
  const select = document.getElementById('product-filament-type');

  select.innerHTML = '<option value="">Select filament...</option>' +
    filaments.map(f => `
      <option value="${f.id}">${f.material} - ${f.color} (${f.spoolSize}g)</option>
    `).join('');
}
