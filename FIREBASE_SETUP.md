# Firebase Setup Guide

## Step 1: Create Firebase Project (5 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Create a new project**:
   - Click "Add project"
   - Project name: `3d-print-mansoft` (or your preferred name)
   - Click "Continue"
   - Disable Google Analytics (optional for this project)
   - Click "Create project"
   - Wait for project creation (takes ~30 seconds)

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar

2. Click **"Create database"**

3. **Security rules**: Select **"Start in test mode"** (we'll configure proper rules later)
   - Test mode allows read/write access for 30 days
   - We'll add proper security rules in the code

4. **Location**: Choose the closest region to you:
   - For South Africa: `europe-west1` (Belgium) or `europe-west3` (Frankfurt)
   - Click "Enable"
   - Wait for database creation (~1 minute)

## Step 3: Register Web App

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"

2. Click **"Project settings"**

3. Scroll down to **"Your apps"** section

4. Click the **Web icon** (`</>`) to add a web app

5. **Register app**:
   - App nickname: `3D Print ManSoft Web`
   - ✅ Check "Also set up Firebase Hosting" (optional, for future deployment)
   - Click "Register app"

6. **Copy your Firebase configuration**:
   - You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

7. **IMPORTANT**: Copy this entire `firebaseConfig` object and paste it in chat

8. Click "Continue to console"

## Step 4: Provide Configuration

Once you've completed the above steps, paste your `firebaseConfig` object in chat, and I'll integrate it into your application.

---

## What Happens Next

After you provide the configuration, I will:
1. ✅ Add Firebase SDK to your HTML
2. ✅ Create Firebase configuration file
3. ✅ Implement Firestore service layer
4. ✅ Migrate filament and product managers to use Firestore
5. ✅ Create data migration utility
6. ✅ Test everything thoroughly

---

## Security Note

The configuration you'll share contains your API key, which is **safe to expose** in client-side code. Firebase uses security rules (not the API key) to protect your data. We'll configure proper security rules to ensure only authorized access.
