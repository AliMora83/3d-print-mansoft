# 3D Printing Spec System

A centralized knowledge base and calculation engine that enables rapid financial analysis of 3D printed products.

## 🚀 Live Demo

**[View Live Application](https://3dprintmansoft.netlify.app/)**

## Features

- 📊 **Filament Database** - Track all your filament spools with costs and specifications
- 🎨 **Product Database** - Manage 3D printed products with production metrics
- 💰 **Cost Calculator** - Instant financial analysis with multiple pricing scenarios
- 📄 **PDF Reports** - Generate professional financial reports
- 🌙 **Premium Black & Gold Theme** - Beautiful, modern interface with glassmorphism
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ☁️ **Firebase Firestore** - Cloud database with real-time synchronization
- ⚡ **Real-time Sync** - Changes appear instantly across all devices
- 🔄 **Offline Support** - Works without internet, syncs when online
- 💾 **Automatic Backups** - Your data is safely stored in Google Cloud

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

### Firebase Firestore (Cloud Database)
Your data is automatically stored in Firebase Firestore, Google's cloud database:

- ✅ **Real-time Sync** - Changes appear instantly across all devices
- ✅ **Offline Support** - Works without internet, syncs automatically when online
- ✅ **Automatic Backups** - Data stored securely in Google Cloud
- ✅ **Multi-device Access** - Access from phone, tablet, or desktop
- ✅ **Scalable** - Handles thousands of items efficiently

### Data Migration
If you have existing data in localStorage, the app will automatically prompt you to migrate it to Firestore on first load.

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
