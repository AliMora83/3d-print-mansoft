// Filament Manager
// Handles CRUD operations for filament spools

// Show add filament form
function showAddFilamentForm() {
  document.getElementById('add-filament-form').classList.remove('hidden');
  document.getElementById('filament-form').reset();
  document.querySelector('#add-filament-form .card-title').textContent = 'Add New Filament Spool';

  // Remove any hidden ID input
  const existingIdInput = document.getElementById('edit-filament-id');
  if (existingIdInput) existingIdInput.remove();
}

// Edit filament
function editFilament(id) {
  const filaments = getFilaments();
  const filament = filaments.find(f => f.id === id);
  if (!filament) return;

  showAddFilamentForm();
  document.querySelector('#add-filament-form .card-title').textContent = 'Edit Filament Spool';

  const form = document.getElementById('filament-form');

  // Add hidden ID input
  let idInput = document.getElementById('edit-filament-id');
  if (!idInput) {
    idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'edit-filament-id';
    idInput.name = 'id';
    form.appendChild(idInput);
  }
  idInput.value = filament.id;

  // Populate form
  form.elements['material'].value = filament.material;
  form.elements['color'].value = filament.color;
  form.elements['spoolSize'].value = filament.spoolSize;
  form.elements['price'].value = filament.price;
  form.elements['diameter'].value = filament.diameter;
  form.elements['supplier'].value = filament.supplier || '';
  form.elements['tempRange'].value = filament.tempRange || '';
  form.elements['waste'].value = filament.waste || 5;
  form.elements['notes'].value = filament.notes || '';

  // Scroll to form
  document.getElementById('add-filament-form').scrollIntoView({ behavior: 'smooth' });
}

// Hide add filament form
function hideAddFilamentForm() {
  document.getElementById('add-filament-form').classList.add('hidden');
  const existingIdInput = document.getElementById('edit-filament-id');
  if (existingIdInput) existingIdInput.remove();
}

// Save filament (from form submission)
function saveFilament(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const id = formData.get('id');

  const filament = {
    id: id || generateId(),
    material: formData.get('material'),
    color: formData.get('color'),
    spoolSize: parseFloat(formData.get('spoolSize')),
    price: parseFloat(formData.get('price')),
    diameter: formData.get('diameter'),
    supplier: formData.get('supplier') || '',
    tempRange: formData.get('tempRange') || '',
    waste: parseFloat(formData.get('waste') || 5),
    notes: formData.get('notes') || '',
    dateAdded: id ? (getFilaments().find(f => f.id === id)?.dateAdded || new Date().toISOString()) : new Date().toISOString()
  };

  // Calculate cost per gram
  filament.costPerGram = filament.price / filament.spoolSize;

  saveFilamentData(filament);

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
  let filaments = getFilaments();
  const index = filaments.findIndex(f => f.id === filament.id);

  if (index >= 0) {
    filaments[index] = filament;
  } else {
    filaments.unshift(filament); // Add to beginning
  }

  localStorage.setItem('filaments', JSON.stringify(filaments));
}

// Delete filament
function deleteFilament(id) {
  if (!confirm('Are you sure you want to delete this filament?')) {
    return;
  }

  const filaments = getFilaments();
  const filtered = filaments.filter(f => f.id !== id);
  localStorage.setItem('filaments', JSON.stringify(filtered));

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
    <div class="grid grid-2">
      ${filaments.map(f => renderFilamentCard(f)).join('')}
    </div>
  `;
}

// Render single filament card
function renderFilamentCard(filament) {
  const currencySymbol = typeof getSetting === 'function' ? getSetting('currencySymbol') || 'R' : 'R';

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${filament.material} - ${filament.color}</h3>
        <div class="flex gap-1">
            <button class="btn btn-secondary" onclick="editFilament('${filament.id}')">✏️</button>
            <button class="btn btn-danger" onclick="deleteFilament('${filament.id}')">🗑️</button>
        </div>
      </div>
      <div>
        <table style="width: 100%; font-size: 0.9rem;">
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Spool Size:</td>
            <td style="text-align: right;"><strong>${filament.spoolSize}g</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Purchase Price:</td>
            <td style="text-align: right;"><strong>${currencySymbol}${filament.price.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="color: var(--text-tertiary); padding: 0.25rem 0;">Cost per Gram:</td>
            <td style="text-align: right;"><strong>${currencySymbol}${filament.costPerGram.toFixed(2)}</strong></td>
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
