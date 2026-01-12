# 3D Printing Spec System

A centralized knowledge base and calculation engine that enables rapid financial analysis of 3D printed products.

## Features

- 📊 **Filament Database** - Track all your filament spools with costs and specifications
- 🎨 **Product Database** - Manage 3D printed products with production metrics
- 💰 **Cost Calculator** - Instant financial analysis with multiple pricing scenarios
- 📄 **PDF Reports** - Generate professional financial reports
- 🌙 **Premium Black & Gold Theme** - Beautiful, modern interface with glassmorphism
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ☁️ **Google Sheets Sync** - Optional cloud storage with auto-sync every 30 seconds
- 💾 **Local Storage** - Works offline with browser localStorage

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy (no build step required)

Or use Netlify CLI:
```bash
netlify deploy --prod
```

## Usage

### 1. Add Filament Spools
Navigate to the **Filaments** section and add your filament spools with:
- Material type (PLA, PETG, TPU, etc.)
- Spool size and cost
- Supplier information

### 2. Add Products
Navigate to the **Products** section and add your 3D printed items with:
- Dimensions and weight
- Filament usage (from slicer)
- Print time
- Production costs

### 3. Generate Reports
Navigate to the **Reports** section:
- Select a filament
- Select a product
- Adjust pricing scenarios
- Generate PDF report

## Data Management

### Local Storage (Default)
Data is stored locally in your browser using localStorage. To backup or share:

- **Export**: Download all data as JSON
- **Import**: Upload previously exported JSON file

### Google Sheets Sync (Optional)
For cloud storage and backup, you can sync your data to Google Sheets:

1. Follow the setup guide in [SHEETS_SETUP.md](SHEETS_SETUP.md)
2. Create a Google Sheet with two tabs: "Filaments" and "Products"
3. Get your Spreadsheet ID and API Key
4. Update the configuration in `sheets-integration.js`
5. Data will auto-sync every 30 seconds

**Benefits of Google Sheets sync:**
- ✅ Cloud backup of all your data
- ✅ Access from multiple devices
- ✅ Edit data directly in Google Sheets
- ✅ Share with team members
- ✅ Export to Excel/CSV easily

## Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: Browser localStorage
- **PDF Generation**: jsPDF
- **Hosting**: Netlify

## Sample Data

The app comes pre-loaded with sample data:
- **Filament**: Creality PETG Black 1kg (R300)
- **Product**: 3D Printed Wallet (24g, 2h print time)

## License

MIT
