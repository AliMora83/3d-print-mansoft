// Main Application Controller
// Handles navigation, initialization, and data persistence

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupNavigation();
    setupMobileMenu();
    loadSampleData();
    updateDashboard();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Enable Google Sheets auto-sync if configured
    if (typeof enableAutoSync === 'function') {
        enableAutoSync();
    }
});

// Initialize application
function initializeApp() {
    console.log('3D Print ManSoft initialized');

    // Check if localStorage is available
    if (!localStorage.getItem('filaments')) {
        localStorage.setItem('filaments', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
}

// Setup navigation between sections
function setupNavigation() {
    const navButtons = document.querySelectorAll('.sidebar-nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionName = btn.dataset.section;
            navigateTo(sectionName);

            // Close mobile menu after navigation
            closeMobileMenu();
        });
    });
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            toggleMobileMenu();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            closeMobileMenu();
        });
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Close mobile menu
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// Navigate to a specific section
function navigateTo(sectionName) {
    // Update active nav button
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });

    // Update active section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Refresh data for the section
    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'filaments') {
        renderFilamentsList();
    } else if (sectionName === 'products') {
        renderProductsList();
        updateProductFilamentDropdown();
    } else if (sectionName === 'reports') {
        updateReportDropdowns();
    }
}

// Update dashboard statistics
function updateDashboard() {
    const filaments = getFilaments();
    const products = getProducts();

    // Update stats
    document.getElementById('stat-filaments').textContent = filaments.length;
    document.getElementById('stat-products').textContent = products.length;

    // Calculate total inventory value
    const totalValue = filaments.reduce((sum, f) => sum + parseFloat(f.price || 0), 0);
    document.getElementById('stat-total-value').textContent = `R${totalValue.toFixed(2)}`;

    // Calculate average margin (if products exist)
    if (products.length > 0) {
        let validMargins = 0;
        const totalMargin = products.reduce((sum, p) => {
            const filament = filaments.find(f => f.id === p.filamentType);
            if (filament && filament.costPerGram) {
                const calc = calculateCosts(p, filament);
                if (!isNaN(calc.grossMarginPercent)) {
                    validMargins++;
                    return sum + calc.grossMarginPercent;
                }
            }
            return sum;
        }, 0);

        if (validMargins > 0) {
            const avgMargin = totalMargin / validMargins;
            document.getElementById('stat-avg-margin').textContent = `${avgMargin.toFixed(1)}%`;
        } else {
            document.getElementById('stat-avg-margin').textContent = '0%';
        }
    } else {
        document.getElementById('stat-avg-margin').textContent = '0%';
    }

    // Render recent items
    renderRecentFilaments();
    renderRecentProducts();
}

// Render recent filaments on dashboard
function renderRecentFilaments() {
    const filaments = getFilaments().slice(0, 3);
    const container = document.getElementById('recent-filaments');

    if (filaments.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No filaments added yet</p></div>';
        return;
    }

    container.innerHTML = filaments.map(f => `
    <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
      <strong>${f.material} - ${f.color}</strong><br>
      <small style="color: var(--text-tertiary);">${f.spoolSize}g @ R${f.price}</small>
    </div>
  `).join('');
}

// Render recent products on dashboard
function renderRecentProducts() {
    const products = getProducts().slice(0, 3);
    const container = document.getElementById('recent-products');

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No products added yet</p></div>';
        return;
    }

    container.innerHTML = products.map(p => `
    <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
      <strong>${p.name}</strong><br>
      <small style="color: var(--text-tertiary);">${p.filamentUsed}g, ${p.printTime}h @ R${p.targetPrice}</small>
    </div>
  `).join('');
}

// Load sample data if no data exists
function loadSampleData() {
    const filaments = getFilaments();
    const products = getProducts();

    // Add sample filament if none exist
    if (filaments.length === 0) {
        const sampleFilament = {
            id: generateId(),
            material: 'PETG',
            color: 'Black',
            spoolSize: 1000,
            price: 300.00,
            diameter: '1.75',
            supplier: 'Creality',
            tempRange: '220-250',
            waste: 5,
            notes: 'Reliable material, consistent color, good layer adhesion',
            dateAdded: new Date().toISOString()
        };
        saveFilamentData(sampleFilament);
    }

    // Add sample product if none exist
    if (products.length === 0) {
        const filaments = getFilaments();
        if (filaments.length > 0) {
            const sampleProduct = {
                id: generateId(),
                name: '3D Printed Wallet',
                category: 'Accessories',
                length: 90,
                width: 110,
                height: 8,
                filamentUsed: 24,
                printTime: 2,
                filamentType: filaments[0].id,
                infill: 15,
                layerHeight: 0.2,
                supportRequired: 'Minimal',
                energyCost: 2.00,
                laborCost: 50.00,
                packagingCost: 8.00,
                shippingCost: 25.00,
                targetPrice: 130.00,
                competitorRange: 'R120-R180',
                notes: 'Strong demand on Etsy; customize with names for +30% margin',
                dateAdded: new Date().toISOString()
            };
            saveProductData(sampleProduct);
        }
    }
}

// Utility: Generate unique ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Utility: Get filaments from localStorage
function getFilaments() {
    return JSON.parse(localStorage.getItem('filaments') || '[]');
}

// Utility: Get products from localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

// Utility: Format currency
function formatCurrency(value) {
    return `R${parseFloat(value).toFixed(2)}`;
}

// Utility: Format percentage
function formatPercent(value) {
    return `${parseFloat(value).toFixed(1)}%`;
}
