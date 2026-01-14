// Settings Manager
// Handles global application settings and data import/export

const DEFAULT_SETTINGS = {
    currencySymbol: 'R',
    electricityCost: 2.50, // Cost per kWh
    printerPower: 350 // Watts
};

// Initialize settings
function initializeSettings() {
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
    }
}

// Get all settings
function getSettings() {
    const stored = JSON.parse(localStorage.getItem('settings') || '{}');
    return { ...DEFAULT_SETTINGS, ...stored };
}

// Get single setting
function getSetting(key) {
    const settings = getSettings();
    return settings[key];
}

// Save settings
function saveSettings(event) {
    if (event) event.preventDefault();

    const form = document.getElementById('settings-form');
    if (!form) return;

    const formData = new FormData(form);
    const newSettings = {
        currencySymbol: formData.get('currencySymbol'),
        electricityCost: parseFloat(formData.get('electricityCost')),
        printerPower: parseFloat(formData.get('printerPower'))
    };

    localStorage.setItem('settings', JSON.stringify(newSettings));

    // Show feedback
    alert('Settings saved successfully!');

    // Refresh app to apply changes (simple way to update currency symbols everywhere)
    // In a more complex app we might use an event bus
    updateDashboard();
}

// Load settings into form
function loadSettingsToForm() {
    const settings = getSettings();
    const form = document.getElementById('settings-form');
    if (!form) return;

    form.elements['currencySymbol'].value = settings.currencySymbol;
    form.elements['electricityCost'].value = settings.electricityCost;
    form.elements['printerPower'].value = settings.printerPower;
}

// Export data to JSON file
function exportData() {
    const data = {
        settings: getSettings(),
        filaments: JSON.parse(localStorage.getItem('filaments') || '[]'),
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `3d_print_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Validate structure roughly
            if (data.filaments && Array.isArray(data.filaments)) {
                if (confirm(`Found ${data.filaments.length} filaments and ${data.products.length} products. This will OVERWRITE your current data. Continue?`)) {
                    localStorage.setItem('filaments', JSON.stringify(data.filaments));
                    localStorage.setItem('products', JSON.stringify(data.products));
                    if (data.settings) {
                        localStorage.setItem('settings', JSON.stringify(data.settings));
                    }

                    alert('Data imported successfully!');
                    location.reload(); // Reload to refresh everything
                }
            } else {
                alert('Invalid data file format.');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
}
