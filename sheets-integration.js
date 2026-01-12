// Google Sheets Integration
// Syncs filament and product data with Google Sheets

// Configuration
const SHEETS_CONFIG = {
    // Your Google Sheets configuration
    SPREADSHEET_ID: '1OUAoRBf8YKXhKyFJ4P-xgNcZkGP8Bopy_fi4qP7IWRs',
    API_KEY: 'AIzaSyBAs_uMnwttHlr5sbN7XB4t87ge-Z-Z_3E',
    FILAMENTS_SHEET: 'Filaments',
    PRODUCTS_SHEET: 'Products'
};

// Check if Google Sheets API is configured
function isSheetsConfigured() {
    return SHEETS_CONFIG.SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE' &&
        SHEETS_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE';
}

// Load Google Sheets API
function loadSheetsAPI() {
    return new Promise((resolve, reject) => {
        if (window.gapi) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client', () => {
                gapi.client.init({
                    apiKey: SHEETS_CONFIG.API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                }).then(resolve, reject);
            });
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Sync filaments to Google Sheets
async function syncFilamentsToSheets() {
    if (!isSheetsConfigured()) {
        console.log('Google Sheets not configured, using localStorage only');
        return;
    }

    try {
        await loadSheetsAPI();
        const filaments = getFilaments();

        // Prepare data for sheets
        const values = [
            ['ID', 'Material', 'Color', 'Spool Size', 'Price', 'Diameter', 'Supplier', 'Temp Range', 'Waste %', 'Cost Per Gram', 'Notes', 'Date Added']
        ];

        filaments.forEach(f => {
            values.push([
                f.id,
                f.material,
                f.color,
                f.spoolSize,
                f.price,
                f.diameter,
                f.supplier || '',
                f.tempRange || '',
                f.waste,
                f.costPerGram,
                f.notes || '',
                f.dateAdded
            ]);
        });

        // Update sheet
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
            range: `${SHEETS_CONFIG.FILAMENTS_SHEET}!A1`,
            valueInputOption: 'RAW',
            resource: { values }
        });

        console.log('Filaments synced to Google Sheets');
    } catch (error) {
        console.error('Error syncing filaments to Sheets:', error);
    }
}

// Sync products to Google Sheets
async function syncProductsToSheets() {
    if (!isSheetsConfigured()) {
        console.log('Google Sheets not configured, using localStorage only');
        return;
    }

    try {
        await loadSheetsAPI();
        const products = getProducts();

        // Prepare data for sheets
        const values = [
            ['ID', 'Name', 'Category', 'Length', 'Width', 'Height', 'Filament Used', 'Print Time', 'Filament Type', 'Infill', 'Layer Height', 'Support Required', 'Energy Cost', 'Labor Cost', 'Packaging Cost', 'Shipping Cost', 'Target Price', 'Competitor Range', 'Notes', 'Date Added']
        ];

        products.forEach(p => {
            values.push([
                p.id,
                p.name,
                p.category,
                p.length || '',
                p.width || '',
                p.height || '',
                p.filamentUsed,
                p.printTime,
                p.filamentType,
                p.infill,
                p.layerHeight,
                p.supportRequired,
                p.energyCost,
                p.laborCost,
                p.packagingCost,
                p.shippingCost,
                p.targetPrice,
                p.competitorRange || '',
                p.notes || '',
                p.dateAdded
            ]);
        });

        // Update sheet
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
            range: `${SHEETS_CONFIG.PRODUCTS_SHEET}!A1`,
            valueInputOption: 'RAW',
            resource: { values }
        });

        console.log('Products synced to Google Sheets');
    } catch (error) {
        console.error('Error syncing products to Sheets:', error);
    }
}

// Load filaments from Google Sheets
async function loadFilamentsFromSheets() {
    if (!isSheetsConfigured()) {
        return;
    }

    try {
        await loadSheetsAPI();

        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
            range: `${SHEETS_CONFIG.FILAMENTS_SHEET}!A2:L`
        });

        const rows = response.result.values || [];
        const filaments = rows.map(row => ({
            id: row[0],
            material: row[1],
            color: row[2],
            spoolSize: parseFloat(row[3]),
            price: parseFloat(row[4]),
            diameter: row[5],
            supplier: row[6],
            tempRange: row[7],
            waste: parseFloat(row[8]),
            costPerGram: parseFloat(row[9]),
            notes: row[10],
            dateAdded: row[11]
        }));

        localStorage.setItem('filaments', JSON.stringify(filaments));
        console.log('Filaments loaded from Google Sheets');
        return filaments;
    } catch (error) {
        console.error('Error loading filaments from Sheets:', error);
        return getFilaments();
    }
}

// Load products from Google Sheets
async function loadProductsFromSheets() {
    if (!isSheetsConfigured()) {
        return;
    }

    try {
        await loadSheetsAPI();

        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
            range: `${SHEETS_CONFIG.PRODUCTS_SHEET}!A2:T`
        });

        const rows = response.result.values || [];
        const products = rows.map(row => ({
            id: row[0],
            name: row[1],
            category: row[2],
            length: parseFloat(row[3]) || 0,
            width: parseFloat(row[4]) || 0,
            height: parseFloat(row[5]) || 0,
            filamentUsed: parseFloat(row[6]),
            printTime: parseFloat(row[7]),
            filamentType: row[8],
            infill: parseFloat(row[9]),
            layerHeight: parseFloat(row[10]),
            supportRequired: row[11],
            energyCost: parseFloat(row[12]),
            laborCost: parseFloat(row[13]),
            packagingCost: parseFloat(row[14]),
            shippingCost: parseFloat(row[15]),
            targetPrice: parseFloat(row[16]),
            competitorRange: row[17],
            notes: row[18],
            dateAdded: row[19]
        }));

        localStorage.setItem('products', JSON.stringify(products));
        console.log('Products loaded from Google Sheets');
        return products;
    } catch (error) {
        console.error('Error loading products from Sheets:', error);
        return getProducts();
    }
}

// Auto-sync on data changes
function enableAutoSync() {
    if (!isSheetsConfigured()) {
        console.log('Google Sheets not configured. Data will be stored locally only.');
        console.log('To enable Google Sheets sync:');
        console.log('1. Create a Google Sheet');
        console.log('2. Get your Spreadsheet ID from the URL');
        console.log('3. Create a Google API key');
        console.log('4. Update SHEETS_CONFIG in sheets-integration.js');
        return;
    }

    // Sync every 30 seconds
    setInterval(() => {
        syncFilamentsToSheets();
        syncProductsToSheets();
    }, 30000);

    console.log('Auto-sync enabled - data will sync to Google Sheets every 30 seconds');
}
