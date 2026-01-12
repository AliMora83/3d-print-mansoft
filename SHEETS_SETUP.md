# Google Sheets Setup - Simple Guide

Since only you will be accessing and updating the sheet, we'll use the simplest approach possible.

## Quick Setup (5 minutes)

### Step 1: Create Your Google Sheet

1. Go to the Google Sheets tab that's already open (or visit https://sheets.google.com)
2. Click **"Blank spreadsheet"** (the big + button)
3. Name it: **"3D Print ManSoft Data"**
4. Create two sheets (tabs at the bottom):
   - Rename "Sheet1" to **"Filaments"**
   - Click the + button to add a new sheet, name it **"Products"**

### Step 2: Get Your Spreadsheet ID

1. Look at the URL of your Google Sheet
2. It looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
3. Copy the **SPREADSHEET_ID_HERE** part (the long string between `/d/` and `/edit`)
4. **Save this somewhere** - you'll need it in Step 4

Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 3: Make Your Sheet Public for Editing

1. In your Google Sheet, click the **"Share"** button (top right)
2. Click **"Change to anyone with the link"**
3. In the dropdown, select **"Editor"** (not "Viewer")
4. Click **"Done"**

⚠️ **Important**: This makes the sheet editable by anyone with the link. Only share the link with people you trust, or keep it private.

### Step 4: Update Your App Configuration

1. Open the file: `sheets-integration.js` in your code editor
2. Find this section at the top (around line 6):

```javascript
const SHEETS_CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  API_KEY: 'YOUR_API_KEY_HERE',
  FILAMENTS_SHEET: 'Filaments',
  PRODUCTS_SHEET: 'Products'
};
```

3. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID from Step 2
4. For the API_KEY, we'll use a public API key (no authentication needed since the sheet is public)

**Get a Google API Key:**
- Go to https://console.cloud.google.com/apis/credentials
- Click **"Create Credentials"** → **"API Key"**
- Copy the API key
- Click **"Restrict Key"** (recommended)
  - Under "API restrictions", select "Restrict key"
  - Check only **"Google Sheets API"**
  - Click "Save"

5. Replace `YOUR_API_KEY_HERE` with your actual API key

Your config should now look like:
```javascript
const SHEETS_CONFIG = {
  SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  API_KEY: 'AIzaSyD1234567890abcdefghijklmnopqrstuv',
  FILAMENTS_SHEET: 'Filaments',
  PRODUCTS_SHEET: 'Products'
};
```

6. Save the file

### Step 5: Enable Google Sheets API

1. Go to https://console.cloud.google.com/apis/library
2. Search for **"Google Sheets API"**
3. Click on it
4. Click **"Enable"**
5. Wait for it to enable (takes a few seconds)

### Step 6: Test It!

1. Refresh your app in the browser
2. Open the browser console (F12)
3. You should see: `"Auto-sync enabled - data will sync to Google Sheets every 30 seconds"`
4. Add a new filament or product
5. Wait 30 seconds
6. Check your Google Sheet - the data should appear!

## Troubleshooting

### "Google Sheets not configured" message
- Make sure you replaced BOTH the SPREADSHEET_ID and API_KEY
- Make sure you saved the `sheets-integration.js` file
- Refresh the browser

### "API key not valid" error
- Make sure you enabled the Google Sheets API (Step 5)
- Make sure your API key is restricted to only Google Sheets API
- Try creating a new API key

### Data not appearing in sheet
- Check browser console for errors (F12)
- Make sure the sheet is set to "Editor" permissions (not "Viewer")
- Make sure the sheet names are exactly "Filaments" and "Products"

### Want to disable sync?
- Just change the SPREADSHEET_ID back to `'YOUR_SPREADSHEET_ID_HERE'`
- The app will work with localStorage only

## Security Note

Since your sheet is public (anyone with link can edit), consider:
- Don't share the sheet URL publicly
- Use this for personal/development purposes
- For production, consider implementing proper authentication

## Next Steps

Once it's working:
- Your data will auto-sync every 30 seconds
- You can edit data directly in Google Sheets
- Changes in the sheet will load when you refresh the app
- You have automatic cloud backup of all your data!
